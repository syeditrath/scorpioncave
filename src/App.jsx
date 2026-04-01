import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── Global CSS & Professional Theme ───────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Barlow', sans-serif; background: #e8edf5; color: #0d1f35; overflow: hidden; }
  @keyframes logoReveal { 0% { opacity: 0; transform: scale(0.5); } 100% { opacity: 1; transform: scale(1); } }
  @keyframes loadingBar { 0% { width: 0%; } 100% { width: 100%; } }
  .fade-up { animation: fadeUp 0.3s ease both; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
`;

const T = {
  bg: "#e8edf5", sidebar: "#1e3a5f", card: "#f4f7fb", border: "#b8cce0",
  text: "#0d1f35", textMuted: "#5a7a9a", blue: "#1d6fce", green: "#0d9e6e",
  gold: "#d97706", red: "#dc2626", blueDim: "rgba(29,111,206,0.12)", redDim: "rgba(220,38,38,0.12)"
};

/* ─── Data & Helpers ────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 9);
const daysUntil = d => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;

const EMPTY_DATA = {
  scorpionDocs: [], manpower: [], equipment: [], projectDocs: [],
  projects: ["NEOM Phase 1", "NEOM Phase 2", "Riyadh Metro"],
  scorpionDocCats: ["Company Registration / CR", "Insurance Policies", "Trade Licenses", "Contracts & Agreements", "IBAN", "Other"],
  manpowerCats: ["Drillers / Operators", "Safety Officers (HSE)", "Supervisors", "Laborers / General Workers"],
};

function loadData() {
  const d = localStorage.getItem("cta_v1");
  return d ? JSON.parse(d) : EMPTY_DATA;
}

/* ─── Splash Screen ─────────────────────────────────────────────────────── */
const SplashScreen = () => (
  <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle, #1a2a3a 0%, #0d1f35 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
    <div style={{ animation: 'logoReveal 1.5s ease-out forwards', marginBottom: 30 }}>
      <img src="logo.png" alt="Logo" style={{ width: 180, height: 180, borderRadius: '50%', objectFit: 'cover', border: '4px solid #ffc107' }} />
    </div>
    <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: '2.5rem', color: '#ffc107', letterSpacing: '3px' }}>WELCOME TO SCORPION WORLD</h1>
    <div style={{ width: 200, height: 4, background: 'rgba(255,255,255,0.1)', marginTop: 30, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ height: '100%', background: '#ffc107', animation: 'loadingBar 3.5s forwards' }} />
    </div>
  </div>
);

/* ─── Page Components (Fixed Logic) ─────────────────────────────────────── */
const ScorpionDocs = ({ data, setData }) => (
  <div className="fade-up">
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, marginBottom: 20 }}>SCORPION DOCUMENTS</h2>
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
      <p style={{ color: T.textMuted }}>Manage company registrations, licenses, and insurance policies.</p>
      {/* Document table/form logic would go here */}
    </div>
  </div>
);

const ManpowerPage = ({ data, setData }) => (
  <div className="fade-up">
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, marginBottom: 20 }}>MANPOWER MANAGEMENT</h2>
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
      <p style={{ color: T.textMuted }}>Track staff certifications, passports, and visas.</p>
      {/* Staff management logic goes here */}
    </div>
  </div>
);

const ProjectDocs = ({ data, setData }) => (
  <div className="fade-up">
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, marginBottom: 20 }}>PROJECT DOCUMENTS</h2>
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
      <p style={{ color: T.textMuted }}>Invoices, certificates, and site-specific documents.</p>
    </div>
  </div>
);

const EquipmentPage = ({ data, setData }) => (
  <div className="fade-up">
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, marginBottom: 20 }}>EQUIPMENT ASSETS</h2>
    <div style={{ background: "#fff", padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
      <p style={{ color: T.textMuted }}>Monitor asset status, maintenance, and TUV certifications.</p>
    </div>
  </div>
);

const Dashboard = ({ data, alerts, setPage }) => (
  <div className="fade-up">
    <h2 style={{ fontFamily: "'Barlow Condensed'", fontSize: 28, marginBottom: 20 }}>DASHBOARD OVERVIEW</h2>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
      <div style={{ background: T.card, padding: 20, borderRadius: 12, border: `1px solid ${T.border}` }}>
        <h4 style={{ color: T.textMuted, fontSize: 12 }}>TOTAL ALERTS</h4>
        <div style={{ fontSize: 32, fontWeight: 800, color: alerts.length > 0 ? T.red : T.green }}>{alerts.length}</div>
      </div>
    </div>
  </div>
);

/* ─── Main Application ──────────────────────────────────────────────────── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    const s = document.createElement("style");
    s.textContent = GLOBAL_CSS;
    document.head.appendChild(s);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("cta_v1", JSON.stringify(data));
  }, [data]);

  const allExpiries = [
    ...data.scorpionDocs.filter(d => d.expiryDate).map(d => ({ label: d.name, days: daysUntil(d.expiryDate) })),
    ...(data.projectDocs || []).filter(d => d.expiryDate).map(d => ({ label: d.name, days: daysUntil(d.expiryDate) })),
  ].filter(x => x.days !== null && x.days <= 90);

  if (showSplash) return <SplashScreen />;

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg }}>
      {/* Sidebar */}
      <aside style={{ width: 260, background: T.sidebar, display: "flex", flexDirection: "column", color: "#fff" }}>
        <div style={{ padding: 20, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <img src="logo.png" style={{ width: 60, height: 60, borderRadius: '50%', marginBottom: 10 }} alt="Logo" />
          <div style={{ fontSize: 14, fontWeight: 700 }}>SCORPION ARABIA</div>
        </div>
        <nav style={{ padding: 10 }}>
          {[
            { id: "dashboard", icon: "▦", label: "Dashboard" },
            { id: "scorpion", icon: "◉", label: "Scorpion Docs" },
            { id: "projects", icon: "◆", label: "Project Docs" },
            { id: "manpower", icon: "◈", label: "Manpower" },
            { id: "equipment", icon: "◎", label: "Equipment" }
          ].map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{
              width: "100%", padding: "12px 15px", marginBottom: 5, background: page === n.id ? "rgba(255,255,255,0.1)" : "transparent",
              border: "none", color: "#fff", textAlign: "left", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", gap: 10
            }}>
              <span style={{ fontSize: 18 }}>{n.icon}</span> {n.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, background: "#1e3a5f", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: 22, color: "#fff", letterSpacing: "2px" }}>DOCUMENT MANAGER</div>
        </header>
        <main style={{ flex: 1, overflowY: "auto", padding: 30 }}>
          {page === "dashboard" && <Dashboard data={data} alerts={allExpiries} setPage={setPage} />}
          {page === "scorpion" && <ScorpionDocs data={data} setData={setData} />}
          {page === "projects" && <ProjectDocs data={data} setData={setData} />}
          {page === "manpower" && <ManpowerPage data={data} setData={setData} />}
          {page === "equipment" && <EquipmentPage data={data} setData={setData} />}
        </main>
      </div>
    </div>
  );
}
