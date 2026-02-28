"""Femmestral API — multimodal women's health misinformation fact-checker."""

import hashlib
import os

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="Femmestral",
    description="Multimodal women's health misinformation fact-checker",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Health check ---

@app.get("/health")
def health_check():
    return {"status": "ok", "version": "0.1.0"}


# --- Text fact-check ---

class TextRequest(BaseModel):
    text: str

@app.post("/check/text")
async def check_text(request: TextRequest):
    """Fact-check a text message."""
    # TODO: wire up processors → reasoning → rag → safety → output pipeline
    return {"message": "not implemented yet", "input": request.text}


# --- Image fact-check ---

@app.post("/check/image")
async def check_image(file: UploadFile = File(...)):
    """Fact-check text extracted from an image/screenshot."""
    # TODO: process_image → detect_claims → fact_check → format_response
    return {"message": "not implemented yet", "filename": file.filename}


# --- Audio fact-check ---

@app.post("/check/audio")
async def check_audio(file: UploadFile = File(...)):
    """Fact-check a voice note."""
    # TODO: process_audio → detect_claims → fact_check → format_response
    return {"message": "not implemented yet", "filename": file.filename}


# --- Video fact-check ---

@app.post("/check/video")
async def check_video(file: UploadFile = File(...)):
    """Fact-check a video (extracts audio, then transcribes)."""
    # TODO: process_video → detect_claims → fact_check → format_response
    return {"message": "not implemented yet", "filename": file.filename}
