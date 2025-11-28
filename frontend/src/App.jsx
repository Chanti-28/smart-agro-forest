import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Management from "./pages/Management";
import Analytics from "./pages/Analytics";
import Landing from "./pages/Landing";
import { api } from "./api";

function Layout({ children, user, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/management", label: "Data Management" },
    { to: "/analytics", label: "Analytics & Map" },
  ];

  return (
    <div className="layout">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo-circle">🌿</div>
          <div>
            <div className="logo-text-main">SmartAgroForest</div>
            <div className="logo-text-sub">Cloud Monitoring</div>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={
                "nav-item" + (location.pathname === item.to ? " active" : "")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="badge">AWS-style console • Demo</span>
        </div>
      </aside>
      <div className="main-area">
        <header className="topbar">
          <button
            className="burger"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            ☰
          </button>
          <div className="topbar-title">
            Smart Agriculture & Forestry Platform
          </div>
          <div className="topbar-right">
            <span className="chip chip-green">Online</span>
            {user && (
              <>
                <span className="chip chip-outline">
                  {user.name} ({user.email})
                </span>
                <button className="chip chip-outline" onClick={onLogout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const u = await api.me();
        setUser(u);
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem("authToken");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  const handleAuthSuccess = async (newToken) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    try {
      const u = await api.me();
      setUser(u);
    } catch (err) {
      console.error("Failed to load user after login:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.warn("Logout error (ignored):", err);
    }
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="landing">
        <div className="landing-panel">
          <div className="landing-left">
            <div className="brand-pill">Smart Agriculture & Forestry</div>
            <h1>Loading your console…</h1>
            <p className="muted">
              Checking authentication status with the backend API.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Landing onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <Layout user={user} onLogout={handleLogout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/management" element={<Management />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
