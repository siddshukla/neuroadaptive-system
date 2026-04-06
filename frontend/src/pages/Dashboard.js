import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from "chart.js";
import { useAuth } from "../context/AuthContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);
const API = "http://localhost:4000";
const sc = s => s < 25 ? "#34d399" : s < 50 ? "#f59e0b" : s < 75 ? "#f97316" : "#f87171";

const MetricCard = ({ label, value, sub, color, icon, pct, delay }) => (
  <div className={"metric-card anim-" + delay}>
    <div className="mc-glow" style={{ background: color }} />
    <div className="mc-top">
      <div className="mc-icon" style={{ background: color + "18", border: `1px solid ${color}30` }}>{icon}</div>
      <span className="badge" style={{ background: color + "15", color, border: `1px solid ${color}28`, fontSize: "0.62rem" }}>{sub}</span>
    </div>
    <div className="mc-label">{label}</div>
    <div className="mc-value" style={{ color }}>{value}</div>
    <div className="mc-bar">
      <div className="mc-bar-fill" style={{ width: (pct || 0) + "%", background: `linear-gradient(90deg,${color}55,${color})` }} />
    </div>
  </div>
);

const chartOpts = {
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: {
    legend: { labels: { color: "#8fa3c0", font: { size: 11, family: "Outfit" }, boxWidth: 12, padding: 14 } },
    tooltip: { backgroundColor: "rgba(11,18,38,0.97)", borderColor: "rgba(99,102,241,0.3)", borderWidth: 1, titleColor: "#e8edf5", bodyColor: "#8fa3c0", padding: 12, cornerRadius: 10 },
  },
  scales: {
    x: { ticks: { color: "#3d5470", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.03)" }, border: { display: false } },
    y: { min: 0, max: 100, ticks: { color: "#3d5470", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.035)" }, border: { display: false } },
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([axios.get(API + "/api/stats"), axios.get(API + "/api/history")])
      .then(([s, h]) => { setStats(s.data); setHistory(h.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-wrap"><div className="spinner" /><p className="loading-text">Loading dashboard…</p></div>;

  const latest = history[0];
  const p = latest?.predictions;
  const trend = stats?.trend || [];

  const chartData = {
    labels: trend.map((_, i) => "S" + (i + 1)),
    datasets: [
      { label: "Stress",  data: trend.map(t => t.stress),  borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.07)", borderWidth: 2, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#f87171" },
      { label: "Focus",   data: trend.map(t => t.focus),   borderColor: "#818cf8", backgroundColor: "rgba(129,140,248,0.07)", borderWidth: 2, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#818cf8" },
      { label: "Fatigue", data: trend.map(t => t.fatigue), borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.05)",  borderWidth: 2, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#f97316" },
      { label: "Anxiety", data: trend.map(t => t.anxiety), borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.05)",  borderWidth: 2, tension: 0.4, fill: true, pointRadius: 4, pointBackgroundColor: "#22d3ee" },
    ],
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Welcome back, <em>{user?.name?.split(" ")[0]}</em> 👋</h1>
            <p className="page-subtitle">Your real-time brain health overview · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigate("/analyze")}>+ New Analysis</button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 22 }}>
        <MetricCard delay={1} label="Total Sessions" value={stats?.total || 0} sub="Lifetime" color="#818cf8" icon="◈" pct={Math.min((stats?.total || 0) * 10, 100)} />
        <MetricCard delay={2} label="Stress Level" value={p ? p.stress?.score + "%" : "—"} sub={p?.stress?.label || "No data"} color={p ? sc(p.stress?.score) : "#3d5470"} icon="😤" pct={p?.stress?.score || 0} />
        <MetricCard delay={3} label="Focus Level" value={p ? p.focus?.score + "%" : "—"} sub={p?.focus?.label || "No data"} color="#818cf8" icon="🎯" pct={p?.focus?.score || 0} />
        <MetricCard delay={4} label="Stability" value={p ? p.emotional_stability?.score : "—"} sub="Score / 100" color="#22d3ee" icon="💙" pct={p?.emotional_stability?.score || 0} />
      </div>

      {history.length === 0 ? (
        <div className="card card-glow anim-2">
          <div className="empty">
            <span className="empty-icon">🧠</span>
            <h3>No analyses yet</h3>
            <p>Run your first EEG brain analysis to populate your dashboard with live brain state data.</p>
            <button className="btn btn-primary" style={{ width: "auto", display: "inline-flex" }} onClick={() => navigate("/analyze")}>
              ✦ Start First Analysis
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="card card-glow anim-2" style={{ marginBottom: 20 }}>
            <div className="chart-head">
              <div>
                <div className="chart-title">Brain State Trend</div>
                <div className="chart-sub">Stress · Focus · Fatigue · Anxiety across sessions</div>
              </div>
              <span className="badge badge-cyan">{trend.length} sessions</span>
            </div>
            <div className="chart-wrap" style={{ height: "clamp(180px,30vw,260px)" }}>
              <Line data={chartData} options={chartOpts} />
            </div>
          </div>

          {p && (
            <div className="grid-2 anim-3">
              <div className="card card-glow">
                <div className="sec-title">Latest Session</div>
                {[
                  { label: "😤 Stress",  val: p.stress?.score,  color: sc(p.stress?.score) },
                  { label: "😰 Anxiety", val: p.anxiety?.score, color: sc(p.anxiety?.score) },
                  { label: "🎯 Focus",   val: p.focus?.score,   color: "#818cf8" },
                  { label: "💤 Fatigue", val: p.fatigue?.score, color: sc(p.fatigue?.score) },
                ].map(({ label, val, color }) => (
                  <div key={label} className="prog-wrap">
                    <div className="prog-head">
                      <span className="prog-label">{label}</span>
                      <span className="prog-val" style={{ color }}>{val}%</span>
                    </div>
                    <div className="prog-track">
                      <div className="prog-fill" style={{ width: val + "%", background: `linear-gradient(90deg,${color}55,${color})` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="card card-glow">
                <div className="sec-title">Risk Indicators</div>
                {[
                  { label: "🔥 Burnout Risk",       val: p.burnout?.label,                          sub: `Score: ${p.burnout?.score}%`,   color: p.burnout?.risk === "Low" ? "#34d399" : p.burnout?.risk === "Moderate" ? "#f59e0b" : "#f87171" },
                  { label: "⚡ Cognitive Overload",  val: p.cognitive_overload?.probability + "%",   sub: "Overload probability",           color: sc(p.cognitive_overload?.probability) },
                  { label: "💙 Emotional Stability", val: p.emotional_stability?.score + " / 100",   sub: "Stability index",                color: "#22d3ee" },
                ].map(({ label, val, sub, color }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 14px", background: "rgba(255,255,255,0.02)", borderRadius: 11, border: "1px solid rgba(255,255,255,0.035)", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: "0.68rem", color: "#3d5470", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: "0.75rem", color: "#5a7090" }}>{sub}</div>
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 800, color, fontFamily: "JetBrains Mono,monospace" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
export default Dashboard;
