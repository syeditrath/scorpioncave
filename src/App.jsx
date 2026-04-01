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

/* ─── Splash Screen Component ─── */
const SplashScreen = () => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle, #1a2a3a 0%, #0d1f35 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, overflow: 'hidden'
    }}>
      <div style={{ animation: 'logoReveal 1.5s ease-out forwards', marginBottom: 30, textAlign: 'center' }}>
        <img src="logo.png" alt="Scorpion Logo" style={{ width: 180, height: 'auto', filter: 'drop-shadow(0 0 20px rgba(255,193,7,0.3))' }} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', color: '#ffc107',
          letterSpacing: '4px', fontWeight: 800, textTransform: 'uppercase', margin: 0,
          animation: 'textSlideUp 1s ease-out 0.8s both'
        }}> WELCOME TO SCORPION WORLD </h1>
        <p style={{ color: '#b8cce0', fontSize: '1rem', letterSpacing: '2px', marginTop: 10, animation: 'fadeUp 1s ease-out 1.2s both' }}>
          ADVANCED MANAGEMENT SYSTEMS
        </p>
      </div>
      <div style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.1)', marginTop: 40, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: '#ffc107', animation: 'loadingBar 3s ease-in-out forwards' }} />
      </div>
      <style>{`
        @keyframes logoReveal { 0% { opacity: 0; transform: scale(0.5) rotate(-10deg); } 100% { opacity: 1; transform: scale(1) rotate(0deg); } }
        @keyframes textSlideUp { 0% { opacity: 0; transform: translateY(30px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes loadingBar { 0% { transform: translateX(-100%); } 100% { transform: translateX(0%); } }
      `}</style>
    </div>
  );
};

/* ─── Default Data & Logic ─── */
const EMPTY_DATA = {
  scorpionDocs: [], manpowerCats: ["Drillers / Operators", "Safety Officers (HSE)", "Supervisors", "Laborers / General Workers"],
  manpower: [], equipment: [], scorpionDocCats: ["Company Registration / CR", "Insurance Policies", "Trade Licenses", "Contracts & Agreements", "IBAN", "Other"],
  projects: ["NEOM Phase 1","NEOM Phase 2","Riyadh Metro"], projectDocs: [],
};

function loadData() {
  try { const d = localStorage.getItem("cta_v1"); return d ? JSON.parse(d) : EMPTY_DATA; }
  catch { return EMPTY_DATA; }
}
function persist(data) { try { localStorage.setItem("cta_v1", JSON.stringify(data)); } catch {} }

/* ─── ROOT APP ─── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [projMod, setProjMod] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    if (!document.getElementById("ct-g")) {
      const s = document.createElement("style"); s.id = "ct-g";
      s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { persist(data); }, [data]);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(() => setToast(null), 3200); };
  const go = p => { setPage(p); setSideOpen(false); };

  const allExpiries = [
    ...data.scorpionDocs.filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Company Doc",days:daysUntil(d.expiryDate)})),
    ...(data.projectDocs||[]).filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Project Doc",days:daysUntil(d.expiryDate)})),
    ...data.manpower.flatMap(p=>[
      p.passportExpiry && {label:p.name,src:"Passport", days:daysUntil(p.passportExpiry)},
      ...(p.certs||[]).map(c=>({label:`${p.name} — ${c.name}`,src:"Cert",days:daysUntil(c.expiryDate)})),
    ].filter(Boolean)),
    ...data.equipment.flatMap(e=>[
      ...(e.certifications||[]).map(c=>({label:`${e.name} — ${c.certNo||"Cert"}`,src:"Eq Cert",days:daysUntil(c.expiryDate)})),
    ]),
  ].filter(x=>x.days!==null&&x.days<=90).sort((a,b)=>a.days-b.days);

  return (
    <>
      {showSplash && <SplashScreen />}
      <div style={{display: showSplash ? "none" : "flex", height:"100vh", overflow:"hidden", background:T.bg}}>
        {sideOpen && <div className="fade-in" onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(13,31,53,0.45)",zIndex:49}}/>}

        <Sidebar page={page} go={go} sideOpen={sideOpen} alerts={allExpiries.length} data={data} onManageProjects={()=>{setSideOpen(false);setProjMod(true);}}/>

        <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0}}>
          <header style={{background:"#1e3a5f", borderBottom:"1px solid #b8cce0", padding:"0 20px", flexShrink:0, boxShadow:"0 2px 8px rgba(13,31,53,0.2)"}}>
            <div style={{display:"flex", alignItems:"center", height:64, position:"relative"}}>
              <button onClick={()=>setSideOpen(true)} style={{background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"#ffffff", borderRadius:8, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0, zIndex:1}}>☰</button>
              <div style={{position:"absolute", left:0, right:0, textAlign:"center", pointerEvents:"none"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:24, color:"#ffffff", letterSpacing:"3px"}}>SCORPION ARABIA</div>
              </div>
            </div>
          </header>

          <main style={{flex:1, overflowY:"auto", padding:"24px 20px"}}>
             {page==="dashboard" && <Dashboard data={data} alerts={allExpiries} go={go}/>}
             {/* Additional pages (ScorpionDocs, etc) would be rendered here */}
          </main>
        </div>
      </div>
    </>
  );
}

