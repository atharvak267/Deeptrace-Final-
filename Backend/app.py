import os
import threading
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
from pipeline import run_pipeline

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    scan_id: str
    video_url: str
    athlete_name: str

@app.get("/")
def root():
    return {"status": "DeepTrace backend is running"}

@app.get("/healthz")
def health():
    return {"status": "ok"}

@app.post("/analyze/")
def analyze(request: AnalyzeRequest):
    thread = threading.Thread(
        target=run_pipeline,
        args=(request.scan_id, request.video_url, request.athlete_name)
    )
    thread.daemon = True
    thread.start()
    return {"status": "accepted", "message": "Pipeline started"}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)