from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.rag_service import generate_draft_reply

router = APIRouter()

class DraftReplyRequest(BaseModel):
    title: str
    description: str

class DraftReplyResponse(BaseModel):
    draft: str
    citations: List[str]

@router.post("/draft-reply", response_model=DraftReplyResponse)
async def draft_reply(req: DraftReplyRequest):
    result = await generate_draft_reply(req.title, req.description)
    return result
