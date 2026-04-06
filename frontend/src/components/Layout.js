import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "NA";

  const nav = [
    { to: "/dashboard", icon: "⬡", label: "Dashboard",   desc: "Overview" },
    { to: "/analyze",   icon: "◈", label: "Analyze EEG", desc: "Run analysis" },
    { to: "/history",   icon: "◫", label: "History",     desc: "Past sessions" },
  ];

  const SidebarContent = () => (
    <>
      {/* LOGO */}
      <div className="sidebar-logo">
        <div className="sidebar-brand">
          <div className="sidebar-icon" style={{ cursor: "pointer" }} onClick={() => navigate("/")} title="Go to Home">🧠</div>
          <div className="sidebar-wordmark">
            <h2>Neuro<strong>Adaptive</strong></h2>
            <p>Brain · AI · Platform</p>
          </div>
        </div>
        <div className="sidebar-clock">
          <span className="clock-time">
            {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </span>
          <span className="clock-date">
            {time.toLocaleDateString([], { weekday: "short", day: "numeric", month: "short" })}
          </span>
        </div>
      </div>

      {/* NAV */}
      <nav className="sidebar-nav">
        <span className="nav-section-label">Navigation</span>
        {nav.map(item => (
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
          </NavLink>
        ))}
        {/* Home page link */}
        <NavLink
          to="/"
          end
          className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}
          style={{ marginTop: 4 }}
        >
          <span className="nav-icon">🏠</span>
          <div className="nav-text">
            <span className="nav-label">Home</span>
            <span className="nav-desc">Landing page</span>
          </div>
        </NavLink>

        {/* <span className="nav-section-label" style={{ marginTop: 22 }}>System</span>
        <div className="nav-status-card">
          {[["ML API","Port 8000"],["Backend","Port 4000"],["Model","98.83%"]].map(([l,v]) => (
            <div key={l} className="status-row">
              <div className="status-dot on" />
              <span>{l}</span>
              <span className="status-val">{v}</span>
            </div>
          ))}
        </div> */}
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="user-row">
          <div className="user-avatar">{initials}</div>
          <div className="user-info">
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </div>
        <button className="btn btn-ghost btn-full" onClick={() => { logout(); navigate("/login"); }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="layout">
      {/* MOBILE TOP BAR */}
      <header className="topbar">
        <button className="hamburger" onClick={() => setOpen(true)} aria-label="Menu">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="topbar-brand">
          <div className="topbar-icon">🧠</div>
          <span className="topbar-name">Neuro<strong>Adaptive</strong></span>
        </div>
        <div className="user-avatar" style={{ width: 32, height: 32, minWidth: 32, fontSize: "0.75rem", borderRadius: 9 }}>
          {initials}
        </div>
      </header>

      {/* OVERLAY */}
      {open && <div className="overlay show" onClick={() => setOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={"sidebar" + (open ? " open" : "")}>
        <SidebarContent />
      </aside>

      {/* MAIN */}
      <main className="main-content">{children}</main>
    </div>
  );
};

export default Layout;
