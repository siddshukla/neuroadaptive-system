import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ── User Profile Popup (bottom of sidebar) ── */
const UserProfile = ({ user, onLogout, navigate }) => {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef(null);
  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "NA";

  /* close on outside click */
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setExpanded(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const actions = [
    { icon: "⬡", label: "Dashboard",   path: "/dashboard" },
    { icon: "◈", label: "Analyze EEG", path: "/analyze"   },
    { icon: "◫", label: "History",     path: "/history"   },
    { icon: "🏠", label: "Home",        path: "/"          },
  ];

  return (
    <div ref={ref} className="user-profile-wrap">
      {/* Expanded panel — slides up above the button */}
      <div className={"user-panel" + (expanded ? " open" : "")}>
        {/* Panel header */}
        <div className="user-panel-head">
          <div className="user-panel-avatar">{initials}</div>
          <div className="user-panel-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
          <div className="user-panel-status">
            <span className="status-pill">● Active</span>
          </div>
        </div>

        {/* Quick nav inside panel */}
        <div className="user-panel-nav">
          {actions.map(a => (
            <button
              key={a.path}
              className="user-panel-btn"
              onClick={() => { navigate(a.path); setExpanded(false); }}
            >
              <span className="upb-icon">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>

        {/* Sign out */}
        <button
          className="user-panel-signout"
          onClick={() => { onLogout(); navigate("/login"); setExpanded(false); }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>

      {/* Trigger row — always visible */}
      <button
        className={"user-trigger" + (expanded ? " active" : "")}
        onClick={() => setExpanded(o => !o)}
        aria-expanded={expanded}
        aria-label="User menu"
      >
        <div className="user-trigger-avatar">
          {initials}
          <span className="ut-online-dot" />
        </div>
        <div className="user-trigger-info">
          <strong>{user?.name}</strong>
          <span>{user?.email}</span>
        </div>
        <span className={"user-trigger-chevron" + (expanded ? " flip" : "")}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="18 15 12 9 6 15"/>
          </svg>
        </span>
      </button>
    </div>
  );
};

/* ══════════ LAYOUT ══════════ */
const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  /* close mobile drawer on route change */
  useEffect(() => { setDrawerOpen(false); }, [location]);

  const NAV = [
    { to: "/dashboard", icon: "⬡", label: "Dashboard",   desc: "Overview"      },
    { to: "/analyze",   icon: "◈", label: "Analyze EEG", desc: "Run analysis"  },
    { to: "/history",   icon: "◫", label: "History",     desc: "Past sessions" },
    { to: "/",          icon: "🏠", label: "Home",        desc: "Landing page"  },
  ];

  const SidebarInner = () => (
    <>
      {/* ── LOGO ── */}
      <div className="sidebar-logo">
        <button
          className="sidebar-brand-btn"
          onClick={() => navigate("/")}
          title="Go to Home"
        >
          <div className="sidebar-icon">🧠</div>
          <div className="sidebar-wordmark">
            <h2>Neuro<strong>Adaptive</strong></h2>
            <p>Brain · AI · Platform</p>
          </div>
        </button>

        <div className="sidebar-clock">
          <span className="clock-time">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span className="clock-date">
            {time.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>

        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          >
            <span className="nav-icon">{item.icon}</span>
            <div className="nav-text">
              <span className="nav-label">{item.label}</span>
              <span className="nav-desc">{item.desc}</span>
            </div>
            {/* hover shimmer stripe */}
            <span className="nav-hover-stripe" />
          </NavLink>
        ))}

        <span className="nav-section-label" style={{ marginTop: 20 }}>System</span>
        <div className="nav-status-card">
          {[
            ["ML API",  "Port 8000"],
            ["Backend", "Port 4000"],
            ["Model",   "98.83%"   ],
          ].map(([l, v]) => (
            <div key={l} className="status-row">
              <span className="status-dot on" />
              <span>{l}</span>
              <span className="status-val">{v}</span>
            </div>
          ))}
        </div>
      </nav>

      {/* ── USER PROFILE ── */}
      <div className="sidebar-footer">
        <UserProfile user={user} onLogout={logout} navigate={navigate} />
      </div>
    </>
  );

  return (
    <div className="layout">
      {/* ── MOBILE TOPBAR ── */}
      <header className="topbar">
        <button
          className="hamburger"
          onClick={() => setDrawerOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            {drawerOpen
              ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
              : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
            }
          </svg>
        </button>

        <button className="topbar-brand" onClick={() => navigate("/")}>
          <div className="topbar-icon">🧠</div>
          <span className="topbar-name">
            Neuro<strong>Adaptive</strong>
          </span>
        </button>

        <button
          className="topbar-avatar"
          onClick={() => setDrawerOpen(o => !o)}
          title={user?.name}
        >
          {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "NA"}
          <span className="topbar-avatar-dot" />
        </button>
      </header>

      {/* mobile overlay */}
      {drawerOpen && (
        <div className="overlay show" onClick={() => setDrawerOpen(false)} />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={"sidebar" + (drawerOpen ? " open" : "")}>
        <SidebarInner />
      </aside>

      {/* ── MAIN ── */}
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
