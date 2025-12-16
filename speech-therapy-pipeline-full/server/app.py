import os
import tempfile
import subprocess
from typing import Any, Dict, List

import librosa
import soundfile as sf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from yolostutter_adapter import run_yolostutter_inference
from prompt_engineering import build_prompt_from_events
from gemini_client import generate_therapy_with_gemini

MAX_SECONDS = 10.0
TARGET_SR = 16000

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProcessResponse(BaseModel):
    therapy_output: str
    detected_events: List[Dict[str, Any]]
    prompt_used: str

@app.get("/health")
def health():
    return {"ok": True}

def _ffmpeg_to_wav_16k_mono(src_path: str, dst_path: str) -> None:
    cmd = [
        "ffmpeg", "-y",
        "-i", src_path,
        "-ac", "1",
        "-ar", str(TARGET_SR),
        "-vn",
        dst_path,
    ]
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        raise RuntimeError(f"ffmpeg failed: {p.stderr}")

@app.post("/api/process", response_model=ProcessResponse)
async def process(audio: UploadFile = File(...)):
    if not audio.filename:
        raise HTTPException(status_code=400, detail="Missing audio file")

    with tempfile.TemporaryDirectory() as td:
        raw_path = os.path.join(td, audio.filename)
        wav_path = os.path.join(td, "input.wav")

        data = await audio.read()
        with open(raw_path, "wb") as f:
            f.write(data)

        try:
            _ffmpeg_to_wav_16k_mono(raw_path, wav_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

        # enforce 10s cap
        try:
            y, sr = librosa.load(wav_path, sr=TARGET_SR, mono=True)
            max_samples = int(MAX_SECONDS * sr)
            if y.shape[0] > max_samples:
                y = y[:max_samples]
                sf.write(wav_path, y, sr)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Audio load failed: {e}")

        # 1) YOLO-Stutter inference
        try:
            events = run_yolostutter_inference(wav_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"YOLO-Stutter inference failed: {e}")

        # 2) Prompt engineering
        prompt = build_prompt_from_events(events)

        # 3) Gemini generation
        try:
            therapy = generate_therapy_with_gemini(prompt)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Gemini call failed: {e}")

        return ProcessResponse(
            therapy_output=therapy,
            detected_events=events,
            prompt_used=prompt,
        )
