import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [name, setName]   = useState("");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [err,   setErr]   = useState("");
  const [busy,  setBusy]  = useState(false);
  const { register } = useAuth();
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault(); setErr("");
    if (pass.length < 6) { setErr("Password must be at least 6 characters"); return; }
    setBusy(true);
    try { await register(name, email, pass); nav("/dashboard", { replace: true }); }
    catch (e) { setErr(e.response?.data?.message || "Registration failed"); }
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
          <p>Create your account</p>
        </div>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" placeholder="Your name" value={name}
              onChange={e => setName(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" placeholder="Min 6 characters" value={pass}
              onChange={e => setPass(e.target.value)} required />
          </div>
          {err && <div className="error-msg">⚠ {err}</div>}
          <button className="btn btn-primary btn-full" type="submit" disabled={busy} style={{ marginTop: 10 }}>
            {busy
              ? <><span className="spinner spinner-sm" /> Creating…</>
              : "✦ Create Account"}
          </button>
        </form>
        <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
