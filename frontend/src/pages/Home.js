import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ─────────────────────────────────────────────
   Intersection-observer reveal hook
───────────────────────────────────────────── */
const useReveal = (threshold = 0.12) => {
  const ref = useRef(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); io.unobserve(el); } },
      { threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, vis];
};

const Reveal = ({ children, delay = 0, style = {}, className = "" }) => {
  const [ref, vis] = useReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity:    vis ? 1 : 0,
        transform:  vis ? "none" : "translateY(30px)",
        transition: `opacity .72s cubic-bezier(.4,0,.2,1) ${delay}s,
                     transform .72s cubic-bezier(.4,0,.2,1) ${delay}s`,
        willChange: "opacity, transform",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Animated neural-network canvas
───────────────────────────────────────────── */
const NeuralCanvas = () => {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const N = 60;
    const nodes = Array.from({ length: N }, () => ({
      x:  Math.random(),
      y:  Math.random(),
      vx: (Math.random() - .5) * 2.8e-4,
      vy: (Math.random() - .5) * 2.8e-4,
      r:  Math.random() * 1.6 + .7,
      hue: Math.random() > .55 ? 238 : 190,
    }));

    let t = 0;
    const tick = () => {
      const W = canvas.width, H = canvas.height;
      t += .006;
      ctx.clearRect(0, 0, W, H);

      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      });

      const maxD = Math.min(W, H) * .27;
      for (let i = 0; i < N; i++) {
        const ax = nodes[i].x * W, ay = nodes[i].y * H;
        for (let j = i + 1; j < N; j++) {
          const bx = nodes[j].x * W, by = nodes[j].y * H;
          const d  = Math.hypot(ax - bx, ay - by);
          if (d < maxD) {
            const a = (1 - d / maxD) * .28 * (.5 + .5 * Math.sin(t + i * .22));
            ctx.beginPath();
            ctx.strokeStyle = `hsla(${nodes[i].hue},72%,66%,${a})`;
            ctx.lineWidth   = .5;
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.stroke();
          }
        }
        const p = .6 + .4 * Math.sin(t * 1.9 + i);
        ctx.beginPath();
        ctx.arc(ax, ay, nodes[i].r * p, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${nodes[i].hue},80%,68%,.8)`;
        ctx.fill();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }}
    />
  );
};

/* ─────────────────────────────────────────────
   User avatar + dropdown
───────────────────────────────────────────── */
const UserMenu = ({ user, onLogout }) => {
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const wrapRef   = useRef(null);

  const initials = user?.name
    ?.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "NA";

  useEffect(() => {
    const close = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setVisible(false);
        setTimeout(() => setOpen(false), 200);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
    }
  }, [open]);

  const go = path => { navigate(path); setOpen(false); };

  const MENU_ITEMS = [
    { icon: "⬡", label: "Dashboard",   path: "/dashboard" },
    { icon: "◈", label: "Analyze EEG", path: "/analyze"   },
    { icon: "◫", label: "History",     path: "/history"   },
  ];

  return (
    <div ref={wrapRef} style={{ position:"relative", flexShrink:0 }}>
      {/* Avatar button */}
      <button
        onClick={() => {
          if (open) {
            setVisible(false);
            setTimeout(() => setOpen(false), 200);
          } else {
            setOpen(true);
          }
        }}
        style={{
          width:40, height:40, borderRadius:"50%", flexShrink:0,
          background:"linear-gradient(135deg,#4338ca,#0891b2)",
          border: open
            ? "2px solid rgba(129,140,248,.65)"
            : "2px solid rgba(99,102,241,.28)",
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", fontWeight:800, fontSize:".82rem",
          color:"#fff", fontFamily:"Outfit,sans-serif",
          boxShadow: open
            ? "0 0 0 4px rgba(99,102,241,.18), 0 0 22px rgba(99,102,241,.45)"
            : "0 0 14px rgba(99,102,241,.3)",
          transition:"all .25s cubic-bezier(.4,0,.2,1)",
          outline:"none",
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.boxShadow = "0 0 0 4px rgba(99,102,241,.14), 0 0 20px rgba(99,102,241,.4)"; }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.boxShadow = "0 0 14px rgba(99,102,241,.3)"; }}
      >
        {initials}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position:"absolute", top:"calc(100% + 13px)", right:0, zIndex:900,
          minWidth:260,
          background:"rgba(8,13,28,0.98)",
          backdropFilter:"blur(40px) saturate(200%)",
          border:"1px solid rgba(99,102,241,.25)",
          borderRadius:18, padding:6,
          boxShadow:"0 32px 80px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.03) inset, 0 0 40px rgba(99,102,241,.08)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.97)",
          transition:"opacity 0.22s cubic-bezier(.4,0,.2,1), transform 0.22s cubic-bezier(.4,0,.2,1)",
        }}>
          {/* Profile header — click logo to go home */}
          <div style={{
            padding:"14px 14px 13px",
            borderBottom:"1px solid rgba(255,255,255,.055)",
            marginBottom:5,
          }}>
            {/* Clickable brain logo → home */}
            <Link
              to="/"
              onClick={() => setOpen(false)}
              style={{
                display:"flex", alignItems:"center", justifyContent:"center",
                width:42, height:42, borderRadius:12, marginBottom:12,
                background:"linear-gradient(135deg,#4338ca,#0891b2)",
                boxShadow:"0 0 18px rgba(99,102,241,.45)",
                fontSize:"1.15rem", textDecoration:"none",
                transition:"transform .22s, box-shadow .22s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.1) rotate(-5deg)"; e.currentTarget.style.boxShadow="0 0 28px rgba(99,102,241,.65)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 0 18px rgba(99,102,241,.45)"; }}
            >🧠</Link>

            {/* User detail */}
            <div style={{ display:"flex", alignItems:"center", gap:11 }}>
              <div style={{
                width:46, height:46, borderRadius:13, flexShrink:0,
                background:"linear-gradient(135deg,#4338ca,#0891b2)",
                display:"flex", alignItems:"center", justifyContent:"center",
                fontWeight:800, fontSize:"1rem", color:"#fff",
                boxShadow:"0 0 16px rgba(99,102,241,.4)",
              }}>{initials}</div>
              <div style={{ overflow:"hidden", minWidth:0 }}>
                <div style={{
                  fontWeight:700, fontSize:".9rem", color:"#e8edf5",
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                }}>{user?.name}</div>
                <div style={{
                  fontSize:".7rem", color:"#3d5470", marginTop:2,
                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                }}>{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Nav links */}
          {MENU_ITEMS.map(item => (
            <button
              key={item.label}
              onClick={() => go(item.path)}
              style={{
                width:"100%", display:"flex", alignItems:"center", gap:11,
                padding:"10px 13px", borderRadius:11,
                border:"none", cursor:"pointer",
                background:"transparent",
                fontFamily:"Outfit,sans-serif",
                fontSize:".855rem", fontWeight:600,
                color:"#8fa3c0",
                transition:"all 0.22s cubic-bezier(.4,0,.2,1)",
                textAlign:"left",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background="rgba(99,102,241,0.1)";
                e.currentTarget.style.color="#e8edf5";
                e.currentTarget.style.transform="translateX(4px)";
                e.currentTarget.style.paddingLeft="17px";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background="";
                e.currentTarget.style.color="#8fa3c0";
                e.currentTarget.style.transform="";
                e.currentTarget.style.paddingLeft="13px";
              }}
            >
              <span style={{ fontSize:"1rem", minWidth:20, textAlign:"center" }}>{item.icon}</span>
              {item.label}
            </button>
          ))}

          <div style={{ height:1, background:"rgba(255,255,255,.045)", margin:"5px 0" }} />

          {/* Sign out */}
          <button
            onClick={() => { onLogout(); setOpen(false); }}
            style={{
              width:"100%", display:"flex", alignItems:"center", gap:11,
              padding:"10px 13px", borderRadius:11,
              border:"none", cursor:"pointer",
              background:"transparent",
              fontFamily:"Outfit,sans-serif",
              fontSize:".855rem", fontWeight:600,
              color:"#f87171",
              transition:"all 0.22s cubic-bezier(.4,0,.2,1)",
              textAlign:"left",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background="rgba(248,113,113,0.1)";
              e.currentTarget.style.transform="translateX(4px)";
              e.currentTarget.style.paddingLeft="17px";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background="";
              e.currentTarget.style.transform="";
              e.currentTarget.style.paddingLeft="13px";
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ minWidth:14 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Static data
───────────────────────────────────────────── */
const FEATURES = [
  { icon:"😤", title:"Stress Detection",   desc:"5-level classification from Low to Severe using beta-wave dominance analysis.",      color:"#f87171" },
  { icon:"🎯", title:"Focus Scoring",       desc:"Real-time focus index powered by beta/alpha/theta ratio computation.",               color:"#818cf8" },
  { icon:"💤", title:"Fatigue Analysis",    desc:"Theta & delta wave patterns reveal mental exhaustion with 4-level grading.",        color:"#f59e0b" },
  { icon:"😰", title:"Anxiety Mapping",     desc:"Detects anxiety signatures inside EEG signals with confidence scoring.",            color:"#f97316" },
  { icon:"🔥", title:"Burnout Risk",        desc:"Composite metric combining stress, fatigue, and anxiety into burnout probability.", color:"#ef4444" },
  { icon:"🔮", title:"AI Forecast",         desc:"4-minute-ahead neural prediction of how your brain state will evolve.",             color:"#a5b4fc" },
  { icon:"⚡", title:"Cognitive Overload",  desc:"Detects when your brain is working beyond its optimal capacity threshold.",         color:"#22d3ee" },
  { icon:"💙", title:"Emotional Stability", desc:"0–100 stability index derived from signal variance and emotion labels.",            color:"#34d399" },
];

const STATS = [
  { val:"98.83%", label:"Model Accuracy",   color:"#818cf8" },
  { val:"7",      label:"Mental Metrics",   color:"#22d3ee" },
  { val:"< 1s",   label:"Analysis Time",   color:"#34d399" },
  { val:"2,132",  label:"Training Samples", color:"#f59e0b" },
];

const HOW = [
  { n:"01", icon:"✦", title:"Create Account",   desc:"Sign up in seconds — no credit card, completely free." },
  { n:"02", icon:"◈", title:"Upload or Demo",   desc:"Upload a .csv / .npy EEG file, or run an instant brain-state demo." },
  { n:"03", icon:"⬡", title:"AI Analysis",      desc:"Trained model extracts 7 mental-health metrics in under a second." },
  { n:"04", icon:"◫", title:"Track Over Time",  desc:"Session history and trend charts show how your brain state evolves." },
];

const TECH = [
  { label:"Algorithm", val:"Random Forest", color:"#818cf8" },
  { label:"Features",  val:"FFT + Stats",   color:"#22d3ee" },
  { label:"Dataset",   val:"2,132 samples", color:"#34d399" },
  { label:"Accuracy",  val:"98.83%",        color:"#f59e0b" },
  { label:"Metrics",   val:"7 outputs",     color:"#f87171" },
  { label:"Latency",   val:"< 1 second",    color:"#a5b4fc" },
];

/* ─────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────── */
export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  const go = useCallback(path => navigate(path), [navigate]);

  /* scroll detection */
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 48);
    window.addEventListener("scroll", h, { passive:true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* close mobile drawer on wide viewport */
  useEffect(() => {
    const h = () => { if (window.innerWidth > 768) setMobileOpen(false); };
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  /* lock body scroll when drawer open */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const NAV_LINKS = [
    { label:"Features",     href:"#features"     },
    { label:"How It Works", href:"#how-it-works" },
    { label:"Technology",   href:"#technology"   },
  ];

  /* ── inline keyframes injected once ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap');

        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; font-size:16px; }
        body {
          font-family:'Outfit',sans-serif;
          background:#030610;
          color:#e8edf5;
          overflow-x:hidden;
          -webkit-font-smoothing:antialiased;
        }
        ::selection { background:rgba(99,102,241,.28); }
        ::-webkit-scrollbar            { width:4px; }
        ::-webkit-scrollbar-track      { background:transparent; }
        ::-webkit-scrollbar-thumb      { background:linear-gradient(#6366f1,#06b6d4); border-radius:2px; }

        /* ── keyframes ── */
        @keyframes heroIn   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:none} }
        @keyframes menuIn   { from{opacity:0;transform:translateY(-10px) scale(.97)} to{opacity:1;transform:none} }
        @keyframes drawerIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:none} }
        @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-18px)} }
        @keyframes gradFlow { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.45} }

        /* ── nav anchor hover ── */
        .hl { padding:8px 14px; border-radius:10px; color:#8fa3c0; font-size:.875rem; font-weight:600; text-decoration:none; transition:color .2s, background .2s; white-space:nowrap; }
        .hl:hover { color:#e8edf5; background:rgba(255,255,255,.05); }

        /* ── nav outline btn ── */
        .nb-out {
          padding:9px 19px; border-radius:11px;
          background:transparent; border:1px solid rgba(99,102,241,.26);
          color:#94a3b8; font-size:.86rem; font-weight:600;
          text-decoration:none; transition:all .25s; white-space:nowrap;
          cursor:pointer; font-family:'Outfit',sans-serif;
          display:inline-flex; align-items:center; gap:6px;
        }
        .nb-out:hover { border-color:rgba(99,102,241,.55); color:#e8edf5; background:rgba(99,102,241,.07); }

        /* ── nav solid btn ── */
        .nb-sol {
          padding:9px 20px; border-radius:11px;
          background:linear-gradient(135deg,#4338ca,#0891b2);
          border:none; color:#fff; font-size:.86rem; font-weight:700;
          text-decoration:none; transition:all .25s; white-space:nowrap;
          cursor:pointer; font-family:'Outfit',sans-serif;
          display:inline-flex; align-items:center; gap:6px;
          box-shadow:0 4px 18px rgba(99,102,241,.35);
        }
        .nb-sol:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(99,102,241,.52); }

        /* ── hero buttons ── */
        .hb-p {
          padding:15px 38px; border-radius:14px;
          background:linear-gradient(135deg,#4338ca,#0891b2);
          border:none; color:#fff; font-size:1rem; font-weight:800;
          font-family:'Outfit',sans-serif; cursor:pointer;
          text-decoration:none; display:inline-flex; align-items:center; gap:9px;
          box-shadow:0 0 0 1px rgba(255,255,255,.07) inset, 0 8px 32px rgba(99,102,241,.42);
          transition:all .3s cubic-bezier(.4,0,.2,1);
        }
        .hb-p:hover { transform:translateY(-3px); box-shadow:0 0 0 1px rgba(255,255,255,.1) inset, 0 16px 44px rgba(99,102,241,.58), 0 0 70px rgba(6,182,212,.14); }

        .hb-o {
          padding:15px 32px; border-radius:14px;
          background:rgba(255,255,255,.03);
          border:1px solid rgba(99,102,241,.26);
          color:#a5b4fc; font-size:1rem; font-weight:700;
          font-family:'Outfit',sans-serif; cursor:pointer;
          text-decoration:none; display:inline-flex; align-items:center; gap:9px;
          transition:all .3s cubic-bezier(.4,0,.2,1);
        }
        .hb-o:hover { border-color:rgba(99,102,241,.55); background:rgba(99,102,241,.08); transform:translateY(-2px); }

        /* ── feature card ── */
        .fc {
          background:rgba(13,20,38,.72);
          border:1px solid rgba(255,255,255,.055);
          border-radius:20px; padding:24px 20px;
          transition:all .32s cubic-bezier(.4,0,.2,1);
          cursor:default; position:relative; overflow:hidden;
        }
        .fc::before {
          content:''; position:absolute; top:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,transparent,var(--fc),transparent);
          opacity:.45; transition:opacity .3s;
        }
        .fc:hover { transform:translateY(-5px); border-color:rgba(255,255,255,.1); box-shadow:0 22px 55px rgba(0,0,0,.45); }
        .fc:hover::before { opacity:1; }

        /* ── how card ── */
        .hwc {
          background:rgba(13,20,38,.72);
          border:1px solid rgba(99,102,241,.13);
          border-radius:22px; padding:32px 22px;
          transition:all .32s cubic-bezier(.4,0,.2,1);
          text-align:center;
        }
        .hwc:hover { border-color:rgba(99,102,241,.35); transform:translateY(-6px); box-shadow:0 26px 64px rgba(0,0,0,.42); }

        /* ── tech card ── */
        .tc {
          background:rgba(13,20,38,.72);
          border-radius:16px; padding:20px 18px;
          transition:all .25s cubic-bezier(.4,0,.2,1);
        }
        .tc:hover { transform:scale(1.045); }

        /* ── mobile drawer item ── */
        .mdi {
          display:block; padding:13px 16px; border-radius:12px;
          color:#8fa3c0; font-size:.92rem; font-weight:600;
          text-decoration:none; background:rgba(255,255,255,.025);
          transition:all .2s; border:1px solid transparent;
        }
        .mdi:hover { background:rgba(99,102,241,.09); color:#e8edf5; border-color:rgba(99,102,241,.18); }

        /* ── footer link ── */
        .flink { color:#3d5470; font-size:.82rem; text-decoration:none; transition:color .2s; }
        .flink:hover { color:#a5b4fc; }

        /* ── responsive ── */
        @media(max-width:900px) {
          .desktop-links { display:none !important; }
          .hamburger     { display:flex !important; }
        }
        @media(max-width:640px) {
          .feat-grid { grid-template-columns:1fr !important; }
          .how-grid  { grid-template-columns:1fr 1fr !important; }
          .hero-cta  { flex-direction:column; align-items:center; }
          .hb-p, .hb-o { width:100%; justify-content:center; }
          .stats-row { gap:20px !important; }
        }
        @media(max-width:480px) {
          .how-grid   { grid-template-columns:1fr !important; }
          .footer-bot { flex-direction:column; gap:10px; }
          .footer-chips { display:none; }
        }
      `}</style>

      {/* ══════════ PAGE SHELL ══════════ */}
      <div style={{ background:"#030610", minHeight:"100vh" }}>

        {/* ── ambient bg ── */}
        <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
          <div style={{ position:"absolute", width:"80vmax", height:"80vmax", maxWidth:900, borderRadius:"50%", background:"radial-gradient(circle,rgba(99,102,241,.1) 0%,transparent 65%)", top:"-28%", left:"-22%", animation:"floatY 16s ease-in-out infinite" }} />
          <div style={{ position:"absolute", width:"60vmax", height:"60vmax", maxWidth:700, borderRadius:"50%", background:"radial-gradient(circle,rgba(6,182,212,.07) 0%,transparent 65%)", bottom:"-20%", right:"-18%", animation:"floatY 20s 5s ease-in-out infinite" }} />
          <div style={{ position:"absolute", inset:0, backgroundImage:"radial-gradient(rgba(255,255,255,.013) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
        </div>

        {/* ══════════ NAVBAR ══════════ */}
        <nav style={{
          position:"fixed", top:0, left:0, right:0, zIndex:500,
          height:64,
          display:"flex", alignItems:"center",
          padding:"0 clamp(16px,4vw,52px)",
          gap:16,
          background: scrolled ? "rgba(3,6,16,.94)" : "transparent",
          backdropFilter: scrolled ? "blur(28px) saturate(160%)" : "none",
          borderBottom: scrolled ? "1px solid rgba(99,102,241,.1)" : "1px solid transparent",
          transition:"background .4s ease, border-color .4s ease, backdrop-filter .4s ease",
          willChange:"background",
        }}>

          {/* Brand — always left */}
          <Link
            to="/"
            style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none", flexShrink:0 }}
          >
            <div style={{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:"linear-gradient(135deg,#4338ca,#0891b2)",
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"1.05rem",
              boxShadow:"0 0 16px rgba(99,102,241,.45)",
              transition:"transform .25s, box-shadow .25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08) rotate(-4deg)"; e.currentTarget.style.boxShadow="0 0 26px rgba(99,102,241,.65)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow="0 0 16px rgba(99,102,241,.45)"; }}
            >🧠</div>
            <span style={{
              fontWeight:900,
              fontSize:"clamp(.9rem,1.8vw,1.05rem)",
              letterSpacing:"-.3px",
              lineHeight:1,
              whiteSpace:"nowrap",
              color:"#e8edf5",
            }}>
              Neuro
              <span style={{ background:"linear-gradient(135deg,#818cf8,#22d3ee)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                Adaptive
              </span>
            </span>
          </Link>

          {/* Center links — desktop */}
          <div
            className="desktop-links"
            style={{
              display:"flex", alignItems:"center", gap:2,
              position:"absolute", left:"50%", transform:"translateX(-50%)",
            }}
          >
            {NAV_LINKS.map(l => (
              <a key={l.label} href={l.href} className="hl">{l.label}</a>
            ))}
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginLeft:"auto", flexShrink:0 }}>
            {user ? (
              /* Logged-in: dashboard btn + avatar */
              <>
                <button onClick={() => go("/dashboard")} className="nb-sol" style={{ display:"flex" }}>
                  ⬡ Dashboard
                </button>
                <UserMenu user={user} onLogout={logout} />
              </>
            ) : (
              /* Logged-out: sign in + get started — desktop */
              <div className="desktop-links" style={{ display:"flex", alignItems:"center", gap:9 }}>
                <Link to="/login"    className="nb-out">Sign In</Link>
                <Link to="/register" className="nb-sol">Get Started</Link>
              </div>
            )}

            {/* Hamburger — mobile */}
            <button
              className="hamburger"
              onClick={() => setMobileOpen(o => !o)}
              style={{
                display:"none",
                background:"rgba(255,255,255,.04)",
                border:"1px solid rgba(99,102,241,.2)",
                borderRadius:10, padding:8,
                cursor:"pointer", color:"#e8edf5",
                alignItems:"center", justifyContent:"center",
                transition:"all .2s", flexShrink:0,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6"  y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3"  y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile drawer */}
        {mobileOpen && (
          <>
            <div
              onClick={() => setMobileOpen(false)}
              style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.65)", zIndex:450, backdropFilter:"blur(5px)" }}
            />
            <div style={{
              position:"fixed", top:64, left:0, right:0, zIndex:460,
              background:"rgba(6,11,24,.99)", backdropFilter:"blur(32px)",
              borderBottom:"1px solid rgba(99,102,241,.14)",
              padding:"14px 18px 22px",
              display:"flex", flexDirection:"column", gap:7,
              animation:"drawerIn .24s cubic-bezier(.4,0,.2,1)",
            }}>
              {NAV_LINKS.map(l => (
                <a
                  key={l.label}
                  href={l.href}
                  className="mdi"
                  onClick={() => setMobileOpen(false)}
                >{l.label}</a>
              ))}
              <div style={{ height:1, background:"rgba(255,255,255,.06)", margin:"4px 0" }} />
              {user ? (
                <>
                  <button
                    onClick={() => { go("/dashboard"); setMobileOpen(false); }}
                    style={{ padding:"13px 16px", borderRadius:12, background:"linear-gradient(135deg,#4338ca,#0891b2)", border:"none", color:"#fff", fontWeight:700, cursor:"pointer", fontFamily:"Outfit,sans-serif", fontSize:".92rem", textAlign:"left" }}
                  >⬡ Dashboard</button>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    style={{ padding:"13px 16px", borderRadius:12, background:"rgba(248,113,113,.07)", border:"1px solid rgba(248,113,113,.2)", color:"#f87171", fontWeight:600, cursor:"pointer", fontFamily:"Outfit,sans-serif", fontSize:".92rem", textAlign:"left" }}
                  >Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/login"    className="mdi" onClick={() => setMobileOpen(false)} style={{ textAlign:"center" }}>Sign In</Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    style={{ display:"block", padding:"13px 16px", borderRadius:12, background:"linear-gradient(135deg,#4338ca,#0891b2)", color:"#fff", fontWeight:700, textDecoration:"none", textAlign:"center", fontSize:".92rem" }}
                  >Get Started</Link>
                </>
              )}
            </div>
          </>
        )}

        {/* ══════════ HERO ══════════ */}
        <section style={{
          position:"relative", minHeight:"100vh",
          display:"flex", alignItems:"center", justifyContent:"center",
          padding:"100px clamp(16px,5vw,80px) 80px",
          overflow:"hidden", zIndex:1,
        }}>
          <NeuralCanvas />

          <div style={{ position:"relative", zIndex:2, textAlign:"center", maxWidth:860, margin:"0 auto", width:"100%" }}>
            {/* live badge */}
            {/* <div style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"5px 15px",
              background:"rgba(99,102,241,.08)",
              border:"1px solid rgba(99,102,241,.2)",
              borderRadius:24, marginBottom:28,
              fontSize:".75rem", fontWeight:700, color:"#a5b4fc",
              animation:"heroIn .55s ease both",
              letterSpacing:".3px",
            }}>
              <span style={{ width:6, height:6, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 8px #34d399", animation:"blink 2s ease-in-out infinite", display:"inline-block", flexShrink:0 }} />
              AI-Powered · 98.83% Accuracy · Real-time EEG Analysis
            </div> */}

            {/* headline */}
            <h1 style={{
              fontSize:"clamp(2.4rem,6.5vw,4.8rem)",
              fontWeight:900, letterSpacing:"-2px", lineHeight:1.05,
              marginBottom:22,
              animation:"heroIn .6s .08s ease both", opacity:0,
            }}>
              Read Your Brain.{" "}
              <span style={{
                background:"linear-gradient(135deg,#818cf8,#22d3ee,#34d399)",
                backgroundSize:"200% auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text",
                animation:"gradFlow 5s ease infinite",
              }}>
                Predict Your Mind.
              </span>
            </h1>

            {/* subtitle */}
            <p style={{
              fontSize:"clamp(.95rem,1.8vw,1.15rem)",
              color:"#8fa3c0", maxWidth:560, margin:"0 auto 40px",
              lineHeight:1.82,
              animation:"heroIn .6s .18s ease both", opacity:0,
            }}>
              NeuroAdaptive analyzes EEG brainwave signals using a trained machine-learning
              model to detect{" "}
              <span style={{ color:"#a5b4fc", fontWeight:700 }}>7 mental-health metrics</span>
              {" "}— stress, anxiety, focus, fatigue, burnout, cognitive overload, and emotional stability.
            </p>

            {/* CTA row */}
            <div
              className="hero-cta"
              style={{
                display:"flex", gap:14, justifyContent:"center",
                flexWrap:"wrap", marginBottom:62,
                animation:"heroIn .6s .28s ease both", opacity:0,
              }}
            >
              {user ? (
                <button onClick={() => go("/dashboard")} className="hb-p">
                  ⬡ Open Dashboard →
                </button>
              ) : (
                <>
                  <Link to="/register" className="hb-p">✦ Get Started</Link>
                  <Link to="/login"    className="hb-o">Sign In →</Link>
                </>
              )}
            </div>

            {/* stats */}
            <div
              className="stats-row"
              style={{
                display:"flex", gap:"clamp(22px,4vw,56px)",
                justifyContent:"center", flexWrap:"wrap",
                animation:"heroIn .6s .38s ease both", opacity:0,
              }}
            >
              {STATS.map(s => (
                <div key={s.label} style={{ textAlign:"center" }}>
                  <div style={{
                    fontSize:"clamp(1.45rem,3.2vw,2rem)",
                    fontWeight:900, fontFamily:"JetBrains Mono,monospace",
                    color:s.color, lineHeight:1,
                  }}>{s.val}</div>
                  <div style={{ fontSize:".67rem", color:"#3d5470", textTransform:"uppercase", letterSpacing:"1.2px", fontWeight:600, marginTop:5 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* bottom fade */}
          <div style={{ position:"absolute", bottom:0, left:0, right:0, height:130, background:"linear-gradient(transparent,#030610)", pointerEvents:"none" }} />
        </section>

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" style={{ padding:"clamp(64px,10vw,120px) clamp(16px,5vw,80px)", position:"relative", zIndex:1 }}>
          <Reveal style={{ textAlign:"center", marginBottom:"clamp(42px,6vw,72px)" }}>
            <span style={{ display:"inline-block", padding:"4px 14px", background:"rgba(99,102,241,.09)", border:"1px solid rgba(99,102,241,.18)", borderRadius:20, fontSize:".7rem", fontWeight:700, color:"#a5b4fc", marginBottom:18, textTransform:"uppercase", letterSpacing:"1.5px" }}>
              What We Detect
            </span>
            <h2 style={{ fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:900, letterSpacing:"-1px", marginBottom:14 }}>
              7 Mental Metrics,{" "}
              <span style={{ background:"linear-gradient(135deg,#818cf8,#22d3ee)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                One Analysis
              </span>
            </h2>
            <p style={{ color:"#8fa3c0", fontSize:"clamp(.875rem,1.4vw,1rem)", maxWidth:500, margin:"0 auto", lineHeight:1.78 }}>
              Our Random Forest model delivers comprehensive mental-state analysis from raw EEG signal in under one second.
            </p>
          </Reveal>

          <div
            className="feat-grid"
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,240px),1fr))", gap:14, maxWidth:1100, margin:"0 auto" }}
          >
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * .055}>
                <div className="fc" style={{ "--fc": f.color }}>
                  <div style={{ fontSize:"1.7rem", marginBottom:13 }}>{f.icon}</div>
                  <div style={{ fontWeight:700, fontSize:".92rem", marginBottom:8, color:f.color }}>{f.title}</div>
                  <div style={{ fontSize:".78rem", color:"#52647a", lineHeight:1.72 }}>{f.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════ HOW IT WORKS ══════════ */}
        <section id="how-it-works" style={{ padding:"clamp(64px,10vw,120px) clamp(16px,5vw,80px)", position:"relative", zIndex:1 }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 50%,rgba(99,102,241,.04) 0%,transparent 70%)", pointerEvents:"none" }} />

          <Reveal style={{ textAlign:"center", marginBottom:"clamp(42px,6vw,72px)" }}>
            <span style={{ display:"inline-block", padding:"4px 14px", background:"rgba(6,182,212,.09)", border:"1px solid rgba(6,182,212,.18)", borderRadius:20, fontSize:".7rem", fontWeight:700, color:"#22d3ee", marginBottom:18, textTransform:"uppercase", letterSpacing:"1.5px" }}>
              Simple Process
            </span>
            <h2 style={{ fontSize:"clamp(1.8rem,4vw,3rem)", fontWeight:900, letterSpacing:"-1px", marginBottom:14 }}>
              Signal to Insight{" "}
              <span style={{ background:"linear-gradient(135deg,#22d3ee,#34d399)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                in 4 Steps
              </span>
            </h2>
          </Reveal>

          <div
            className="how-grid"
            style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,200px),1fr))", gap:16, maxWidth:960, margin:"0 auto", position:"relative" }}
          >
            {/* connector line — decorative */}
            <div style={{ position:"absolute", top:44, left:"10%", right:"10%", height:1, background:"linear-gradient(90deg,transparent,rgba(99,102,241,.22),rgba(6,182,212,.22),transparent)", pointerEvents:"none" }} />

            {HOW.map((step, i) => (
              <Reveal key={step.n} delay={i * .1}>
                <div className="hwc">
                  <div style={{ position:"relative", display:"inline-flex", marginBottom:18 }}>
                    <div style={{
                      width:56, height:56, borderRadius:"50%",
                      background:"linear-gradient(135deg,rgba(99,102,241,.18),rgba(6,182,212,.1))",
                      border:"1px solid rgba(99,102,241,.28)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:"1.35rem",
                    }}>{step.icon}</div>
                    <div style={{
                      position:"absolute", top:-5, right:-5,
                      width:20, height:20, borderRadius:"50%",
                      background:"linear-gradient(135deg,#4338ca,#0891b2)",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:".56rem", fontWeight:800, color:"#fff",
                    }}>{i + 1}</div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:".94rem", marginBottom:9 }}>{step.title}</div>
                  <div style={{ fontSize:".78rem", color:"#52647a", lineHeight:1.72 }}>{step.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ══════════ TECHNOLOGY ══════════ */}
        <section id="technology" style={{ padding:"clamp(64px,10vw,120px) clamp(16px,5vw,80px)", position:"relative", zIndex:1 }}>
          <div style={{
            maxWidth:1000, margin:"0 auto",
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,380px),1fr))",
            gap:"clamp(36px,5vw,72px)",
            alignItems:"center",
          }}>
            <Reveal>
              <span style={{ display:"inline-block", padding:"4px 14px", background:"rgba(52,211,153,.09)", border:"1px solid rgba(52,211,153,.18)", borderRadius:20, fontSize:".7rem", fontWeight:700, color:"#34d399", marginBottom:20, textTransform:"uppercase", letterSpacing:"1.5px" }}>
                Under The Hood
              </span>
              <h2 style={{ fontSize:"clamp(1.7rem,3.5vw,2.6rem)", fontWeight:900, letterSpacing:"-1px", marginBottom:20, lineHeight:1.15 }}>
                Built on Real Science,{" "}
                <span style={{ background:"linear-gradient(135deg,#34d399,#22d3ee)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
                  Real Data
                </span>
              </h2>
              <p style={{ color:"#8fa3c0", fontSize:".9rem", lineHeight:1.86, marginBottom:18 }}>
                Trained on the{" "}
                <strong style={{ color:"#a5b4fc" }}>EEG Brainwave Dataset</strong>{" "}
                (2,132 real samples) using a Random Forest Classifier with FFT-based feature extraction. Achieves{" "}
                <strong style={{ color:"#34d399" }}>98.83% accuracy</strong> on unseen test data.
              </p>
              <p style={{ color:"#8fa3c0", fontSize:".9rem", lineHeight:1.86 }}>
                Brainwave bands — Delta, Theta, Alpha, Beta, Gamma — are extracted via Fast Fourier Transform and fed into the model alongside statistical features for real-time predictions.
              </p>
            </Reveal>

            <Reveal delay={.15}>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                {TECH.map(t => (
                  <div
                    key={t.label}
                    className="tc"
                    style={{ border:`1px solid ${t.color}1e` }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = t.color + "44"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = t.color + "1e"}
                  >
                    <div style={{ fontSize:".62rem", color:"#3d5470", textTransform:"uppercase", letterSpacing:"1.2px", marginBottom:8, fontWeight:700 }}>{t.label}</div>
                    <div style={{ fontSize:"1.05rem", fontWeight:800, color:t.color, fontFamily:"JetBrains Mono,monospace" }}>{t.val}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════ CTA BANNER ══════════ */}
        <section style={{ padding:"clamp(48px,8vw,100px) clamp(16px,5vw,80px)", position:"relative", zIndex:1 }}>
          <Reveal>
            <div style={{
              maxWidth:760, margin:"0 auto", textAlign:"center",
              background:"linear-gradient(135deg,rgba(67,56,202,.16),rgba(8,145,178,.1))",
              border:"1px solid rgba(99,102,241,.2)",
              borderRadius:28,
              padding:"clamp(40px,6vw,72px) clamp(24px,5vw,64px)",
              position:"relative", overflow:"hidden",
            }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:"linear-gradient(90deg,transparent,rgba(99,102,241,.6),rgba(6,182,212,.4),transparent)" }} />
              <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse at center,rgba(99,102,241,.05) 0%,transparent 70%)", pointerEvents:"none" }} />
              <h2 style={{ fontSize:"clamp(1.6rem,4vw,2.6rem)", fontWeight:900, letterSpacing:"-.8px", marginBottom:14, position:"relative" }}>
                Start Analyzing Your Brain
              </h2>
              <p style={{ color:"#8fa3c0", fontSize:"clamp(.875rem,1.4vw,1rem)", marginBottom:34, lineHeight:1.78, position:"relative" }}>
                No hardware required. Sign up and run your first analysis in minutes.
              </p>
              <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap", position:"relative" }}>
                {user ? (
                  <button onClick={() => go("/dashboard")} className="hb-p">⬡ Open Dashboard →</button>
                ) : (
                  <>
                    <Link to="/register" className="hb-p">✦ Create Account →</Link>
                    <Link to="/login"    className="hb-o">Sign In</Link>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer style={{
          borderTop:"1px solid rgba(99,102,241,.09)",
          padding:"clamp(36px,5vw,60px) clamp(16px,5vw,80px) clamp(24px,4vw,40px)",
          position:"relative", zIndex:1,
        }}>
          <div style={{ maxWidth:1100, margin:"0 auto" }}>
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,160px),1fr))",
              gap:"clamp(28px,4vw,52px)",
              marginBottom:"clamp(32px,4vw,48px)",
            }}>
              {/* Brand */}
              <div>
                <Link to="/" style={{ display:"inline-flex", alignItems:"center", gap:9, textDecoration:"none", marginBottom:14 }}>
                  <div style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:"linear-gradient(135deg,#4338ca,#0891b2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:".95rem", boxShadow:"0 0 12px rgba(99,102,241,.35)" }}>🧠</div>
                  <span style={{ fontWeight:900, fontSize:".95rem", letterSpacing:"-.3px", color:"#e8edf5" }}>
                    Neuro<span style={{ background:"linear-gradient(135deg,#818cf8,#22d3ee)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>Adaptive</span>
                  </span>
                </Link>
                <p style={{ color:"#2d4060", fontSize:".76rem", lineHeight:1.78, maxWidth:200 }}>
                  AI-powered EEG brain-state analysis. Mental-health monitoring through machine learning.
                </p>
              </div>

              {/* Link columns */}
              {[
                { title:"Platform", links:[{ l:"Dashboard", to:"/dashboard" },{ l:"Analyze EEG", to:"/analyze" },{ l:"History", to:"/history" }] },
                { title:"Account",  links:[{ l:"Sign In", to:"/login" },{ l:"Sign Up", to:"/register" }] },
                { title:"Stack",    links:[{ l:"Python + FastAPI", to:"/" },{ l:"React Frontend", to:"/" },{ l:"MongoDB", to:"/" },{ l:"Random Forest AI", to:"/" }] },
              ].map(col => (
                <div key={col.title}>
                  <div style={{ fontSize:".65rem", fontWeight:700, textTransform:"uppercase", letterSpacing:"1.8px", color:"#2d4060", marginBottom:14 }}>{col.title}</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {col.links.map(lk => (
                      <Link key={lk.l} to={lk.to} className="flink">{lk.l}</Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div
              className="footer-bot"
              style={{ borderTop:"1px solid rgba(255,255,255,.04)", paddingTop:20, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}
            >
              <p style={{ color:"#2d4060", fontSize:".73rem" }}>© 2025 NeuroAdaptive AI — Final Year Project</p>
              <div className="footer-chips" style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                {[["98.83%","Accuracy"],["7","Metrics"],["< 1s","Analysis"]].map(([v,l]) => (
                  <span key={l} style={{ fontSize:".68rem", color:"#2d4060", display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ width:4, height:4, borderRadius:"50%", background:"#34d399", boxShadow:"0 0 5px #34d399", display:"inline-block" }} />
                    {v} {l}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </footer>

      </div>{/* end page shell */}
    </>
  );
}
