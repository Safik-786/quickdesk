from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routes import classify, draft_reply
from app.rag.loader import load_knowledge_base

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load and embed knowledge base on startup
    print("Loading knowledge base into vector store...")
    load_knowledge_base()
    print("Knowledge base ready.")
    yield

app = FastAPI(
    title="QuickDesk AI Service",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classify.router, prefix="", tags=["classify"])
app.include_router(draft_reply.router, prefix="", tags=["draft-reply"])

@app.get("/health")
def health():
    return {"status": "ok"}
