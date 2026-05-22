from typing import List, Dict
from app.rag.vector_store import get_vector_store
from app.services.llm_factory import get_llm
from app.config import TOP_K_DOCS, SIMILARITY_THRESHOLD

RAG_PROMPT = """You are a helpful IT support agent at a company. Use the following knowledge base articles to draft a professional reply to the employee's support ticket.

IMPORTANT RULES:
- Base your reply ONLY on the provided knowledge base articles.
- If none of the articles are relevant to the ticket, respond with exactly: "I don't have specific guidance for this issue in our knowledge base. A support agent will review your ticket and respond shortly."
- Be concise, friendly, and actionable.
- Do not make up information not present in the articles.

Knowledge Base Articles:
{context}

---
Employee Ticket:
Title: {title}
Description: {description}

Draft Reply:"""


async def generate_draft_reply(title: str, description: str) -> Dict:
    vector_store = get_vector_store()

    if vector_store is None:
        return {
            "draft": "Knowledge base is not available. A support agent will review your ticket shortly.",
            "citations": [],
        }

    query = f"{title}\n{description}"

    # Retrieve top-k similar documents with scores
    docs_with_scores = vector_store.similarity_search_with_score(query, k=TOP_K_DOCS)

    # Filter by similarity threshold
    relevant_docs = [
        (doc, score) for doc, score in docs_with_scores
        if score <= SIMILARITY_THRESHOLD  # FAISS uses L2 distance; lower = more similar
    ]

    if not relevant_docs:
        return {
            "draft": "I don't have specific guidance for this issue in our knowledge base. A support agent will review your ticket and respond shortly.",
            "citations": [],
        }

    # Build context and collect citations
    context_parts = []
    citations = []
    seen_sources = set()

    for doc, _score in relevant_docs:
        source = doc.metadata.get("source", "Unknown Article")
        context_parts.append(f"[{source}]\n{doc.page_content}")
        if source not in seen_sources:
            citations.append(source)
            seen_sources.add(source)

    context = "\n\n".join(context_parts)

    llm = get_llm()
    prompt = RAG_PROMPT.format(context=context, title=title, description=description)

    try:
        response = await llm.ainvoke(prompt)
        draft = response.content if hasattr(response, "content") else str(response)
        return {"draft": draft.strip(), "citations": citations}
    except Exception as e:
        print(f"[RAG] LLM error: {e}")
        return {
            "draft": "Unable to generate AI draft at this time. A support agent will respond shortly.",
            "citations": [],
        }
