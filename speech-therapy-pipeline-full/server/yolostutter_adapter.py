import os
from typing import Any, Dict, List

YOLO_ROOT = os.path.join(os.path.dirname(__file__), "third_party", "YOLO-Stutter")

def run_yolostutter_inference(wav_path: str) -> List[Dict[str, Any]]:
    # NOTE:
    # Upstream YOLO-Stutter requires external checkpoints and provides inference via a notebook.
    # This adapter is where you connect their real inference.
    #
    # Until you wire it, we return deterministic dummy events so the full web app runs end-to-end.
    if not os.path.isdir(YOLO_ROOT):
        # keep app runnable, but be explicit in events
        return [
            {"label": "needs_yolo_setup", "start": 0.0, "end": 0.0, "confidence": 0.0,
             "note": "Clone YOLO-Stutter into server/third_party/YOLO-Stutter and wire adapter."}
        ]

    # TODO: Replace with real YOLO-Stutter inference.
    return [
        {"label": "block", "start": 1.20, "end": 1.55, "confidence": 0.80},
        {"label": "prolongation", "start": 3.00, "end": 3.35, "confidence": 0.74},
    ]
