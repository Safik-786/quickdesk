import os
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")

# Which LLM provider to use: "openai" | "groq"
LLM_PROVIDER: str = os.getenv("LLM_PROVIDER", "groq")

# Model names
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama3-8b-8192")

# Embedding model (OpenAI)
EMBEDDING_MODEL: str = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")

# KB articles directory
KB_DIR: str = os.path.join(os.path.dirname(__file__), "..", "kb")

# RAG settings
CHUNK_SIZE: int = 300
CHUNK_OVERLAP: int = 50
TOP_K_DOCS: int = 3
SIMILARITY_THRESHOLD: float = 0.3

ALLOWED_CATEGORIES = ["IT", "HR", "Finance", "Admin", "Other"]
ALLOWED_PRIORITIES = ["Low", "Medium", "High"]
