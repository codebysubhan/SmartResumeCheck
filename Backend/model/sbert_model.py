from sentence_transformers import SentenceTransformer
import numpy as np
import hashlib
import pickle
from pathlib import Path

CACHE_DIR = Path("Backend/cache/embeddings")

class SBERTModel:
    def __init__(self, model_name='all-MiniLM-L6-v2'):
        self.model = SentenceTransformer(model_name)
        CACHE_DIR.mkdir(parents=True, exist_ok=True)

    def _get_cache_key(self, text):
        return hashlib.md5(text.strip().lower().encode()).hexdigest()

    def _get_cache_path(self, key):
        return CACHE_DIR / f"{key}.pkl"

    def get_embedding(self, text):
        key = self._get_cache_key(text)
        path = self._get_cache_path(key)

        if path.exists():
            with open(path, "rb") as f:
                return pickle.load(f)
        
        embedding = self.model.encode(text, convert_to_numpy=True)
        with open(path, "wb") as f:
            pickle.dump(embedding, f)

        return embedding

    @staticmethod
    def cosine_similarity(vec1, vec2):
        if not vec1.any() or not vec2.any():
            return 0.0
        return float(np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2)))
