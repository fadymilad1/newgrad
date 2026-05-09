import os
import json
import logging
import threading
import numpy as np
import faiss
from django.conf import settings
from .local_models import embed_texts, embed_query

logger = logging.getLogger(__name__)

class VectorStoreSingleton:
    _instance = None
    _lock = threading.Lock()

    def __new__(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(VectorStoreSingleton, cls).__new__(cls)
                cls._instance._initialize()
            return cls._instance

    def _initialize(self):
        """Initializes the FAISS index and metadata storage."""
        self.dimension = 384
        # File paths
        base_dir = getattr(settings, 'BASE_DIR', os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.index_path = os.path.join(base_dir, 'data', 'faiss_index_minilm.bin')
        self.metadata_path = os.path.join(base_dir, 'data', 'faiss_metadata_minilm.json')
        
        os.makedirs(os.path.dirname(self.index_path), exist_ok=True)
        
        self.index = None
        self.metadata = []
        
        self._load_index()

    def _load_index(self):
        """Loads index and metadata from disk, or creates a new one."""
        if os.path.exists(self.index_path) and os.path.exists(self.metadata_path):
            try:
                self.index = faiss.read_index(self.index_path)
                with open(self.metadata_path, 'r', encoding='utf-8') as f:
                    self.metadata = json.load(f)
                logger.info(f"Loaded FAISS index with {self.index.ntotal} vectors.")
            except Exception as e:
                logger.error(f"Failed to load FAISS index: {e}. Reinitializing.")
                self.index = faiss.IndexFlatL2(self.dimension)
                self.metadata = []
        else:
            logger.info("No existing FAISS index found. Initializing a new one.")
            self.index = faiss.IndexFlatL2(self.dimension)
            self.metadata = []

    def save_index(self):
        """Persists the index and metadata to disk."""
        with self._lock:
            try:
                faiss.write_index(self.index, self.index_path)
                with open(self.metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(self.metadata, f, indent=2)
                logger.info(f"Saved FAISS index with {self.index.ntotal} vectors.")
            except Exception as e:
                logger.error(f"Failed to save FAISS index: {e}")

    def add_chunks(self, chunks: list[dict]):
        """
        Adds chunks to the FAISS index.
        Each chunk is expected to be a dict: { "text": "...", "drug": "...", "section": "...", "source_id": "..." }
        """
        if not chunks:
            return

        texts = [chunk.get("text", "") for chunk in chunks]
        embeddings = embed_texts(texts)
        if not embeddings:
            return

        embeddings_np = np.array(embeddings, dtype=np.float32)
        # Normalization is technically done in embed_texts, but just to be sure:
        faiss.normalize_L2(embeddings_np)

        with self._lock:
            self.index.add(embeddings_np)
            self.metadata.extend(chunks)
            
        logger.info(f"Added {len(chunks)} chunks to FAISS index. Total: {self.index.ntotal}")

    def search(self, query: str, top_k: int = 4) -> list[tuple[dict, float]]:
        """
        Searches the FAISS index for the top_k most similar chunks.
        Returns a list of tuples: (metadata_dict, distance_score)
        """
        if self.index is None or self.index.ntotal == 0:
            logger.warning("Search called on an empty FAISS index.")
            return []

        embedding = embed_query(query)
        embedding_np = np.array([embedding], dtype=np.float32)
        faiss.normalize_L2(embedding_np)

        # Retrieve a bit more than top_k to allow for deduplication
        search_k = min(top_k * 3, self.index.ntotal)
        distances, indices = self.index.search(embedding_np, search_k)
        
        results = []
        seen_texts = set()
        
        for idx, dist in zip(indices[0], distances[0]):
            if idx == -1:
                continue
                
            meta = self.metadata[idx]
            text_snippet = meta.get("text", "")[:100] # Use first 100 chars for deduplication
            
            # Avoid duplicate or near-identical chunks
            if text_snippet not in seen_texts:
                seen_texts.add(text_snippet)
                results.append((meta, float(dist)))
                
            if len(results) >= top_k:
                break
                
        return results
