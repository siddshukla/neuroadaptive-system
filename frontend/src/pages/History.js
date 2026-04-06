import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Results from "../components/Results";

const API = "http://localhost:4000";
const sc = s => s < 25 ? "#34d399" : s < 50 ? "#f59e0b" : s < 75 ? "#f97316" : "#f87171";

const History = () => {
  const [history, setHistory] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(API + "/api/history").then(r => setHistory(r.data)).finally(() => setLoading(false));
  }, []);

  const load = async id => {
    if (selected === id) { setSelected(null); setDetail(null); return; }
    try { const r = await axios.get(API + "/api/history/" + id); setDetail(r.data); setSelected(id); }
    catch { toast.error("Failed to load"); }
  };

  const del = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this session?")) return;
    try {
      await axios.delete(API + "/api/history/" + id);
      setHistory(h => h.filter(x => x._id !== id));
      if (selected === id) { setSelected(null); setDetail(null); }
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p className="loading-text">Loading history…</p></div>;

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Session <em>History</em></h1>
            <p className="page-subtitle">All past EEG analyses · tap any row to expand full results</p>
          </div>
          <span className="badge badge-blue">{history.length} sessions</span>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="card card-glow anim">
          <div className="empty">
            <span className="empty-icon">📭</span>
            <h3>No sessions yet</h3>
            <p>Run your first EEG analysis and it will appear here with full charts and metrics.</p>
          </div>
        </div>
      ) : (
        <div className="card card-glow anim" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date &amp; Time</th>
                  <th>Type</th>
                  <th>Stress</th>
                  <th>Anxiety</th>
                  <th>Focus</th>
                  <th>Fatigue</th>
                  <th>Burnout</th>
                  <th>Stability</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => {
                  const p = h.predictions;
                  const isExp = selected === h._id;
                  return (
                    <React.Fragment key={h._id}>
                      <tr onClick={() => load(h._id)} className={isExp ? "exp" : ""}>
                        <td style={{ color: "#3d5470", fontFamily: "JetBrains Mono,monospace", fontSize: "0.72rem" }}>{String(i + 1).padStart(2, "0")}</td>
                        <td style={{ color: "#8fa3c0", fontSize: "0.78rem", whiteSpace: "nowrap" }}>{new Date(h.createdAt).toLocaleString()}</td>
                        <td>
                          <span className={"badge " + (h.inputType === "demo" ? "badge-cyan" : "badge-blue")}>
                            {h.inputType === "demo" ? `🎮 ${h.inputState}` : `📁 ${h.filename || "File"}`}
                          </span>
                        </td>
                        <td style={{ color: sc(p?.stress?.score), fontWeight: 700, fontFamily: "JetBrains Mono,monospace" }}>{p?.stress?.score}%</td>
                        <td style={{ color: sc(p?.anxiety?.score), fontWeight: 700, fontFamily: "JetBrains Mono,monospace" }}>{p?.anxiety?.score}%</td>
                        <td style={{ color: "#818cf8", fontWeight: 700, fontFamily: "JetBrains Mono,monospace" }}>{p?.focus?.score}%</td>
                        <td style={{ color: sc(p?.fatigue?.score), fontWeight: 700, fontFamily: "JetBrains Mono,monospace" }}>{p?.fatigue?.score}%</td>
                        <td>
                          <span className={"badge " + (p?.burnout?.risk === "Low" ? "badge-green" : p?.burnout?.risk === "Moderate" ? "badge-yellow" : "badge-red")}>
                            {p?.burnout?.risk}
                          </span>
                        </td>
                        <td style={{ color: "#22d3ee", fontWeight: 700, fontFamily: "JetBrains Mono,monospace" }}>{p?.emotional_stability?.score}</td>
                        <td><button className="btn btn-danger" onClick={e => del(h._id, e)}>🗑</button></td>
                      </tr>
                      {isExp && detail && (
                        <tr>
                          <td colSpan={10} style={{ padding: "20px 16px", background: "rgba(7,13,28,0.85)", borderTop: "1px solid rgba(99,102,241,0.15)" }}>
                            <Results data={detail} />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default History;
