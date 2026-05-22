from app.config import LLM_PROVIDER, OPENAI_API_KEY, GROQ_API_KEY, OPENAI_MODEL, GROQ_MODEL

def get_llm():
    """Return the configured LLM instance."""
    if LLM_PROVIDER == "openai":
        from langchain_openai import ChatOpenAI
        return ChatOpenAI(
            model=OPENAI_MODEL,
            api_key=OPENAI_API_KEY,
            temperature=0.2,
        )
    elif LLM_PROVIDER == "groq":
        from langchain_groq import ChatGroq
        return ChatGroq(
            model=GROQ_MODEL,
            api_key=GROQ_API_KEY,
            temperature=0.2,
        )
    else:
        raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")


def get_embeddings():
    """Return the configured embeddings instance."""
    # Always use OpenAI embeddings (free tier has generous limits)
    # Falls back to HuggingFace if no OpenAI key
    if OPENAI_API_KEY:
        from langchain_openai import OpenAIEmbeddings
        from app.config import EMBEDDING_MODEL
        return OpenAIEmbeddings(model=EMBEDDING_MODEL, api_key=OPENAI_API_KEY)
    else:
        from langchain_huggingface import HuggingFaceEmbeddings
        return HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
