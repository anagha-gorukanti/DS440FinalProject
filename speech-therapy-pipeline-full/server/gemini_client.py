import os
import google.generativeai as genai

MODEL_NAME = "gemini-1.5-flash"

def generate_therapy_with_gemini(prompt: str) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("Missing GEMINI_API_KEY environment variable.")
    genai.configure(api_key=api_key)

    model = genai.GenerativeModel(MODEL_NAME)
    resp = model.generate_content(prompt)
    text = getattr(resp, "text", None)
    if not text:
        text = str(resp)
    return text.strip()
