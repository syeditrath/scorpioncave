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

const uid = () => Math.random().toString(36).slice(2,9);
const daysUntil = d => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
function getStatus(days) {
  if (days === null) return { label:"Unknown", color:T.textMuted, bg:"rgba(61,80,104,.15)" };
  if (days < 0) return { label:"Expired", color:T.red, bg:T.redDim };
  if (days <= 90) return { label:"Expiring Soon", color:T.gold, bg:T.goldDim };
  return { label:"Valid", color:T.green, bg:T.greenDim };
}

/* ─── Splash Screen Component ────────────────────────────────────────────── */
const SplashScreen = () => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle, #1a2a3a 0%, #0d1f35 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, overflow: 'hidden'
    }}>
      <div style={{ animation: 'logoReveal 1.5s ease-out forwards', marginBottom: 30, textAlign: 'center' }}>
        <img 
          src="logo.png" 
          alt="Scorpion Logo" 
          style={{ 
            width: 180, height: 180, borderRadius: '50%', objectFit: 'cover',
            filter: 'drop-shadow(0 0 20px rgba(255,193,7,0.4))' 
          }} 
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: '3rem', color: '#ffc107', 
          letterSpacing: '4px', fontWeight: 800, textTransform: 'uppercase', margin: 0,
          animation: 'textSlideUp 1s ease-out 0.8s both'
        }}>
          WELCOME TO SCORPION WORLD
        </h1>
        <p style={{
          color: '#b8cce0', fontSize: '1.1rem', letterSpacing: '2px', marginTop: 10,
          animation: 'fadeUp 1s ease-out 1.2s both'
        }}>
          ADVANCED MANAGEMENT SYSTEMS
        </p>
      </div>

      <div style={{ width: 220, height: 4, background: 'rgba(255,255,255,0.1)', marginTop: 40, borderRadius: 10, overflow: 'hidden' }}>
        <div style={{ width: '100%', height: '100%', background: '#ffc107', animation: 'loadingBar 3.5s ease-in-out forwards' }} />
      </div>
    </div>
  );
};

