# DS440FinalProject

1) Clone YOLO-Stutter into `server/third_party/YOLO-Stutter`
2) Download the required upstream checkpoints into the locations their README expects
3) Wire the adapter (1 file) to call the upstream inference
Once these steps are complete the app will run end to end

## Quickstart

### A) Frontend (React)
```bash
cd client
npm install
npm run dev
```

### B) Backend (FastAPI + Conda env)
```bash
cd server
conda env create -f conda.yml
conda activate yolo-stutter-web
uvicorn app:app --reload --port 8000
```

Frontend: http://localhost:5173  
Backend: http://localhost:8000  

---

## Configure Gemini API
Set environment variable before starting the backend:

Mac/Linux:
```bash
export GEMINI_API_KEY="YOUR_KEY"
```

Windows (PowerShell):
```powershell
setx GEMINI_API_KEY "YOUR_KEY"
```

## YOLO-Stutter setup (to enable real inference)
```bash
cd server/third_party
git clone https://github.com/rorizzz/YOLO-Stutter.git
```

Then follow upstream README to download required models/checkpoints and build monotonic alignment.

