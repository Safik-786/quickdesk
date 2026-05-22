import os
from pathlib import Path
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from app.config import KB_DIR, CHUNK_SIZE, CHUNK_OVERLAP
from app.services.llm_factory import get_embeddings
from app.rag.vector_store import set_vector_store


def load_knowledge_base() -> None:
    """Load all markdown KB articles, chunk them, embed, and store in FAISS."""
    kb_path = Path(KB_DIR)
    if not kb_path.exists():
        print(f"[KB Loader] KB directory not found: {kb_path}")
        return

    documents: list[Document] = []

    for md_file in sorted(kb_path.glob("*.md")):
        content = md_file.read_text(encoding="utf-8")
        # Use filename (without extension) as the article title/source
        source = md_file.stem.replace("-", " ").replace("_", " ").title()
        documents.append(Document(page_content=content, metadata={"source": source, "file": md_file.name}))

    if not documents:
        print("[KB Loader] No markdown files found in KB directory.")
        return

    print(f"[KB Loader] Loaded {len(documents)} KB articles.")

    # Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.split_documents(documents)
    print(f"[KB Loader] Split into {len(chunks)} chunks.")

    # Embed and store in FAISS
    embeddings = get_embeddings()
    vector_store = FAISS.from_documents(chunks, embeddings)
    set_vector_store(vector_store)
    print("[KB Loader] FAISS vector store ready.")
