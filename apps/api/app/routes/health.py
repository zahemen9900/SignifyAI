from fastapi import APIRouter

router = APIRouter(tags=["health"])


@router.get("/health", summary="Service health probe")
async def healthcheck() -> dict[str, str]:
  return {"status": "ok"}
