import time
import requests
import logging
from typing import List, Dict, Any
from django.core.management.base import BaseCommand
from rag_model.services.vector_store import VectorStoreSingleton

logger = logging.getLogger(__name__)

TARGET_DRUGS = [
    "ibuprofen",
    "amoxicillin",
    "paracetamol",
    "metformin",
    "omeprazole"
]

TARGET_SECTIONS = {
    "indications_and_usage": "indications",
    "warnings_and_cautions": "warnings",
    "adverse_reactions": "adverse reactions",
    "dosage_and_administration": "dosage",
    "contraindications": "contraindications",
    "pregnancy": "pregnancy",
    "nursing_mothers": "breastfeeding",
    "boxed_warning": "warnings"
}

class Command(BaseCommand):
    help = "Ingests openFDA drug label data, chunks it, and stores it in the FAISS vector database."

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1, help='Number of FDA records to fetch per drug')

    def handle(self, *args, **options):
        # Configure logging format for the command
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s [%(levelname)s] %(name)s: %(message)s'
        )
        
        limit = options['limit']
        store = VectorStoreSingleton()
        total_chunks_added = 0

        self.stdout.write(self.style.SUCCESS('Starting FDA data ingestion...'))

        for drug in TARGET_DRUGS:
            logger.info(f"Fetching data for: {drug}")
            records = self._fetch_drug_data(drug, limit=limit)
            
            if not records:
                logger.warning(f"No records found or failed to fetch for {drug}")
                continue
                
            for record in records:
                chunks = self._process_record(drug, record)
                if chunks:
                    store.add_chunks(chunks)
                    total_chunks_added += len(chunks)

        store.save_index()
        self.stdout.write(self.style.SUCCESS(f'Ingestion complete. Total chunks added: {total_chunks_added}'))

    def _fetch_drug_data(self, drug_name: str, limit: int = 1, max_retries: int = 3) -> List[Dict[str, Any]]:
        url = "https://api.fda.gov/drug/label.json"
        params = {
            "search": f"openfda.generic_name:\"{drug_name}\" OR openfda.brand_name:\"{drug_name}\"",
            "limit": limit
        }
        
        for attempt in range(1, max_retries + 1):
            try:
                response = requests.get(url, params=params, timeout=15)
                
                if response.status_code == 404:
                    logger.warning(f"Drug '{drug_name}' not found in openFDA.")
                    return []
                    
                response.raise_for_status()
                data = response.json()
                return data.get("results", [])
                
            except requests.exceptions.RequestException as e:
                logger.error(f"Attempt {attempt} failed for {drug_name}: {e}")
                if attempt < max_retries:
                    time.sleep(2 ** attempt)  # Exponential backoff
                else:
                    logger.error(f"Max retries reached for {drug_name}. Skipping.")
                    return []
        return []

    def _process_record(self, drug_name: str, record: Dict[str, Any]) -> List[Dict[str, str]]:
        chunks = []
        source_id = record.get("id", "unknown_id")
        
        for fda_field, human_section in TARGET_SECTIONS.items():
            if fda_field in record and record[fda_field]:
                # FDA API usually returns lists of strings for text sections
                content_list = record[fda_field]
                full_text = " ".join(content_list)
                
                section_chunks = self._chunk_text(full_text, max_length=3000)
                
                for chunk in section_chunks:
                    if len(chunk.strip()) > 50: # Ignore trivially small chunks
                        chunks.append({
                            "text": chunk.strip(),
                            "drug": drug_name.title(),
                            "section": human_section.title(),
                            "source_id": source_id
                        })
        return chunks

    def _chunk_text(self, text: str, max_length: int = 3000) -> List[str]:
        """
        Chunks text semantically, ensuring no chunk exceeds max_length.
        Prefers splitting by double newlines, then single newlines, then periods.
        """
        if len(text) <= max_length:
            return [text]

        chunks = []
        
        # Split by paragraph
        paragraphs = [p for p in text.split('\n\n') if p.strip()]
        
        current_chunk = ""
        
        for paragraph in paragraphs:
            if len(current_chunk) + len(paragraph) + 2 <= max_length:
                current_chunk += paragraph + "\n\n"
            else:
                # If current chunk is not empty, save it
                if current_chunk:
                    chunks.append(current_chunk.strip())
                    current_chunk = ""
                
                # If paragraph itself is too big, we must split by sentences
                if len(paragraph) > max_length:
                    sentences = [s + "." for s in paragraph.split('. ') if s.strip()]
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) + 1 <= max_length:
                            current_chunk += sentence + " "
                        else:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            
                            # If a single sentence is > max_length, force split (rare but possible)
                            if len(sentence) > max_length:
                                # Hard cut
                                current_chunk = ""
                                for i in range(0, len(sentence), max_length):
                                    chunks.append(sentence[i:i+max_length])
                            else:
                                current_chunk = sentence + " "
                else:
                    current_chunk = paragraph + "\n\n"
                    
        if current_chunk:
            chunks.append(current_chunk.strip())
            
        return chunks
