import json
import os
import math
from django.core.management.base import BaseCommand

from rag_model.vector_store import VectorStore
from rag_model.local_models import LocalModelClient


def chunk_text(text: str, chunk_size: int = 800) -> list[str]:
    text = text.strip()
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start = end
    return chunks


class Command(BaseCommand):
    help = 'Ingest a text or JSONL file into the RAG FAISS vector store.'

    def add_arguments(self, parser):
        parser.add_argument('source', help='Path to a text file or JSONL with a "text" field')
        parser.add_argument('--index-dir', default='backend/rag_model/data', help='Directory to store index and metadata')

    def handle(self, *args, **options):
        src = options['source']
        index_dir = options['index_dir']
        os.makedirs(index_dir, exist_ok=True)

        lm = LocalModelClient()
        store = VectorStore(index_dir=index_dir)

        added = 0
        if src.endswith('.jsonl') or src.endswith('.ndjson'):
            with open(src, 'r', encoding='utf-8') as fh:
                for line in fh:
                    try:
                        obj = json.loads(line)
                    except Exception:
                        continue
                    text = obj.get('text') or obj.get('description') or obj.get('body') or ''
                    if not text:
                        continue
                    chunks = chunk_text(text)
                    embeddings = lm.embed_texts(chunks)
                    metas = [{'source': src, 'meta': obj.get('meta', {}), 'text': c} for c in chunks]
                    store.add_documents(embeddings, metas)
                    added += len(chunks)
        else:
            with open(src, 'r', encoding='utf-8') as fh:
                text = fh.read()
            chunks = chunk_text(text)
            embeddings = lm.embed_texts(chunks)
            metas = [{'source': src, 'meta': {}, 'text': c} for c in chunks]
            store.add_documents(embeddings, metas)
            added = len(chunks)

        self.stdout.write(self.style.SUCCESS(f'Ingested {added} chunks into index at {index_dir}'))
