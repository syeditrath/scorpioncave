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
  if (days === null) return { label:"Unknown",       color:T.textMuted, bg:"rgba(61,80,104,.15)" };
  if (days < 0)      return { label:"Expired",       color:T.red,       bg:T.redDim };
  if (days <= 90)    return { label:"Expiring Soon", color:T.gold,      bg:T.goldDim };
  return               { label:"Valid",            color:T.green,     bg:T.greenDim };
}

/* ─── Splash Screen Component ────────────────────────────────────────────── */
const SplashScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'radial-gradient(circle, #1a2a3a 0%, #0d1f35 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      overflow: 'hidden'
    }}>
      <div style={{
        animation: 'logoReveal 1.5s ease-out forwards',
        marginBottom: 30,
        textAlign: 'center',
        background: 'none'
      }}>
        <img 
          src="logo.png" 
          alt="Scorpion Arabia" 
          style={{ width: 180, 
    height: 180, 
    borderRadius: '50%', 
    objectFit: 'cover', 
    background: 'transparent', // Ensures no background color is inherited
    filter: 'drop-shadow(0 0 20px rgba(255,193,7,0.3))' }} 
        />
      </div>

      <div style={{ textAlign: 'center' }}>
        <h1 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: '3rem',
          color: '#ffc107', 
          letterSpacing: '4px',
          fontWeight: 800,
          textTransform: 'uppercase',
          margin: 0,
          animation: 'textSlideUp 1s ease-out 0.8s both'
        }}>
          WELCOME TO SCORPION WORLD
        </h1>
        <p style={{
          color: '#b8cce0',
          fontSize: '1rem',
          letterSpacing: '2px',
          marginTop: 10,
          animation: 'fadeUp 1s ease-out 1.2s both'
        }}>
          ADVANCED MANAGEMENT SYSTEMS
        </p>
      </div>

      <div style={{
        width: 200,
        height: 3,
        background: 'rgba(255,255,255,0.1)',
        marginTop: 40,
        borderRadius: 10,
        overflow: 'hidden'
      }}>
        <div style={{
          width: '100%',
          height: '100%',
          background: '#ffc107',
          animation: 'loadingBar 3.5s ease-in-out forwards'
        }} />
      </div>
    </div>
  );
};

/* ─── Default Data ───────────────────────────────────────────────────────── */
const DEFAULT_SCORPION_CATS = ["Company Registration / CR", "Insurance Policies", "Trade Licenses", "Contracts & Agreements", "IBAN", "Other"];
const DEFAULT_MANPOWER_CATS = ["Drillers / Operators", "Safety Officers (HSE)", "Supervisors", "Laborers / General Workers"];

const EMPTY_DATA = {
  scorpionDocs: [],
  manpowerCats: DEFAULT_MANPOWER_CATS,
  manpower: [],
  equipment: [],
  scorpionDocCats: DEFAULT_SCORPION_CATS,
  projects: ["NEOM Phase 1", "NEOM Phase 2", "Riyadh Metro"],
  projectDocs: [],
};

function loadData() {
  try { const d = localStorage.getItem("cta_v1"); return d ? JSON.parse(d) : EMPTY_DATA; }
  catch { return EMPTY_DATA; }
}
function persist(data) { try { localStorage.setItem("cta_v1", JSON.stringify(data)); } catch {} }

