from langchain_community.vectorstores import FAISS
from typing import Optional

# Module-level singleton — loaded once at startup
_vector_store: Optional[FAISS] = None


def set_vector_store(store: FAISS) -> None:
    global _vector_store
    _vector_store = store


def get_vector_store() -> Optional[FAISS]:
    return _vector_store