/* Sidebar and other sub-components go here... */

/* ─── Sidebar ───────────────────────────────────────────────────────────── */
function Sidebar({page, go, alerts}) {
  const NAV = [
    {id:"dashboard", icon:"▦", label:"Dashboard"},
    {id:"scorpion", icon:"◉", label:"Company Documents"},
    {id:"projects", icon:"◆", label:"Project Documents"},
    {id:"manpower", icon:"◈", label:"Manpower Manager"},
    {id:"equipment", icon:"◎", label:"Equipment & TUV"},
  ];

  return (
    <aside style={{ width: 260, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 20px", borderBottom: `1px solid rgba(255,255,255,0.1)`, display: "flex", alignItems: "center", gap: 14 }}>
        <img src="logo.png" alt="Logo" style={{ width: 54, height: 54, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.2)" }} />
        <div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 18, fontFamily: "'Barlow Condensed'" }}>SCORPION</div>
          <div style={{ color: "#93c5fd", fontSize: 10, fontWeight: 600 }}>ARABIA</div>
        </div>
      </div>
      <nav style={{ padding: 12, flex: 1 }}>
        {NAV.map(n => (
          <button key={n.id} onClick={() => go(n.id)} style={{ width: "100%", padding: "12px 14px", background: page === n.id ? "rgba(59,130,246,0.2)" : "transparent", border: "none", color: page === n.id ? "#fff" : "#b8cce0", textAlign: "left", borderRadius: 10, marginBottom: 4, display: "flex", alignItems: "center", gap: 12, transition: "0.2s" }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{n.label}</span>
            {n.id === "dashboard" && alerts > 0 && <span style={{ marginLeft: "auto", background: T.red, color: "#fff", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 800 }}>{alerts}</span>}
          </button>
        ))}
      </nav>
    </aside>
  );
}

/* ─── Main Application Component ────────────────────────────────────────── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState(() => {
    const d = localStorage.getItem("cta_v1");
    return d ? JSON.parse(d) : { scorpionDocs: [], manpower: [], equipment: [], projectDocs: [], projects: ["NEOM", "Riyadh"], scorpionDocCats: ["CR", "Trade License"], manpowerCats: ["Operator", "HSE"] };
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
    ...data.scorpionDocs.filter(d => d.expiryDate).map(d => ({ label: d.name, src: "Company", days: daysUntil(d.expiryDate) })),
    ...(data.projectDocs || []).filter(d => d.expiryDate).map(d => ({ label: d.name, src: "Project", days: daysUntil(d.expiryDate) })),
    ...data.manpower.flatMap(p => [
      p.iqamaExpiry && { label: `${p.name} (Iqama)`, src: "Manpower", days: daysUntil(p.iqamaExpiry) },
      p.passportExpiry && { label: `${p.name} (Passport)`, src: "Manpower", days: daysUntil(p.passportExpiry) }
    ].filter(Boolean))
  ].filter(x => x.days !== null && x.days <= 90).sort((a, b) => a.days - b.days);

  if (showSplash) return <SplashScreen />;

  return (
    <div style={{ display: "flex", height: "100vh", background: T.bg }}>
      <Sidebar page={page} go={setPage} alerts={allExpiries.length} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <header style={{ height: 64, background: "#1e3a5f", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${T.border}` }}>
          <h2 style={{ color: "#fff", fontFamily: "'Barlow Condensed'", letterSpacing: 4, fontWeight: 800 }}>SCORPION ARABIA</h2>
        </header>
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          {page === "dashboard" && <Dashboard data={data} alerts={allExpiries} />}
          {page === "scorpion" && <ScorpionDocs data={data} setData={setData} />}
          {page === "projects" && <ProjectDocs data={data} setData={setData} />}
          {page === "manpower" && <ManpowerPage data={data} setData={setData} />}
          {page === "equipment" && <EquipmentPage data={data} setData={setData} />}
        </main>
      </div>
    </div>
  );
}

/* ─── Page: Dashboard ────────────────────────────────────────────────────── */
function Dashboard({ data, alerts }) {
  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: 20, fontFamily: "'Barlow Condensed'", fontSize: 24 }}>Dashboard Overview</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 30 }}>
        <Card style={{ borderLeft: `5px solid ${T.red}` }}>
          <div style={{ color: T.textMuted, fontSize: 12, fontWeight: 700 }}>ACTIVE ALERTS</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: T.red }}>{alerts.length}</div>
        </Card>
        <Card style={{ borderLeft: `5px solid ${T.blue}` }}>
          <div style={{ color: T.textMuted, fontSize: 12, fontWeight: 700 }}>TOTAL PERSONNEL</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: T.blue }}>{data.manpower.length}</div>
        </Card>
        <Card style={{ borderLeft: `5px solid ${T.green}` }}>
          <div style={{ color: T.textMuted, fontSize: 12, fontWeight: 700 }}>EQUIPMENT COUNT</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: T.green }}>{data.equipment.length}</div>
        </Card>
      </div>

      <Card noPad>
        <div style={{ padding: 16, borderBottom: `1px solid ${T.border}`, fontWeight: 700, fontSize: 14 }}>EXPIRATION WATCHLIST</div>
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {alerts.length === 0 ? <div style={{ padding: 20, color: T.textMuted }}>No items expiring soon.</div> : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: T.bg, fontSize: 11, textAlign: "left" }}>
                <tr>
                  <th style={{ padding: 12 }}>ITEM NAME</th>
                  <th style={{ padding: 12 }}>CATEGORY</th>
                  <th style={{ padding: 12 }}>DAYS LEFT</th>
                  <th style={{ padding: 12 }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => {
                  const s = getStatus(a.days);
                  return (
                    <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                      <td style={{ padding: 12, fontWeight: 600 }}>{a.label}</td>
                      <td style={{ padding: 12 }}>{a.src}</td>
                      <td style={{ padding: 12 }}>{a.days} days</td>
                      <td style={{ padding: 12 }}><span style={{ padding: "4px 8px", borderRadius: 6, background: s.bg, color: s.color, fontWeight: 700, fontSize: 10 }}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ─── Page: Scorpion Documents ───────────────────────────────────────────── */
function ScorpionDocs({ data, setData }) {
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", category: "", expiryDate: "" });

  const add = () => {
    if (!form.name) return;
    setData(prev => ({ ...prev, scorpionDocs: [...prev.scorpionDocs, { ...form, id: uid() }] }));
    setForm({ name: "", category: "", expiryDate: "" });
    setShowAdd(false);
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h3 style={{ fontFamily: "'Barlow Condensed'", fontSize: 24 }}>Company Documents</h3>
        <button onClick={() => setShowAdd(true)} style={{ background: T.blue, color: "#fff", border: "none", padding: "10px 20px", borderRadius: 8, fontWeight: 600 }}>+ Add Document</button>
      </div>

      {showAdd && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "end" }}>
            <Input label="Document Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Input label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} type="select" options={data.scorpionDocCats} />
            <Input label="Expiry Date" value={form.expiryDate} onChange={v => setForm({ ...form, expiryDate: v })} type="date" />
            <button onClick={add} style={{ height: 40, padding: "0 20px", background: T.green, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, marginBottom: 16 }}>Save</button>
          </div>
        </Card>
      )}

      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: T.bg, fontSize: 11, textAlign: "left" }}>
            <tr>
              <th style={{ padding: 16 }}>DOCUMENT</th>
              <th style={{ padding: 16 }}>CATEGORY</th>
              <th style={{ padding: 16 }}>EXPIRY</th>
              <th style={{ padding: 16 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {data.scorpionDocs.map(d => {
              const s = getStatus(daysUntil(d.expiryDate));
              return (
                <tr key={d.id} style={{ borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
                  <td style={{ padding: 16, fontWeight: 700 }}>{d.name}</td>
                  <td style={{ padding: 16 }}>{d.category}</td>
                  <td style={{ padding: 16 }}>{fmtDate(d.expiryDate)}</td>
                  <td style={{ padding: 16 }}><span style={{ padding: "4px 8px", borderRadius: 6, background: s.bg, color: s.color, fontWeight: 700, fontSize: 11 }}>{s.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─── Page: Manpower Page ────────────────────────────────────────────────── */
function ManpowerPage({ data, setData }) {
  const [form, setForm] = useState({ name: "", iqama: "", iqamaExpiry: "", category: "" });

  const add = () => {
    if (!form.name) return;
    setData(prev => ({ ...prev, manpower: [...prev.manpower, { ...form, id: uid() }] }));
    setForm({ name: "", iqama: "", iqamaExpiry: "", category: "" });
  };

  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: 20, fontFamily: "'Barlow Condensed'", fontSize: 24 }}>Manpower Manager</h3>
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, alignItems: "end" }}>
          <Input label="Staff Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
          <Input label="Iqama Number" value={form.iqama} onChange={v => setForm({ ...form, iqama: v })} />
          <Input label="Iqama Expiry" value={form.iqamaExpiry} onChange={v => setForm({ ...form, iqamaExpiry: v })} type="date" />
          <Input label="Category" value={form.category} onChange={v => setForm({ ...form, category: v })} type="select" options={data.manpowerCats} />
          <button onClick={add} style={{ height: 40, padding: "0 20px", background: T.blue, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, marginBottom: 16 }}>+ Add Staff</button>
        </div>
      </Card>

      <Card noPad>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: T.bg, fontSize: 11, textAlign: "left" }}>
            <tr>
              <th style={{ padding: 16 }}>NAME</th>
              <th style={{ padding: 16 }}>IQAMA</th>
              <th style={{ padding: 16 }}>EXPIRY</th>
              <th style={{ padding: 16 }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {data.manpower.map(p => {
              const s = getStatus(daysUntil(p.iqamaExpiry));
              return (
                <tr key={p.id} style={{ borderBottom: `1px solid ${T.border}`, fontSize: 14 }}>
                  <td style={{ padding: 16, fontWeight: 700 }}>{p.name}</td>
                  <td style={{ padding: 16 }}>{p.iqama}</td>
                  <td style={{ padding: 16 }}>{fmtDate(p.iqamaExpiry)}</td>
                  <td style={{ padding: 16 }}><span style={{ padding: "4px 8px", borderRadius: 6, background: s.bg, color: s.color, fontWeight: 700, fontSize: 11 }}>{s.label}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ─── Page: Project Documents ────────────────────────────────────────────── */
function ProjectDocs({ data, setData }) {
  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: 20, fontFamily: "'Barlow Condensed'", fontSize: 24 }}>Project Invoices & Documents</h3>
      <Card>
        <div style={{ color: T.textMuted, textAlign: "center", padding: "40px 0" }}>
          <h4>Select a Project to view documents</h4>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
            {data.projects.map(p => (
              <button key={p} style={{ padding: "10px 24px", border: `1px solid ${T.border}`, background: "#fff", borderRadius: 8, fontWeight: 600 }}>{p}</button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

/* ─── Page: Equipment & TUV ──────────────────────────────────────────────── */
function EquipmentPage({ data, setData }) {
  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: 20, fontFamily: "'Barlow Condensed'", fontSize: 24 }}>Equipment Assets & TUV</h3>
      <Card noPad>
        <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>
          <p>Equipment management module active. Total assets: {data.equipment.length}</p>
        </div>
      </Card>
    </div>
  );
}
