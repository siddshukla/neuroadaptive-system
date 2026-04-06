import React, { useState, useCallback } from "react";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import { toast } from "react-toastify";
import Results from "../components/Results";

const API = "http://localhost:4000";
const STATES = [
  { id: "normal",   icon: "😐", name: "Normal",   desc: "Balanced activity" },
  { id: "stressed", icon: "😤", name: "Stressed",  desc: "High beta waves" },
  { id: "relaxed",  icon: "😌", name: "Relaxed",   desc: "Alpha dominant" },
  { id: "fatigued", icon: "😴", name: "Fatigued",  desc: "Theta/delta heavy" },
];

const Analyze = () => {
  const [mode, setMode] = useState("demo");
  const [dState, setDState] = useState("normal");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const onDrop = useCallback(a => { if (a[0]) setFile(a[0]); }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "text/csv": [".csv"], "application/octet-stream": [".npy"] }, maxFiles: 1 });

  const runDemo = async () => {
    setLoading(true); setResults(null);
    try { const r = await axios.post(API + "/api/analyze/demo", { state: dState }); setResults(r.data); toast.success("Analysis complete! 🧠"); }
    catch (e) { toast.error(e.response?.data?.message || "Analysis failed"); }
    finally { setLoading(false); }
  };

  const runUpload = async () => {
    if (!file) { toast.warning("Select a file first"); return; }
    setLoading(true); setResults(null);
    try {
      const form = new FormData(); form.append("eeg", file);
      const r = await axios.post(API + "/api/analyze/upload", form, { headers: { "Content-Type": "multipart/form-data" } });
      setResults(r.data); toast.success("File analyzed! ✅");
    }
    catch (e) { toast.error(e.response?.data?.message || "Upload failed"); }
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">EEG <em>Brain Analysis</em></h1>
        <p className="page-subtitle">Upload real EEG data or simulate a brain state demo</p>
      </div>

      <div className="tab-bar anim" style={{ maxWidth: 380 }}>
        <button className={"tab-btn" + (mode === "demo" ? " active" : "")} onClick={() => setMode("demo")}>🎮 Demo Simulation</button>
        <button className={"tab-btn" + (mode === "upload" ? " active" : "")} onClick={() => setMode("upload")}>📁 Upload EEG File</button>
      </div>

      <div className="grid-2 anim-1" style={{ marginBottom: 22 }}>
        <div className="card card-glow">
          {mode === "demo" ? (
            <>
              <div className="chart-head" style={{ marginBottom: 12 }}>
                <div><div className="chart-title">🎮 Demo Mode</div><div className="chart-sub">Simulate a real brain state — no hardware needed</div></div>
              </div>
              <div className="state-grid">
                {STATES.map(s => (
                  <div key={s.id} className={"state-btn" + (dState === s.id ? " selected" : "")} onClick={() => setDState(s.id)}>
                    <span className="s-icon">{s.icon}</span>
                    <div className="s-name">{s.name}</div>
                    <div className="s-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full" onClick={runDemo} disabled={loading} style={{ marginTop: 12 }}>
                {loading ? <><span className="spinner spinner-sm" />Analyzing…</> : "✦ Run Analysis"}
              </button>
            </>
          ) : (
            <>
              <div className="chart-head" style={{ marginBottom: 12 }}>
                <div><div className="chart-title">📁 Upload EEG File</div><div className="chart-sub">Supports .csv and .npy formats</div></div>
              </div>
              <div {...getRootProps()} className={"upload-zone" + (isDragActive ? " active" : "")}>
                <input {...getInputProps()} />
                <span className="u-icon">{file ? "✅" : "📂"}</span>
                {file ? <><h3>{file.name}</h3><p>{(file.size / 1024).toFixed(1)} KB · Click to change</p></>
                  : isDragActive ? <><h3>Drop here</h3><p>Release to upload</p></>
                  : <><h3>Drag & drop your EEG file</h3><p>or click to browse · .csv or .npy</p></>}
              </div>
              <button className="btn btn-primary btn-full" onClick={runUpload} disabled={loading || !file} style={{ marginTop: 14 }}>
                {loading ? <><span className="spinner spinner-sm" />Processing…</> : "🔬 Analyze File"}
              </button>
            </>
          )}
        </div>

        <div className="card card-glow">
          <div className="chart-head" style={{ marginBottom: 14 }}>
            <div><div className="chart-title">📊 Detection Capabilities</div><div className="chart-sub">Powered by trained model · 98.83% accuracy</div></div>
            <span className="badge badge-green">Live</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { icon: "😤", label: "Stress Level",        sub: "5 levels: Low → Severe",     color: "#f87171" },
              { icon: "😰", label: "Anxiety Detection",   sub: "4 levels: None → High",       color: "#f97316" },
              { icon: "🎯", label: "Focus Score",         sub: "5 levels: Very Low → Hyper",  color: "#818cf8" },
              { icon: "💤", label: "Mental Fatigue",      sub: "4 levels: Fresh → Severe",    color: "#f59e0b" },
              { icon: "🔥", label: "Burnout Risk",        sub: "Low / Moderate / High",        color: "#f87171" },
              { icon: "⚡", label: "Cognitive Overload",  sub: "Probability %",                color: "#22d3ee" },
              { icon: "💙", label: "Emotional Stability", sub: "Score 0 – 100",               color: "#34d399" },
              { icon: "🔮", label: "Future Forecast",     sub: "Next 4-minute prediction",    color: "#a5b4fc" },
            ].map(({ icon, label, sub, color }) => (
              <div key={label} style={{ display: "flex", gap: 10, alignItems: "center", padding: "9px 11px", background: "rgba(255,255,255,0.02)", borderRadius: 9, border: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ fontSize: "1.1rem", minWidth: 24, textAlign: "center" }}>{icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</div>
                  <div style={{ fontSize: "0.68rem", color: "#3d5470", marginTop: 1 }}>{sub}</div>
                </div>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}`, flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading && (
        <div className="card card-glow" style={{ marginBottom: 22 }}>
          <div className="loading-wrap" style={{ padding: 40 }}>
            <div className="spinner" />
            <p className="loading-text">Extracting brainwave features…</p>
            <p style={{ fontSize: "0.75rem", color: "#3d5470", marginTop: -10 }}>FFT analysis · Band power · AI prediction</p>
          </div>
        </div>
      )}

      {results && !loading && (
        <div className="anim">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <h2 style={{ fontSize: "clamp(1rem,3vw,1.2rem)", fontWeight: 800, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              ✅ Analysis Results
              {results.predictions?.model_used && <span className="badge badge-green">{results.predictions.model_used}</span>}
            </h2>
            <button className="btn btn-ghost" onClick={() => setResults(null)}>✕ Clear</button>
          </div>
          <Results data={results} />
        </div>
      )}
    </div>
  );
};
export default Analyze;
