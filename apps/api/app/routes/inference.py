from uuid import UUID, uuid4

from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


class PracticeFrame(BaseModel):
  timestamp_ms: int = Field(..., ge=0)
  keypoints: list[list[float]] = Field(..., min_items=1)


class PracticeRequest(BaseModel):
  user_id: UUID
  lesson_id: UUID | None = None
  mode: str = Field(..., pattern="^(word|sentence|freestyle)$")
  frames: list[PracticeFrame] = Field(..., min_items=1, max_items=1200)


class PracticeResponse(BaseModel):
  session_id: UUID
  score: float = Field(..., ge=0.0, le=100.0)
  feedback: str


@router.post("/score", response_model=PracticeResponse)
async def score_practice(payload: PracticeRequest) -> PracticeResponse:
  mock_score = 73.5
  feedback = "Mock feedback: inference pipeline not yet wired."
  return PracticeResponse(session_id=uuid4(), score=mock_score, feedback=feedback)
