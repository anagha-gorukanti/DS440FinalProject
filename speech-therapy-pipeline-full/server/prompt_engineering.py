from typing import Any, Dict, List
from collections import Counter

LABEL_TO_DESCRIPTION = {
    "block": "silent pause or difficulty initiating sound",
    "prolongation": "stretching a sound longer than typical",
    "repetition": "repeating a sound, syllable, or word",
    "missing": "omission of a sound/word",
    "replacement": "substituting one sound/word for another",
    "needs_yolo_setup": "YOLO-Stutter not installed yet",
}

def build_prompt_from_events(events: List[Dict[str, Any]]) -> str:
    counts = Counter([e.get("label", "unknown") for e in events])
    counts_str = ", ".join([f"{k}: {v}" for k, v in counts.items()]) or "none"

    bullets = []
    for e in events:
        label = e.get("label", "unknown")
        desc = LABEL_TO_DESCRIPTION.get(label, "speech dysfluency event")
        start = float(e.get("start", 0.0))
        end = float(e.get("end", 0.0))
        conf = e.get("confidence", None)
        conf_str = f"{conf}" if conf is not None else "n/a"
        bullets.append(f"- {label} ({desc}) at {start:.2f}s–{end:.2f}s, confidence={conf_str}")

    events_block = "\n".join(bullets) if bullets else "- (no events detected)"

    return f"""You are a certified speech-language pathologist (SLP).

Task:
Given dysfluency detection output, create a personalized, practical therapy plan that a user can follow at home.

Detected event summary:
{counts_str}

Detected events (time-aligned):
{events_block}

Requirements for your response:
- Give 3–5 exercises max.
- For each exercise: goal, how to do it, duration/reps, and a quick tip.
- Tailor the exercises to the detected dysfluency types (especially the most common types).
- Keep it supportive, simple, and actionable (no medical diagnosis claims).
- Output as clear bullet points.
"""
