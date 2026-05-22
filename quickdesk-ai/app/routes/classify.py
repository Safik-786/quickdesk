from fastapi import APIRouter
from pydantic import BaseModel
from app.services.classifier import classify_ticket

router = APIRouter()

class ClassifyRequest(BaseModel):
    title: str
    description: str

class ClassifyResponse(BaseModel):
    category: str
    priority: str

@router.post("/classify", response_model=ClassifyResponse)
async def classify(req: ClassifyRequest):
    result = await classify_ticket(req.title, req.description)
    return result
