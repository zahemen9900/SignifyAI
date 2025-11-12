from fastapi import FastAPI

from .routes import health, inference

app = FastAPI(title="SignifyAI Inference API", version="0.1.0")

app.include_router(health.router)
app.include_router(inference.router, prefix="/inference", tags=["inference"])