/* ─── Sidebar Component ─────────────────────────────────────────────────── */
const Sidebar = ({page, go, sideOpen, alerts, data, onManageProjects}) => {
  const NavItem = ({id, label, icon}) => {
    const active = page === id;
    return (
      <button onClick={()=>go(id)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderRadius:10,border:"none",background:active?"rgba(255,255,255,0.1)":"transparent",color:active?"#fff":"#b8cce0",marginBottom:4,transition:"0.2s"}}>
        <span style={{fontSize:18}}>{icon}</span>
        <span style={{fontSize:14,fontWeight:active?700:500,flex:1,textAlign:"left"}}>{label}</span>
        {id==="dashboard" && alerts > 0 && <span style={{background:T.red,color:"#fff",fontSize:10,fontWeight:800,padding:"2px 7px",borderRadius:10}}>{alerts}</span>}
      </button>
    );
  };

  return (
    <aside style={{
      width:280, background:T.sidebar, display:"flex", flexDirection:"column", transition:"transform 0.3s ease",
      position:window.innerWidth<1024?"fixed":"relative", zIndex:50, height:"100%",
      transform:window.innerWidth<1024 && !sideOpen ? "translateX(-100%)" : "translateX(0)"
    }}>
      <div style={{padding:"24px", borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex", alignItems:"center", gap:14}}>
          {/* Circular Logo replacing the 'S' box */}
          <img 
            src="logo.png" 
            alt="Logo" 
            style={{ 
              width: 44, height: 44, borderRadius: '50%', objectFit: 'cover',
              border: "2px solid rgba(255,255,255,0.1)"
            }} 
          />
          <div>
            <div style={{color:"#fff", fontWeight:800, fontSize:16, letterSpacing:1}}>SCORPION</div>
            <div style={{color:"#93c5fd", fontSize:11, fontWeight:600}}>ARABIA</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1, padding:16, overflowY:"auto"}}>
        <NavItem id="dashboard" label="Dashboard" icon="📊" />
        <div style={{height:1, background:"rgba(255,255,255,0.05)", margin:"12px 0"}} />
        <NavItem id="scorpion" label="Company Documents" icon="🏢" />
        <NavItem id="projects" label="Project Documents" icon="🏗️" />
        <NavItem id="manpower" label="Manpower Manager" icon="👥" />
        <NavItem id="equipment" label="Equipment & TUV" icon="🚜" />
      </nav>
      <div style={{padding:16, borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <button onClick={onManageProjects} style={{width:"100%", padding:"12px", borderRadius:10, background:"rgba(255,255,255,0.05)", color:"#fff", border:"1px solid rgba(255,255,255,0.1)", fontSize:13, fontWeight:600}}>⚙ Manage Projects</button>
      </div>
    </aside>
  );
};

/* ─── Main App ───────────────────────────────────────────────────────────── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState(() => {
    try { const d = localStorage.getItem("cta_v1"); return d ? JSON.parse(d) : {scorpionDocs:[], projects:["NEOM","Riyadh"], projectDocs:[], manpower:[], equipment:[], scorpionDocCats:["CR","Insurance"]}; }
    catch { return {scorpionDocs:[], projects:[], projectDocs:[], manpower:[], equipment:[], scorpionDocCats:[]}; }
  });
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [projMod, setProjMod] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!document.getElementById("ct-g")) {
      const s = document.createElement("style"); 
      s.id = "ct-g"; s.textContent = GLOBAL_CSS; document.head.appendChild(s);
    }
  }, []);

  useEffect(() => { localStorage.setItem("cta_v1", JSON.stringify(data)); }, [data]);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(() => setToast(null), 3200); };
  const go = p => { setPage(p); setSideOpen(false); };

  const allExpiries = [
    ...data.scorpionDocs.filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Company",days:daysUntil(d.expiryDate)})),
    ...(data.projectDocs||[]).filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Project",days:daysUntil(d.expiryDate)}))
  ].filter(x=>x.days!==null&&x.days<=90).sort((a,b)=>a.days-b.days);

  return (
    <>
      {showSplash && <SplashScreen />}
      <div style={{
        display: "flex", height: "100vh", overflow: "hidden", background: T.bg,
        opacity: showSplash ? 0 : 1, transition: 'opacity 0.6s ease-in-out'
      }}>
        {sideOpen && <div className="fade-in" onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(13,31,53,0.45)",zIndex:49}}/>}

        <Sidebar page={page} go={go} sideOpen={sideOpen} alerts={allExpiries.length} data={data} onManageProjects={()=>{setSideOpen(false);setProjMod(true);}}/>

        <div style={{flex:1, display:"flex", flexDirection:"column", overflow:"hidden", minWidth:0}}>
          <header style={{background:"#1e3a5f", borderBottom:"1px solid #b8cce0", padding:"0 20px", flexShrink:0, boxShadow:"0 2px 8px rgba(13,31,53,0.2)"}}>
            <div style={{display:"flex", alignItems:"center", height:64, position:"relative"}}>
              <button onClick={()=>setSideOpen(true)} style={{background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"#ffffff", borderRadius:8, width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, zIndex:1}}>☰</button>
              <div style={{position:"absolute", left:0, right:0, textAlign:"center", pointerEvents:"none"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:22, color:"#ffffff", letterSpacing:"3px"}}>SCORPION ARABIA</div>
              </div>
            </div>
          </header>

          <main style={{flex:1, overflowY:"auto", padding:"24px 20px"}}>
             {page==="dashboard" && <div className="fade-in"><h2>Dashboard</h2><p>Welcome back to Scorpion Arabia.</p></div>}
             {page==="projects" && <ProjectDocs data={data} setData={setData} showToast={showToast} />}
             {/* Other pages would go here... */}
          </main>
        </div>

        {toast && (
          <div className="fade-up" style={{position:"fixed", bottom:24, right:24, background:toast.type==="del"?"#fee2e2":"#d1fae5", border:`1px solid ${toast.type==="del"?T.red:T.green}`, color:toast.type==="del"?T.red:T.green, borderRadius:10, padding:"12px 20px", fontWeight:600}}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Placeholder ProjectDocs for full logic ─── */
function ProjectDocs({data, setData, showToast}) {
  const [subTab, setSubTab] = useState("invoices");
  // Logic from previous fix goes here...
  return <div>Project Docs Content</div>;
}
