import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const MAX_SECONDS = 10;

export default function RecordPage() {
  const [recording, setRecording] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(MAX_SECONDS);
  const [audioBlob, setAudioBlob] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);

  const navigate = useNavigate();

  const audioUrl = useMemo(() => {
    if (!audioBlob) return null;
    return URL.createObjectURL(audioBlob);
  }, [audioBlob]);

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecording(false);
    setSecondsLeft(MAX_SECONDS);
    cleanupStream();
  };

  const startRecording = async () => {
    try {
      setError("");
      setStatus("");
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream);
      recorderRef.current = mr;

      const chunks = [];
      mr.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };
      mr.onstop = () => {
        const blob = new Blob(chunks, { type: mr.mimeType || "audio/webm" });
        setAudioBlob(blob);
        setStatus("Recording complete. Click Process Recording.");
      };

      mr.start();
      setRecording(true);
      setStatus("Recording…");

      let remaining = MAX_SECONDS;
      setSecondsLeft(remaining);

      timerRef.current = setInterval(() => {
        remaining -= 1;
        setSecondsLeft(remaining);
        if (remaining <= 0) stopRecording();
      }, 1000);
    } catch (e) {
      console.error(e);
      setError("Microphone permission denied or not supported.");
      cleanupStream();
    }
  };

  const processRecording = async () => {
    if (!audioBlob) return;
    setProcessing(true);
    setError("");
    setStatus("Uploading + processing…");

    try {
      const fd = new FormData();
      fd.append("audio", audioBlob, "recording.webm");

      const res = await fetch("http://localhost:8000/api/process", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Backend error");
      }

      const data = await res.json();
      navigate("/results", { state: data });
    } catch (e) {
      console.error(e);
      setError(String(e.message || e));
      setStatus("");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ fontFamily: "system-ui, Arial", padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 4 }}>Personalized Speech Therapy</h2>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Record up to {MAX_SECONDS}s of speech, then process it to get a tailored therapy exercise.
      </p>

      <div style={{ display: "flex", gap: 16, alignItems: "center", margin: "24px 0" }}>
        {[
          ["1", "Input User Speech"],
          ["2", "SED Model (YOLO-Stutter)"],
          ["3", "Prompt Engineering"],
          ["4", "LLM (Gemini)"],
          ["5", "Custom Therapy"],
        ].map(([num, label], idx) => (
          <div key={num} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                border: "3px solid " + (idx === 0 ? "#b91c1c" : "#9ca3af"),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {num}
            </div>
            <div style={{ fontSize: 12, width: 120 }}>{label}</div>
            {idx < 4 && <div style={{ width: 40, height: 2, background: "#9ca3af" }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          onClick={startRecording}
          disabled={recording || processing}
          style={{ padding: "10px 14px", fontWeight: 600 }}
        >
          {recording ? "Recording…" : "Start Recording"}
        </button>

        <button
          onClick={stopRecording}
          disabled={!recording || processing}
          style={{ padding: "10px 14px", fontWeight: 600 }}
        >
          Stop
        </button>

        <button
          onClick={processRecording}
          disabled={!audioBlob || recording || processing}
          style={{ padding: "10px 14px", fontWeight: 600 }}
        >
          {processing ? "Processing…" : "Process Recording"}
        </button>

        {recording && (
          <span style={{ marginLeft: 8, fontVariantNumeric: "tabular-nums" }}>
            {secondsLeft}s left
          </span>
        )}
      </div>

      {audioUrl && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Preview</div>
          <audio controls src={audioUrl} />
        </div>
      )}

      {status && <p style={{ marginTop: 16 }}>{status}</p>}
      {error && <p style={{ marginTop: 16, color: "#b91c1c" }}>{error}</p>}

      <hr style={{ margin: "28px 0", opacity: 0.25 }} />

      <details>
        <summary style={{ cursor: "pointer" }}>Notes</summary>
        <ul>
          <li>Recording uses <code>MediaRecorder</code>; output is usually webm/ogg depending on browser.</li>
          <li>Backend converts to 16kHz mono WAV and enforces a 10s cap.</li>
          <li>YOLO-Stutter needs upstream repo + checkpoints; see <code>README.md</code>.</li>
        </ul>
      </details>
    </div>
  );
}
