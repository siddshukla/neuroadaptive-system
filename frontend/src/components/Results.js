import React from "react";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Tooltip, Legend, Filler } from "chart.js";
import { Line, Bar, Radar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, RadialLinearScale, Tooltip, Legend, Filler);

const sc = s => s < 25 ? "#34d399" : s < 50 ? "#f59e0b" : s < 75 ? "#f97316" : "#f87171";
const bc = s => s < 25 ? "badge-green" : s < 50 ? "badge-yellow" : s < 75 ? "badge-orange" : "badge-red";

const Prog = ({ label, val, color }) => (
  <div className="prog-wrap">
    <div className="prog-head">
      <span className="prog-label">{label}</span>
      <span className="prog-val" style={{ color }}>{val}%</span>
    </div>
    <div className="prog-track">
      <div className="prog-fill" style={{ width: val + "%", background: `linear-gradient(90deg,${color}55,${color})` }} />
    </div>
  </div>
);

const TT = { backgroundColor: "rgba(11,18,38,0.97)", borderColor: "rgba(99,102,241,0.3)", borderWidth: 1, titleColor: "#e8edf5", bodyColor: "#8fa3c0", padding: 12, cornerRadius: 10 };
const baseOpts = {
  responsive: true, maintainAspectRatio: false,
  interaction: { mode: "index", intersect: false },
  plugins: { legend: { labels: { color: "#8fa3c0", font: { size: 11, family: "Outfit" }, boxWidth: 12, padding: 14 } }, tooltip: TT },
  scales: {
    x: { ticks: { color: "#3d5470", font: { size: 10 }, maxTicksLimit: 8 }, grid: { color: "rgba(255,255,255,0.03)" }, border: { display: false } },
    y: { ticks: { color: "#3d5470", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.035)" }, border: { display: false } },
  },
};

const Results = ({ data }) => {
  if (!data?.predictions) return null;
  const p = data.predictions;
  const signal = data.signal_preview || data.signalPreview || [];
  const bp = p.band_power || {};
  const fc = p.forecast || {};
  const burnC = p.burnout?.risk === "Low" ? "#34d399" : p.burnout?.risk === "Moderate" ? "#f59e0b" : "#f87171";

  return (
    <div>
      {/* 4 metric cards */}
      <div className="grid-4" style={{ marginBottom: 18 }}>
        {[
          { l: "😤 Stress",  v: p.stress?.score,  c: sc(p.stress?.score),  s: p.stress?.label },
          { l: "😰 Anxiety", v: p.anxiety?.score, c: sc(p.anxiety?.score), s: p.anxiety?.label },
          { l: "🎯 Focus",   v: p.focus?.score,   c: "#818cf8",             s: p.focus?.label },
          { l: "💤 Fatigue", v: p.fatigue?.score, c: sc(p.fatigue?.score), s: p.fatigue?.label },
        ].map(({ l, v, c, s }, i) => (
          <div key={l} className={"metric-card anim-" + (i + 1)} style={{ borderColor: c + "22" }}>
            <div className="mc-glow" style={{ background: c }} />
            <div className="mc-top">
              <div className="mc-icon" style={{ background: c + "16", border: `1px solid ${c}28` }}>{l.split(" ")[0]}</div>
              <span className={"badge " + bc(v)}>{s}</span>
            </div>
            <div className="mc-label">{l.slice(3)}</div>
            <div className="mc-value" style={{ color: c }}>{v}%</div>
            <div className="mc-bar"><div className="mc-bar-fill" style={{ width: v + "%", background: `linear-gradient(90deg,${c}55,${c})` }} /></div>
          </div>
        ))}
      </div>

      {/* Risk row */}
      <div className="grid-3" style={{ marginBottom: 18 }}>
        {[
          { l: "🔥 Burnout Risk",       big: p.burnout?.label,                         sub: `Score: ${p.burnout?.score}%`,  color: burnC },
          { l: "⚡ Cognitive Overload",  big: p.cognitive_overload?.probability + "%",  sub: "Overload probability",          color: sc(p.cognitive_overload?.probability) },
        ].map(({ l, big, sub, color }) => (
          <div key={l} className="card card-glow" style={{ textAlign: "center", borderColor: color + "22" }}>
            <div style={{ fontSize: "0.62rem", color: "#3d5470", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 10 }}>{l}</div>
            <div style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 800, color, fontFamily: "JetBrains Mono,monospace", lineHeight: 1.1 }}>{big}</div>
            <div style={{ fontSize: "0.75rem", color: "#5a7090", marginTop: 8 }}>{sub}</div>
          </div>
        ))}
        <div className="card card-glow">
          <div style={{ fontSize: "0.62rem", color: "#3d5470", textTransform: "uppercase", letterSpacing: "1px", textAlign: "center", marginBottom: 10 }}>💙 Emotional Stability</div>
          <div className="gauge-wrap">
            <div className="gauge-ring" style={{ "--pct": p.emotional_stability?.score, "--gc": p.emotional_stability?.score >= 60 ? "#34d399" : p.emotional_stability?.score >= 40 ? "#f59e0b" : "#f87171" }}>
              <div className="gauge-inner">
                <span className="gauge-val">{p.emotional_stability?.score}</span>
                <span className="gauge-unit">/ 100</span>
              </div>
            </div>
            <span className="gauge-label">Stability Index</span>
          </div>
        </div>
      </div>

      {/* Progress + Labels */}
      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card card-glow">
          <div className="sec-title">Mental State Breakdown</div>
          <Prog label="😤 Stress"              val={p.stress?.score}                   color={sc(p.stress?.score)} />
          <Prog label="😰 Anxiety"             val={p.anxiety?.score}                  color={sc(p.anxiety?.score)} />
          <Prog label="💤 Fatigue"             val={p.fatigue?.score}                  color={sc(p.fatigue?.score)} />
          <Prog label="🔥 Burnout"             val={p.burnout?.score}                  color={burnC} />
          <Prog label="⚡ Cognitive Overload"  val={p.cognitive_overload?.probability} color={sc(p.cognitive_overload?.probability)} />
        </div>
        <div className="card card-glow">
          <div className="sec-title">Positive Indicators</div>
          <Prog label="🎯 Focus"               val={p.focus?.score}                    color="#818cf8" />
          <Prog label="💙 Emotional Stability" val={p.emotional_stability?.score}      color="#22d3ee" />
          <div style={{ marginTop: 18 }}>
            <div className="sec-title">State Labels</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
              {[
                { v: p.stress?.score, l: p.stress?.label },
                { v: p.anxiety?.score, l: p.anxiety?.label },
                { v: null, l: p.focus?.label, cls: "badge-blue" },
                { v: p.fatigue?.score, l: p.fatigue?.label },
              ].map(({ v, l, cls }) => (
                <span key={l} className={"badge " + (cls || bc(v))}>{l}</span>
              ))}
            </div>
          </div>
          {p.emotion && (
            <div style={{ marginTop: 16, padding: "11px 13px", background: "rgba(99,102,241,0.06)", borderRadius: 11, border: "1px solid rgba(99,102,241,0.15)" }}>
              <div style={{ fontSize: "0.62rem", color: "#3d5470", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8 }}>AI Emotion Detection</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.4rem" }}>{p.emotion.label === "POSITIVE" ? "😊" : p.emotion.label === "NEGATIVE" ? "😟" : "😐"}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.88rem" }}>{p.emotion.label}</div>
                  <div style={{ fontSize: "0.7rem", color: "#5a7090" }}>Confidence: {p.emotion.confidence}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* EEG Signal */}
      {signal.length > 0 && (
        <div className="card card-glow" style={{ marginBottom: 18 }}>
          <div className="chart-head">
            <div><div className="chart-title">📈 EEG Signal Waveform</div><div className="chart-sub">Raw brainwave electrical activity</div></div>
            <span className="badge badge-cyan">{signal.length} samples</span>
          </div>
          <div className="chart-wrap">
            <Line
              data={{ labels: signal.map((_, i) => i), datasets: [{ label: "EEG μV", data: signal, borderColor: "#6366f1", borderWidth: 1.5, pointRadius: 0, fill: true, backgroundColor: "rgba(99,102,241,0.06)", tension: 0.2 }] }}
              options={{ ...baseOpts, plugins: { ...baseOpts.plugins, legend: { display: false } } }}
            />
          </div>
        </div>
      )}

      {/* Band + Radar */}
      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card card-glow">
          <div className="chart-head"><div><div className="chart-title">🌊 Brainwave Band Power</div><div className="chart-sub">Delta · Theta · Alpha · Beta · Gamma</div></div></div>
          <div className="chart-wrap">
            <Bar
              data={{ labels: ["Delta\n0.5–4Hz", "Theta\n4–8Hz", "Alpha\n8–13Hz", "Beta\n13–30Hz", "Gamma\n30–50Hz"], datasets: [{ label: "Power", data: [bp.delta, bp.theta, bp.alpha, bp.beta, bp.gamma], backgroundColor: ["rgba(34,211,238,0.7)", "rgba(129,140,248,0.7)", "rgba(52,211,153,0.7)", "rgba(248,113,113,0.7)", "rgba(249,115,22,0.7)"], borderWidth: 0, borderRadius: 7 }] }}
              options={baseOpts}
            />
          </div>
        </div>
        <div className="card card-glow">
          <div className="chart-head"><div><div className="chart-title">🕸️ Brain State Radar</div><div className="chart-sub">Multi-dimensional mental state</div></div></div>
          <div className="chart-wrap">
            <Radar
              data={{ labels: ["Stress", "Anxiety", "Focus", "Fatigue", "Stability", "Burnout"], datasets: [{ label: "State", data: [p.stress?.score, p.anxiety?.score, p.focus?.score, p.fatigue?.score, p.emotional_stability?.score, p.burnout?.score], backgroundColor: "rgba(99,102,241,0.14)", borderColor: "#6366f1", pointBackgroundColor: "#818cf8", pointBorderColor: "transparent", borderWidth: 2 }] }}
              options={{ responsive: true, maintainAspectRatio: false, scales: { r: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#3d5470", backdropColor: "transparent", maxTicksLimit: 4, font: { size: 9 } }, pointLabels: { color: "#8fa3c0", font: { size: 11, family: "Outfit" } } } }, plugins: { legend: { display: false }, tooltip: TT } }}
            />
          </div>
        </div>
      </div>

      {/* Forecast */}
      {fc.labels && (
        <div className="card card-glow">
          <div className="chart-head">
            <div><div className="chart-title">🔮 Future Mental State Forecast</div><div className="chart-sub">AI prediction of how your brain state evolves over the next 4 minutes</div></div>
            <span className="badge badge-blue">AI Forecast</span>
          </div>
          <div className="chart-wrap" style={{ height: "clamp(180px,30vw,260px)" }}>
            <Line
              data={{ labels: fc.labels, datasets: [
                { label: "Stress %",  data: (fc.stress  || []).map(v => +(v * 100).toFixed(1)), borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.07)", borderWidth: 2, pointRadius: 5, fill: true, tension: 0.4 },
                { label: "Focus %",   data: (fc.focus   || []).map(v => +(v * 100).toFixed(1)), borderColor: "#818cf8", backgroundColor: "rgba(129,140,248,0.07)", borderWidth: 2, pointRadius: 5, fill: true, tension: 0.4 },
                { label: "Fatigue %", data: (fc.fatigue || []).map(v => +(v * 100).toFixed(1)), borderColor: "#f97316", backgroundColor: "rgba(249,115,22,0.05)",  borderWidth: 2, pointRadius: 5, fill: true, tension: 0.4 },
                { label: "Anxiety %", data: (fc.anxiety || []).map(v => +(v * 100).toFixed(1)), borderColor: "#22d3ee", backgroundColor: "rgba(34,211,238,0.05)",  borderWidth: 2, pointRadius: 5, fill: true, tension: 0.4 },
              ]}}
              options={baseOpts}
            />
          </div>
        </div>
      )}
    </div>
  );
};
export default Results;
