# YOLO-Stutter setup

1) Clone:
```bash
cd server/third_party
git clone https://github.com/rorizzz/YOLO-Stutter.git
```

2) Follow upstream README to download:
- VITS pretrained model
- YOLO-Stutter checkpoints
and build monotonic alignment.

3) Wire the adapter:
Edit `server/yolostutter_adapter.py` to call the upstream inference and return events as:
[
  {"label": "...", "start": 1.23, "end": 1.50, "confidence": 0.87},
  ...
]
