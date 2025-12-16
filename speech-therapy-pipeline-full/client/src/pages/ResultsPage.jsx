import { useLocation, useNavigate } from "react-router-dom";

export default function ResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const therapy = state?.therapy_output ?? "No therapy output.";
  const events = state?.detected_events ?? [];
  const promptUsed = state?.prompt_used ?? "";

  return (
    <div style={{ fontFamily: "system-ui, Arial", padding: 32, maxWidth: 900, margin: "0 auto" }}>
      <h2>Results</h2>

      <div style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Custom therapy exercise</h3>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>{therapy}</pre>
      </div>

      <div style={{ marginTop: 18, padding: 16, border: "1px solid #e5e7eb", borderRadius: 12 }}>
        <h3 style={{ marginTop: 0 }}>Detected dysfluency events (YOLO-Stutter)</h3>
        <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
{JSON.stringify(events, null, 2)}
        </pre>
      </div>

      <details style={{ marginTop: 18 }}>
        <summary style={{ cursor: "pointer" }}>Show prompt engineering</summary>
        <pre style={{ whiteSpace: "pre-wrap" }}>{promptUsed}</pre>
      </details>

      <button
        onClick={() => navigate("/")}
        style={{ marginTop: 20, padding: "10px 14px", fontWeight: 600 }}
      >
        Record Again
      </button>
    </div>
  );
}
