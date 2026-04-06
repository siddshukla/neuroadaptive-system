import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home      from "./pages/Home";
import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Analyze   from "./pages/Analyze";
import History   from "./pages/History";
import Layout    from "./components/Layout";

/* redirect logged-in users away from auth pages */
const PublicOnly = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

/* redirect guests away from private pages */
const Private = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader />;
  return user ? children : <Navigate to="/login" replace />;
};

const Loader = () => (
  <div style={{ minHeight:"100vh", background:"#030610", display:"flex", alignItems:"center", justifyContent:"center" }}>
    <div style={{ width:44, height:44, borderRadius:"50%", border:"2px solid rgba(99,102,241,0.12)", borderTopColor:"#6366f1", borderRightColor:"#06b6d4", animation:"spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
  </div>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* public landing — always accessible */}
        <Route path="/"         element={<Home />} />

        {/* auth — redirect to dashboard if already logged in */}
        <Route path="/login"    element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

        {/* protected app */}
        <Route path="/dashboard" element={<Private><Layout><Dashboard /></Layout></Private>} />
        <Route path="/analyze"   element={<Private><Layout><Analyze /></Layout></Private>} />
        <Route path="/history"   element={<Private><Layout><History /></Layout></Private>} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>

    <ToastContainer
      position="top-right"
      theme="dark"
      autoClose={3000}
      toastStyle={{
        background: "#0f1829",
        color: "#e8edf5",
        border: "1px solid rgba(99,102,241,0.2)",
        borderRadius: 12,
        fontFamily: "Outfit,sans-serif",
      }}
    />
  </AuthProvider>
);

export default App;
