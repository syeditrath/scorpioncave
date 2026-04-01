import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

/* ─── Global CSS ─────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Barlow', sans-serif; background: #e8edf5; color: #0d1f35; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #e8edf5; }
  ::-webkit-scrollbar-thumb { background: #b8cce0; border-radius: 3px; }
  input, select, textarea, button { font-family: 'Barlow', sans-serif; }
  button { cursor: pointer; }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
  @keyframes slideUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn  { from{opacity:0;}to{opacity:1;} }
  @keyframes slideIn { from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);} }
  .fade-up  { animation: fadeUp  0.3s ease both; }
  .slide-up { animation: slideUp 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }
  .fade-in  { animation: fadeIn  0.2s ease both; }
  .slide-in { animation: slideIn 0.3s ease both; }
  @keyframes logoReveal {
    0% { opacity: 0; transform: scale(0.5) rotate(-10deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes textSlideUp {
    0% { opacity: 0; transform: translateY(30px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  @keyframes loadingBar {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0%); }
  }
`;

/* ─── Theme ──────────────────────────────────────────────────────────────── */
const T = {
  bg:"#e8edf5",
  sidebar:"#1e3a5f",
  card:"#f4f7fb",
  card2:"#d4dff0",
  cardHover:"#d4dff0",
  border:"#b8cce0",
  borderLight:"#b8cce0",
  text:"#0d1f35",
  textSub:"#2d4a6b",
  textMuted:"#5a7a9a",
  blue:"#1d6fce",
  green:"#0d9e6e",
  gold:"#d97706",
  red:"#dc2626",
  purple:"#7c3aed",
  teal:"#0891b2",
  orange:"#ea580c",
  blueDim:"rgba(29,111,206,0.12)",
  greenDim:"rgba(13,158,110,0.12)",
  goldDim:"rgba(217,119,6,0.12)",
  redDim:"rgba(220,38,38,0.12)",
  purpleDim:"rgba(124,58,237,0.12)",
  tealDim:"rgba(8,145,178,0.12)",
  orangeDim:"rgba(234,88,12,0.12)",
  inputBg:"#f4f7fb",
  shadow:"0 4px 16px rgba(13,31,53,0.10)",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const uid       = () => Math.random().toString(36).slice(2,9);
const daysUntil = d  => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;
const fmtDate   = d  => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
function getStatus(days) {
  if (days === null) return { label:"Unknown", color:T.textMuted, bg:"rgba(61,80,104,.15)" };
  if (days < 0) return { label:"Expired", color:T.red, bg:T.redDim };
  if (days <= 90) return { label:"Expiring Soon", color:T.gold, bg:T.goldDim };
  return { label:"Valid", color:T.green, bg:T.greenDim };
}

/* ─── Splash Screen Component ────────────────────────────────────────────── */
const SplashScreen = () => (
  <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(circle, #1a2a3a 0%, #0d1f35 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
    <div style={{ animation: 'logoReveal 1.5s ease-out forwards', marginBottom: 30 }}>
      <img src="logo.png" alt="Logo" style={{ width: 180, height: 180, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,193,7,0.3)' }} />
    </div>
    <div style={{ textAlign: 'center' }}>
      <h1 style={{ fontFamily: "'Barlow Condensed'", fontSize: '3rem', color: '#ffc107', letterSpacing: '4px', fontWeight: 800 }}>WELCOME TO SCORPION WORLD</h1>
      <p style={{ color: '#b8cce0', fontSize: '1.1rem', letterSpacing: '2px', marginTop: 10 }}>ADVANCED ASSET MANAGEMENT</p>
    </div>
    <div style={{ width: 220, height: 4, background: 'rgba(255,255,255,0.1)', marginTop: 40, borderRadius: 10, overflow: 'hidden' }}>
      <div style={{ width: '100%', height: '100%', background: '#ffc107', animation: 'loadingBar 3.5s ease-in-out forwards' }} />
    </div>
  </div>
);

/* ─── Sidebar ───────────────────────────────────────────────────────────── */
function Sidebar({page, go, sideOpen, alerts, data, onManageProjects}) {
  const NAV = [
    {id:"dashboard", icon:"▦", label:"Dashboard", desc:"Overview"},
    {id:"scorpion", icon:"◉", label:"Scorpion Documents", desc:"Company docs"},
    {id:"projects", icon:"◆", label:"Project Docs", desc:"Invoices & orders"},
    {id:"manpower", icon:"◈", label:"Manpower", desc:"Staff tracking"},
    {id:"equipment", icon:"◎", label:"Equipment", desc:"Assets & TUV"},
  ];

  return (
    <aside style={{
      width:255, background:T.sidebar, borderRight:`1px solid ${T.border}`, display:"flex", flexDirection:"column", height:"100%"
    }}>
      <div style={{padding:"22px 20px", borderBottom:`1px solid rgba(255,255,255,0.1)`}}>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          <img src="logo.png" alt="Logo" style={{ width: 50, height: 50, borderRadius: '50%', border: "2px solid rgba(255,255,255,0.1)" }} />
          <div>
            <div style={{fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:20, color:"#fff"}}>SCORPION</div>
            <div style={{fontSize:10, color:"#93c5fd"}}>ARABIA</div>
          </div>
        </div>
      </div>
      <nav style={{padding:"14px 10px", flex:1}}>
        {NAV.map(n => (
          <button key={n.id} onClick={()=>go(n.id)} style={{width:"100%", display:"flex", alignItems:"center", gap:10, padding:"11px 12px", borderRadius:8, border:"none", background:page===n.id?"rgba(59,130,246,0.15)":"transparent", textAlign:"left", marginBottom:3, color:page===n.id?"#93c5fd":"#e2e8f0"}}>
            <span style={{fontSize:20}}>{n.icon}</span>
            <div style={{flex:1}}><div style={{fontSize:13, fontWeight:600}}>{n.label}</div></div>
            {n.id === "dashboard" && alerts > 0 && <span style={{background:T.red, color:"#fff", borderRadius:999, padding:"1px 7px", fontSize:10}}>{alerts}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}

/* ─── Main App ───────────────────────────────────────────────────────────── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState(() => {
    const d = localStorage.getItem("cta_v1");
    return d ? JSON.parse(d) : {scorpionDocs:[], manpower:[], equipment:[], projectDocs:[], projects:["NEOM","Riyadh"], scorpionDocCats:[], manpowerCats:[]};
  });
  const [page, setPage] = useState("dashboard");

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    if (!document.getElementById("ct-g")) {
      const s = document.createElement("style"); s.id = "ct-g"; s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { localStorage.setItem("cta_v1", JSON.stringify(data)); }, [data]);

  const allExpiries = [
    ...data.scorpionDocs.filter(d=>d.expiryDate).map(d=>({label:d.name, days:daysUntil(d.expiryDate)})),
    ...(data.projectDocs||[]).filter(d=>d.expiryDate).map(d=>({label:d