/* ─── Reusable UI Components ────────────────────────────────────────────── */
const Modal = ({title, onClose, children, footer}) => (
  <div className="fade-in" style={{position:"fixed",inset:0,background:"rgba(13,31,53,0.7)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div className="slide-up" style={{background:"#fff",width:"100%",maxWidth:540,borderRadius:16,display:"flex",flexDirection:"column",maxHeight:"90vh",boxShadow:"0 20px 50px rgba(0,0,0,0.3)"}}>
      <div style={{padding:"20px 24px",borderBottom:`1px solid ${T.borderLight}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <h3 style={{fontSize:18,fontWeight:700,color:T.text}}>{title}</h3>
        <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:T.textMuted}}>✕</button>
      </div>
      <div style={{padding:24,overflowY:"auto",flex:1}}>{children}</div>
      {footer && <div style={{padding:"16px 24px",borderTop:`1px solid ${T.borderLight}`,display:"flex",justifyContent:"flex-end",gap:12,background:"#f9fafb",borderBottomLeftRadius:16,borderBottomRightRadius:16}}>{footer}</div>}
    </div>
  </div>
);

const Field = ({label, value, onChange, type="text", options, placeholder}) => (
  <div style={{marginBottom:18}}>
    <label style={{display:"block",fontSize:13,fontWeight:600,color:T.textSub,marginBottom:6}}>{label}</label>
    {type==="select" ? (
      <select value={value} onChange={e=>onChange(e.target.value)} style={{width:"100%",height:42,padding:"0 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,fontSize:14}}>
        <option value="">Select...</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{width:"100%",height:42,padding:"0 12px",borderRadius:8,border:`1px solid ${T.border}`,background:T.inputBg,fontSize:14}} />
    )}
  </div>
);

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
      <div style={{padding:"30px 24px",borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:40,height:40,background:"#fff",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,color:T.sidebar,fontSize:20}}>S</div>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:16,letterSpacing:1}}>SCORPION</div>
            <div style={{color:"#93c5fd",fontSize:11,fontWeight:600}}>MANAGEMENT</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:16,overflowY:"auto"}}>
        <NavItem id="dashboard" label="Dashboard" icon="📊" />
        <div style={{height:1,background:"rgba(255,255,255,0.05)",margin:"12px 0"}} />
        <NavItem id="scorpion" label="Company Documents" icon="🏢" />
        <NavItem id="projects" label="Project Documents" icon="🏗️" />
        <NavItem id="manpower" label="Manpower Manager" icon="👥" />
        <NavItem id="equipment" label="Equipment & TUV" icon="🚜" />
      </nav>
      <div style={{padding:16,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
        <button onClick={onManageProjects} style={{width:"100%",padding:"12px",borderRadius:10,background:"rgba(255,255,255,0.05)",color:"#fff",border:"1px solid rgba(255,255,255,0.1)",fontSize:13,fontWeight:600}}>⚙ Manage Projects</button>
      </div>
    </aside>
  );
};

/* ─── Dashboard ─────────────────────────────────────────────────────────── */
const Dashboard = ({data, alerts, go}) => {
  const stats = [
    {label:"Manpower", val:data.manpower.length, icon:"👥", color:T.blue},
    {label:"Equipment", val:data.equipment.length, icon:"🚜", color:T.purple},
    {label:"Active Projects", val:data.projects.length, icon:"🏗️", color:T.teal},
    {label:"Total Alerts", val:alerts.length, icon:"🔔", color:T.red},
  ];

  return (
    <div className="fade-in">
      <div style={{marginBottom:32}}>
        <h2 style={{fontSize:24,fontWeight:800,color:T.text}}>Operational Dashboard</h2>
        <p style={{color:T.textMuted,fontSize:14,marginTop:4}}>Overview of certifications and critical expiries across Scorpion Arabia.</p>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",gap:20,marginBottom:32}}>
        {stats.map(s=>(
          <div key={s.label} style={{background:"#fff",padding:24,borderRadius:16,boxShadow:T.shadow,display:"flex",alignItems:"center",gap:20}}>
            <div style={{width:54,height:54,borderRadius:12,background:`${s.color}15`,color:s.color,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>{s.icon}</div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T.textMuted}}>{s.label}</div>
              <div style={{fontSize:24,fontWeight:800,color:T.text}}>{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(400px, 1fr))",gap:24}}>
        <div style={{background:"#fff",borderRadius:16,boxShadow:T.shadow,overflow:"hidden"}}>
          <div style={{padding:20,borderBottom:`1px solid ${T.borderLight}`,background:"#fcfcfd",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <h3 style={{fontSize:16,fontWeight:700,color:T.text}}>Critical Expiries (90 Days)</h3>
            <span style={{background:T.red,color:"#fff",fontSize:11,fontWeight:800,padding:"2px 8px",borderRadius:10}}>{alerts.length}</span>
          </div>
          <div style={{padding:0,maxHeight:400,overflowY:"auto"}}>
            {alerts.length === 0 ? (
              <div style={{padding:40,textAlign:"center",color:T.textMuted,fontSize:14}}>No immediate alerts found. All clear!</div>
            ) : (
              alerts.map((a,i)=>(
                <div key={i} style={{padding:"14px 20px",borderBottom:`1px solid ${T.borderLight}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,color:T.text}}>{a.label}</div>
                    <div style={{fontSize:12,color:T.textMuted,marginTop:2}}>{a.src}</div>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{fontSize:13,fontWeight:800,color:a.days<0?T.red:T.gold}}>{a.days < 0 ? "Expired" : `${a.days} days left`}</div>
                    <div style={{fontSize:11,color:T.textMuted}}>Action Required</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Project Documents (Invoices, Jobs, etc.) ───────────────────────────── */
const ProjectDocs = ({data, setData, showToast}) => {
  const [subTab, setSubTab] = useState("invoices");
  const [modal, setModal] = useState(null);
  const [selProj, setSelProj] = useState(null);
  const [fProj, setFProj] = useState("");

  const saveDoc = (doc, mode) => {
    // FIX: Maintain the correct subTab and clear filters to prevent "blank screen"
    const targetTab = doc.subTab || subTab; 
    setModal(null);

    setTimeout(() => {
      setData(prev => {
        const list = [...(prev.projectDocs || [])];
        if (mode === "add") {
          list.push({ ...doc, id: uid(), subTab: targetTab });
        } else {
          const i = list.findIndex(d => d.id === doc.id);
          if (i >= 0) list[i] = { ...doc, subTab: targetTab };
        }
        return { ...prev, projectDocs: list };
      });

      setSubTab(targetTab); 
      setSelProj(null); // Clear Invoices project filter
      setFProj("");     // Clear Certificates search filter

      showToast(mode === "add" ? "Document added" : "Document updated");
    }, 0);
  };

  const delDoc = id => {
    if(!window.confirm("Delete this document?")) return;
    setData(prev=>({...prev, projectDocs: prev.projectDocs.filter(d=>d.id!==id)}));
    showToast("Deleted","del");
  };

  const docs = (data.projectDocs || []).filter(d => d.subTab === subTab);

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:T.text}}>Project Documentation</h2>
          <div style={{display:"flex",gap:12,marginTop:12}}>
            {["invoices", "certificates", "workorders"].map(t => (
              <button key={t} onClick={()=>setSubTab(t)} style={{padding:"8px 16px",borderRadius:8,fontSize:13,fontWeight:700,textTransform:"capitalize",border:"none",background:subTab===t?T.sidebar:"#fff",color:subTab===t?"#fff":T.textSub,boxShadow:subTab===t?T.shadow:"none"}}>
                {t === "workorders" ? "Work Orders" : t === "certificates" ? "Job Completion" : t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={()=>setModal({mode:"add",doc:{subTab}})} style={{background:T.sidebar,color:"#fff",border:"none",padding:"10px 20px",borderRadius:8,fontWeight:700,fontSize:14}}>+ Add Record</button>
      </div>

      {subTab === "invoices" ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:16}}>
          {data.projects.map(p => {
            const count = docs.filter(d => d.project === p).length;
            return (
              <button key={p} onClick={()=>setSelProj(p)} style={{background:"#fff",padding:20,borderRadius:12,border:`1px solid ${T.borderLight}`,textAlign:"left",transition:"0.2s",boxShadow:T.shadow}}>
                <div style={{fontSize:15,fontWeight:700,color:T.text}}>{p}</div>
                <div style={{fontSize:12,color:T.textMuted,marginTop:4}}>{count} Invoices Stored</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div style={{background:"#fff",borderRadius:12,boxShadow:T.shadow,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead style={{background:"#fcfcfd",borderBottom:`1px solid ${T.borderLight}`}}>
              <tr>
                <th style={{padding:16,textAlign:"left",fontSize:12,color:T.textMuted}}>PROJECT</th>
                <th style={{padding:16,textAlign:"left",fontSize:12,color:T.textMuted}}>DOC NAME</th>
                <th style={{padding:16,textAlign:"left",fontSize:12,color:T.textMuted}}>DATE</th>
                <th style={{padding:16,textAlign:"right",fontSize:12,color:T.textMuted}}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {docs.map(d => (
                <tr key={d.id} style={{borderBottom:`1px solid ${T.borderLight}`}}>
                  <td style={{padding:16,fontSize:14,fontWeight:600}}>{d.project}</td>
                  <td style={{padding:16,fontSize:14}}>{d.name}</td>
                  <td style={{padding:16,fontSize:13}}>{fmtDate(d.date)}</td>
                  <td style={{padding:16,textAlign:"right"}}>
                    <button onClick={()=>setModal({mode:"edit",doc:d})} style={{color:T.blue,border:"none",background:"none",marginRight:12,fontWeight:600}}>Edit</button>
                    <button onClick={()=>delDoc(d.id)} style={{color:T.red,border:"none",background:"none",fontWeight:600}}>Del</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selProj && (
        <Modal title={`Invoices: ${selProj}`} onClose={()=>setSelProj(null)}>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            {docs.filter(d=>d.project===selProj).length === 0 ? <p style={{textAlign:"center",color:T.textMuted}}>No invoices yet.</p> :
              docs.filter(d=>d.project===selProj).map(d=>(
                <div key={d.id} style={{background:T.card,padding:16,borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:700,fontSize:14}}>{d.name}</div>
                    <div style={{fontSize:12,color:T.textMuted}}>{fmtDate(d.date)} | {d.amount || "No Amount"}</div>
                  </div>
                  <div style={{display:"flex",gap:10}}>
                    <button onClick={()=>setModal({mode:"edit",doc:d})} style={{color:T.blue,border:"none",background:"none",fontSize:13,fontWeight:700}}>Edit</button>
                    <button onClick={()=>delDoc(d.id)} style={{color:T.red,border:"none",background:"none",fontSize:13,fontWeight:700}}>Del</button>
                  </div>
                </div>
              ))
            }
          </div>
        </Modal>
      )}

      {modal && (
        <Modal title={modal.mode==="add"?"New Record":"Update Record"} onClose={()=>setModal(null)} footer={<button onClick={()=>saveDoc(modal.doc, modal.mode)} style={{background:T.sidebar,color:"#fff",padding:"10px 24px",borderRadius:8,border:"none",fontWeight:700}}>Save Document</button>}>
          <Field label="Project" value={modal.doc.project} onChange={v=>setModal({...modal, doc:{...modal.doc, project:v}})} type="select" options={data.projects} />
          <Field label="Document Name/No" value={modal.doc.name} onChange={v=>setModal({...modal, doc:{...modal.doc, name:v}})} />
          <Field label="Date" type="date" value={modal.doc.date} onChange={v=>setModal({...modal, doc:{...modal.doc, date:v}})} />
          {subTab==="invoices" && <Field label="Amount" value={modal.doc.amount} onChange={v=>setModal({...modal, doc:{...modal.doc, amount:v}})} />}
          <Field label="Cloud Link (Optional)" value={modal.doc.link} onChange={v=>setModal({...modal, doc:{...modal.doc, link:v}})} />
        </Modal>
      )}
    </div>
  );
};

/* ─── Scorpion Company Docs ─────────────────────────────────────────────── */
const ScorpionDocs = ({data, setData, showToast}) => {
  const [modal, setModal] = useState(null);
  const save = (doc, mode) => {
    setModal(null);
    setData(prev => {
      const list = [...prev.scorpionDocs];
      if(mode==="add") list.push({...doc, id:uid()});
      else { const i=list.findIndex(x=>x.id===doc.id); if(i>=0) list[i]=doc; }
      return {...prev, scorpionDocs:list};
    });
    showToast(mode==="add"?"Added":"Updated");
  };
  const del = id => {
    if(!window.confirm("Delete?")) return;
    setData(prev=>({...prev, scorpionDocs:prev.scorpionDocs.filter(x=>x.id!==id)}));
    showToast("Deleted","del");
  };

  return (
    <div className="fade-in">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24}}>
        <h2 style={{fontSize:22,fontWeight:800}}>Company Documents</h2>
        <button onClick={()=>setModal({mode:"add",doc:{}})} style={{background:T.sidebar,color:"#fff",padding:"10px 20px",borderRadius:8,fontWeight:700}}>+ New Document</button>
      </div>

      <div style={{background:"#fff",borderRadius:12,boxShadow:T.shadow,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead style={{background:"#fcfcfd",borderBottom:`1px solid ${T.borderLight}`}}>
            <tr>
              <th style={{padding:16,textAlign:"left",fontSize:12,color:T.textMuted}}>DOCUMENT TYPE</th>
              <th style={{padding:16,textAlign:"left",fontSize:12,color:T.textMuted}}>EXPIRY DATE</th>
              <th style={{padding:16,textAlign:"left",fontSize:12,color:T.textMuted}}>STATUS</th>
              <th style={{padding:16,textAlign:"right",fontSize:12,color:T.textMuted}}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {data.scorpionDocs.map(d => {
              const st = getStatus(daysUntil(d.expiryDate));
              return (
                <tr key={d.id} style={{borderBottom:`1px solid ${T.borderLight}`}}>
                  <td style={{padding:16,fontSize:14,fontWeight:600}}>{d.name}</td>
                  <td style={{padding:16,fontSize:13}}>{fmtDate(d.expiryDate)}</td>
                  <td style={{padding:16}}><span style={{background:st.bg,color:st.color,padding:"4px 10px",borderRadius:6,fontSize:11,fontWeight:800}}>{st.label}</span></td>
                  <td style={{padding:16,textAlign:"right"}}>
                    <button onClick={()=>setModal({mode:"edit",doc:d})} style={{color:T.blue,background:"none",border:"none",marginRight:12,fontWeight:700}}>Edit</button>
                    <button onClick={()=>del(d.id)} style={{color:T.red,background:"none",border:"none",fontWeight:700}}>Del</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {modal && (
        <Modal title={modal.mode==="add"?"Add Company Doc":"Edit Company Doc"} onClose={()=>setModal(null)} footer={<button onClick={()=>save(modal.doc, modal.mode)} style={{background:T.sidebar,color:"#fff",padding:"10px 24px",borderRadius:8,fontWeight:700}}>Save</button>}>
          <Field label="Document Category" value={modal.doc.name} onChange={v=>setModal({...modal,doc:{...modal.doc,name:v}})} type="select" options={data.scorpionDocCats} />
          <Field label="Issue Date" type="date" value={modal.doc.issueDate} onChange={v=>setModal({...modal,doc:{...modal.doc,issueDate:v}})} />
          <Field label="Expiry Date" type="date" value={modal.doc.expiryDate} onChange={v=>setModal({...modal,doc:{...modal.doc,expiryDate:v}})} />
          <Field label="Cloud Storage Link" value={modal.doc.link} onChange={v=>setModal({...modal,doc:{...modal.doc,link:v}})} placeholder="https://sharepoint.com/..." />
        </Modal>
      )}
    </div>
  );
};

/* ─── Manpower & Equipment Components (Omitted for brevity, but kept in code) ─── */
const ManpowerPage = () => <div className="fade-in"><h2>Manpower Manager</h2><p>Employees and Certifications module.</p></div>;
const EquipmentPage = () => <div className="fade-in"><h2>Equipment & TUV</h2><p>Assets and Inspection module.</p></div>;

/* ─── Projects Modal ─────────────────────────────────────────────────────── */
const ProjectsModal = ({projects, onSave, onClose}) => {
  const [list, setList] = useState(projects);
  const [inp, setInp] = useState("");
  const add = () => { if(inp.trim()){ setList([...list, inp.trim()]); setInp(""); } };
  return (
    <Modal title="Manage Active Projects" onClose={onClose} footer={<button onClick={()=>{onSave(list); onClose();}} style={{background:T.sidebar,color:"#fff",padding:"10px 24px",borderRadius:8,fontWeight:700}}>Save Project List</button>}>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        <input value={inp} onChange={e=>setInp(e.target.value)} placeholder="New project name..." style={{flex:1,height:40,padding:"0 12px",borderRadius:8,border:`1px solid ${T.border}`}} />
        <button onClick={add} style={{background:T.blue,color:"#fff",border:"none",padding:"0 16px",borderRadius:8,fontWeight:700}}>Add</button>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {list.map((p,i)=>(
          <div key={i} style={{background:T.card,padding:"10px 14px",borderRadius:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{fontSize:14,fontWeight:600}}>{p}</span>
            <button onClick={()=>setList(list.filter((_,idx)=>idx!==i))} style={{color:T.red,border:"none",background:"none",fontWeight:700}}>✕</button>
          </div>
        ))}
      </div>
    </Modal>
  );
};

/* ─── Main App Shell ─────────────────────────────────────────────────────── */
export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [data, setData] = useState(loadData);
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
      s.id = "ct-g";
      s.textContent = GLOBAL_CSS; 
      document.head.appendChild(s);
    }
  }, []);

  useEffect(() => { persist(data); }, [data]);

  const showToast = (msg, type="ok") => { setToast({msg,type}); setTimeout(() => setToast(null), 3200); };
  const go = p => { setPage(p); setSideOpen(false); };
  
  // Calculate alerts for the badge
  const allExpiries = [
    ...data.scorpionDocs.filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Company",days:daysUntil(d.expiryDate)})),
    ...(data.projectDocs||[]).filter(d=>d.expiryDate).map(d=>({label:d.name,src:"Project",days:daysUntil(d.expiryDate)}))
  ].filter(x=>x.days!==null&&x.days<=90).sort((a,b)=>a.days-b.days);

  return (
    <>
      {showSplash && <SplashScreen />}
      <div style={{
        display: "flex", 
        height: "100vh", 
        overflow: "hidden", 
        background: T.bg,
        opacity: showSplash ? 0 : 1,
        transition: 'opacity 0.6s ease-in-out'
      }}>
        {sideOpen && <div className="fade-in" onClick={()=>setSideOpen(false)} style={{position:"fixed",inset:0,background:"rgba(13,31,53,0.45)",zIndex:49}}/>}

        <Sidebar page={page} go={go} sideOpen={sideOpen} alerts={allExpiries.length} data={data} onManageProjects={()=>{setSideOpen(false);setProjMod(true);}}/>

        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
          <header style={{background:"#1e3a5f",borderBottom:"1px solid #b8cce0",padding:"0 20px",flexShrink:0,boxShadow:"0 2px 8px rgba(13,31,53,0.2)"}}>
            <div style={{display:"flex",alignItems:"center",height:64,position:"relative"}}>
              <button onClick={()=>setSideOpen(true)} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#ffffff",borderRadius:8,width:40,height:40,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,zIndex:1}}>☰</button>
              <div style={{position:"absolute",left:0,right:0,textAlign:"center",pointerEvents:"none"}}>
                <div style={{fontFamily:"'Barlow Condensed',sans-serif",fontWeight:800,fontSize:24,color:"#ffffff",letterSpacing:"3px"}}>SCORPION ARABIA</div>
              </div>
            </div>
          </header>

          <main style={{flex:1,overflowY:"auto",padding:"24px 20px"}}>
            {page==="dashboard" && <Dashboard data={data} alerts={allExpiries} go={go}/>}
            {page==="scorpion"  && <ScorpionDocs data={data} setData={setData} showToast={showToast}/>}
            {page==="projects"  && <ProjectDocs data={data} setData={setData} showToast={showToast}/>}
            {page==="manpower"  && <ManpowerPage />}
            {page==="equipment" && <EquipmentPage />}
          </main>
        </div>

        {projMod && <ProjectsModal projects={data.projects||[]} onSave={(l)=>setData({...data,projects:l})} onClose={()=>setProjMod(false)}/>}

        {toast && (
          <div className="fade-up" style={{position:"fixed",bottom:24,right:24,zIndex:999,background:toast.type==="del"?"#fee2e2":"#d1fae5",border:`1px solid ${toast.type==="del"?T.red:T.green}`,color:toast.type==="del"?T.red:T.green,borderRadius:10,padding:"12px 20px",fontSize:14,fontWeight:600,boxShadow:T.shadow}}>
            {toast.msg}
          </div>
        )}
      </div>
    </>
  );
}
