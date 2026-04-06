import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [err,   setErr]     = useState("");
  const [busy,  setBusy]    = useState(false);
  const { login } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr(""); setBusy(true);
    try { await login(email, pass); nav("/dashboard", { replace: true }); }
    catch (e) { setErr(e.response?.data?.message || "Invalid email or password"); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-card">
        <Link to="/" className="auth-back">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6"/></svg>
          Back to Home
        </Link>
        <div className="auth-logo">
          <Link to="/" className="auth-logo-icon-wrap">
            <div className="auth-logo-icon">🧠</div>
          </Link>
          <h1>Neuro<strong>Adaptive</strong></h1>
          <p>Sign in to your account</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={pass}
              onChange={e => setPass(e.target.value)} required />
          </div>
          {err && <div className="error-msg">⚠ {err}</div>}
          <button className="btn btn-primary btn-full" type="submit" disabled={busy} style={{ marginTop: 10 }}>
            {busy
              ? <><span className="spinner spinner-sm" /> Signing in…</>
              : "→ Sign In"}
          </button>
        </form>
        <p className="auth-switch">No account? <Link to="/register">Create one</Link></p>
      </div>
    </div>
  );
}
