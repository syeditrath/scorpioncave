import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { createClient } from "@supabase/supabase-js";

/* ──────────────────────────────────────────────────────────────────────────
   SUPABASE
────────────────────────────────────────────────────────────────────────── */
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "";

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

async function uploadPdfToSupabase(file, folder = "scorpion-docs") {
  if (!supabase) {
    throw new Error("Supabase environment variables are missing.");
  }

  if (!file) return "";

  const cleanName = file.name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "");

  const filePath = `${folder}/${Date.now()}-${cleanName}`;

  const { error: uploadError } = await supabase.storage
    .from("documents")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("documents").getPublicUrl(filePath);
  return data.publicUrl;
}

/* ──────────────────────────────────────────────────────────────────────────
   GLOBAL CSS
────────────────────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { font-family: 'Barlow', sans-serif; background: #f0e6d3; color: #1a0a00; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: #f0e6d3; }
  ::-webkit-scrollbar-thumb { background: #e8d5b7; border-radius: 3px; }
  input, select, textarea, button { font-family: 'Barlow', sans-serif; }
  button { cursor: pointer; }
  /* Responsive font scaling */
  html { font-size: 16px; }
  @media (min-width: 1400px) { html { font-size: 17px; } }
  @media (min-width: 1800px) { html { font-size: 19px; } }
  @media (max-width: 768px)  { html { font-size: 14px; } }

  /* Responsive layout helpers */
  .resp-grid-2 { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr)); gap:clamp(10px,1.5vw,20px); }
  .resp-grid-3 { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr)); gap:clamp(10px,1.5vw,18px); }
  .resp-grid-4 { display:grid; grid-template-columns:repeat(auto-fill,minmax(min(100%,200px),1fr)); gap:clamp(8px,1.2vw,16px); }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);} }
  @keyframes slideUp { from{opacity:0;transform:translateY(30px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeIn  { from{opacity:0;}to{opacity:1;} }
  @keyframes slideIn { from{opacity:0;transform:translateX(30px);}to{opacity:1;transform:translateX(0);} }
  .fade-up  { animation: fadeUp  0.3s ease both; }
  .slide-up { animation: slideUp 0.35s cubic-bezier(0.34,1.3,0.64,1) both; }
  .fade-in  { animation: fadeIn  0.2s ease both; }
  /* Card distinct from background */
  .app-card {
    background: #fdf8f0;
    border: 1px solid #e8d5b7;
    border-radius: 14px;
    box-shadow: 0 2px 8px rgba(26,10,0,0.06), 0 0 0 1px rgba(232,213,183,0.4);
  }
  .slide-in { animation: slideIn 0.3s ease both; }
  @keyframes spinSlow   { from{transform:rotate(0deg);}to{transform:rotate(360deg);} }
  @keyframes pulse      { 0%,100%{transform:scale(1);}50%{transform:scale(1.06);} }
  @keyframes glowRing   { 0%,100%{box-shadow:0 0 0 0 rgba(251,191,36,0);}50%{box-shadow:0 0 0 18px rgba(251,191,36,0.18);} }
  @keyframes textReveal { from{opacity:0;letter-spacing:12px;}to{opacity:1;letter-spacing:4px;} }
  @keyframes subReveal  { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
  @keyframes fadeOut    { from{opacity:1;}to{opacity:0;} }
  .spin-slow  { animation: spinSlow 8s linear infinite; }
  .pulse-logo { animation: pulse 3s ease-in-out infinite; }
  .glow-ring  { animation: glowRing 2.5s ease-in-out infinite; }
`;

/* ──────────────────────────────────────────────────────────────────────────
   THEME
────────────────────────────────────────────────────────────────────────── */
const LIGHT = {
  bg: "#f0e6d3",
  sidebar: "#080b10",
  card: "#fdf8f0",
  card2: "#f7f0e6",
  border: "#e8d5b7",
  borderLight: "#dcc9a0",
  text: "#1a0a00",
  textSub: "#5c3d1e",
  textMuted: "#a07850",
  inputBg: "#fffaf3",
  blue: "#38bdf8",
  green: "#34d399",
  gold: "#fbbf24",
  red: "#f87171",
  purple: "#a78bfa",
  teal: "#2dd4bf",
  orange: "#fb923c",
  blueDim: "rgba(56,189,248,0.12)",
  greenDim: "rgba(52,211,153,0.12)",
  goldDim: "rgba(251,191,36,0.12)",
  redDim: "rgba(248,113,113,0.12)",
  purpleDim: "rgba(167,139,250,0.12)",
  tealDim: "rgba(45,212,191,0.12)",
  orangeDim: "rgba(251,146,60,0.12)",
  shadow: "0 8px 24px rgba(26,10,0,0.08)",
};

const DARK = {
  bg: "#0d1117",
  sidebar: "#0a0e14",
  card: "#161b22",
  card2: "#0f141b",
  border: "#2d3742",
  borderLight: "#3c4652",
  text: "#e8edf5",
  textSub: "#b8c1cc",
  textMuted: "#8996a6",
  inputBg: "#0d1117",
  blue: "#38bdf8",
  green: "#34d399",
  gold: "#fbbf24",
  red: "#f87171",
  purple: "#a78bfa",
  teal: "#2dd4bf",
  orange: "#fb923c",
  blueDim: "rgba(56,189,248,0.12)",
  greenDim: "rgba(52,211,153,0.12)",
  goldDim: "rgba(251,191,36,0.12)",
  redDim: "rgba(248,113,113,0.12)",
  purpleDim: "rgba(167,139,250,0.12)",
  tealDim: "rgba(45,212,191,0.12)",
  orangeDim: "rgba(251,146,60,0.12)",
  shadow: "0 12px 32px rgba(0,0,0,0.35)",
};

let T = LIGHT;
function setTheme(dark) {
  T = dark ? DARK : LIGHT;
}

/* ──────────────────────────────────────────────────────────────────────────
   HELPERS
────────────────────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2, 9);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const daysUntil = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  const now = new Date();
  return Math.ceil((date - now) / 86400000);
};

function getStatus(days) {
  if (days === null) return { label: "Unknown", color: T.textMuted, bg: "rgba(125,125,125,0.12)" };
  if (days < 0) return { label: "Expired", color: T.red, bg: T.redDim };
  if (days <= 90) return { label: "Expiring Soon", color: T.gold, bg: T.goldDim };
  return { label: "Valid", color: T.green, bg: T.greenDim };
}

function exportToExcel(rows, filename) {
  if (!rows?.length) return;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/* ──────────────────────────────────────────────────────────────────────────
   DEFAULT DATA
────────────────────────────────────────────────────────────────────────── */
const DEFAULT_SCORPION_CATS = [
  "Company Registration / CR",
  "Insurance",
  "Trade License",
  "Contracts & Agreements",
  "IBAN",
  "Zakat",
  "Other",
];

const DEFAULT_MANPOWER_CATS = [
  "Drillers / Operators",
  "Safety Officers (HSE)",
  "Supervisors",
  "Laborers / General Workers",
];

const EMPTY_DATA = {
  scorpionDocs: [],
  scorpionDocCats: DEFAULT_SCORPION_CATS,
  manpowerCats: DEFAULT_MANPOWER_CATS,
  manpower: [],
  equipment: [],
  projects: ["NEOM Phase 1", "NEOM Phase 2", "Riyadh Metro"],
  projectDocs: [],
};

function loadData() {
  try {
    const raw = localStorage.getItem("cta_v1");
    return raw ? JSON.parse(raw) : EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
}

function persistData(data) {
  try {
    localStorage.setItem("cta_v1", JSON.stringify(data));
  } catch {}
}

/* ──────────────────────────────────────────────────────────────────────────
   APP
────────────────────────────────────────────────────────────────────────── */
export default function App() {
  useEffect(() => {
    if (!document.getElementById("scorpion-global-css")) {
      const s = document.createElement("style");
      s.id = "scorpion-global-css";
      s.textContent = GLOBAL_CSS;
      document.head.appendChild(s);
    }
  }, []);

  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem("cta_dark") === "true";
    } catch {
      return false;
    }
  });

  setTheme(darkMode);

  useEffect(() => {
    document.body.style.background = T.bg;
    localStorage.setItem("cta_dark", String(darkMode));
  }, [darkMode]);

  const [data, setData] = useState(loadData);
  const [page, setPage] = useState("dashboard");
  const [sideOpen, setSideOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [projectModal, setProjectModal] = useState(false);

  useEffect(() => {
    persistData(data);
  }, [data]);

  const showToast = (msg, type = "ok") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  };

  const allAlerts = useMemo(() => {
    const items = [];

    data.scorpionDocs.forEach((d) => {
      const days = daysUntil(d.expiryDate);
      if (days !== null && days <= 90) items.push({ label: d.name || "Document", src: "Company Doc", days });
    });

    data.projectDocs.forEach((d) => {
      const days = daysUntil(d.expiryDate);
      if (days !== null && days <= 90) items.push({ label: d.name || "Project Doc", src: "Project Doc", days });
    });

    data.manpower.forEach((p) => {
      [p.passportExpiry, p.visaExpiry, p.iqamaExpiry, p.muqeemExpiry].forEach((x, i) => {
        const names = ["Passport", "Visa", "Iqama", "Muqeem"];
        const days = daysUntil(x);
        if (days !== null && days <= 90) items.push({ label: p.name || "Person", src: names[i], days });
      });

      (p.certs || []).forEach((c) => {
        const days = daysUntil(c.expiryDate);
        if (days !== null && days <= 90) items.push({ label: `${p.name || "Person"} — ${c.name || "Cert"}`, src: "Cert", days });
      });
    });

    data.equipment.forEach((e) => {
      (e.certifications || []).forEach((c) => {
        const days = daysUntil(c.expiryDate);
        if (days !== null && days <= 90) items.push({ label: `${e.name || "Equipment"} — ${c.certNo || "Cert"}`, src: "Eq Cert", days });
      });
      (e.insurance || []).forEach((c) => {
        const days = daysUntil(c.expiryDate);
        if (days !== null && days <= 90) items.push({ label: `${e.name || "Equipment"} — Insurance`, src: "Insurance", days });
      });
      (e.permits || []).forEach((c) => {
        const days = daysUntil(c.expiryDate);
        if (days !== null && days <= 90) items.push({ label: `${e.name || "Equipment"} — ${c.type || "Permit"}`, src: "Permit", days });
      });
    });

    return items.sort((a, b) => a.days - b.days);
  }, [data]);

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: T.bg }}>
      {sideOpen && (
        <div
          className="fade-in"
          onClick={() => setSideOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40 }}
        />
      )}

      <Sidebar
        page={page}
        setPage={setPage}
        sideOpen={sideOpen}
        setSideOpen={setSideOpen}
        alerts={allAlerts.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onManageProjects={() => setProjectModal(true)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopBar alerts={allAlerts.length} onOpenSidebar={() => setSideOpen(true)} />

        <main style={{ flex: 1, overflowY: "auto", padding: "clamp(14px,2vw,28px)" }}>
          {page === "dashboard" && <Dashboard data={data} alerts={allAlerts} setPage={setPage} />}
          {page === "scorpion" && <ScorpionDocs data={data} setData={setData} showToast={showToast} />}
          {page === "projects" && <ProjectDocs data={data} setData={setData} showToast={showToast} />}
          {page === "manpower" && <ManpowerPage data={data} setData={setData} showToast={showToast} />}
          {page === "equipment" && <EquipmentPage data={data} setData={setData} showToast={showToast} />}
        </main>
      </div>

      {projectModal && (
        <ProjectsModal
          projects={data.projects}
          onClose={() => setProjectModal(false)}
          onSave={(projects) => {
            setData((p) => ({ ...p, projects }));
            setProjectModal(false);
            showToast("Projects updated");
          }}
        />
      )}

      {toast && (
        <div
          className="fade-up"
          style={{
            position: "fixed",
            right: 24,
            bottom: 24,
            zIndex: 99,
            background: toast.type === "del" ? "#fee2e2" : "#d1fae5",
            border: `1px solid ${toast.type === "del" ? T.red : T.green}`,
            color: toast.type === "del" ? "#b91c1c" : "#047857",
            borderRadius: 10,
            padding: "12px 16px",
            fontSize: 13,
            fontWeight: 700,
            boxShadow: T.shadow,
          }}
        >
          {toast.type === "del" ? "✕" : "✓"} {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   LAYOUT
────────────────────────────────────────────────────────────────────────── */
function TopBar({ alerts, onOpenSidebar }) {
  return (
    <header style={{ background: T.sidebar, borderBottom: `1px solid ${T.border}`, padding: "0 18px", flexShrink: 0 }}>
      <div style={{ height: 58, display: "flex", alignItems: "center", position: "relative" }}>
        <button onClick={onOpenSidebar} style={iconBtnStyle("rgba(255,255,255,0.08)", "#fff")}>
          ☰
        </button>

        <div style={{ position: "absolute", inset: 0, textAlign: "center", pointerEvents: "none" }}>
          <div
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 800,
              fontSize: 24,
              color: "#fff",
              letterSpacing: "3px",
              marginTop: 7,
            }}
          >
            SCORPION ARABIA
          </div>
          <div style={{ fontSize: 11, color: "#93c5fd", letterSpacing: "1.5px", marginTop: -2 }}>
            DOCUMENT & ASSET MANAGER
          </div>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              background: alerts ? "rgba(220,38,38,0.2)" : "rgba(255,255,255,0.08)",
              border: `1px solid ${alerts ? "rgba(220,38,38,0.45)" : "rgba(255,255,255,0.14)"}`,
              color: alerts ? "#fecaca" : "#fff",
              borderRadius: 8,
              padding: "6px 10px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            ▲ {alerts}
          </div>
        </div>
      </div>
    </header>
  );
}

function Sidebar({ page, setPage, sideOpen, setSideOpen, alerts, darkMode, setDarkMode, onManageProjects }) {
  const isMobile = window.innerWidth < 900;

  const nav = [
    { id: "dashboard", icon: "▦", label: "Dashboard", desc: "Overview" },
    { id: "scorpion", icon: "◉", label: "Scorpion Documents", desc: "Company docs" },
    { id: "projects", icon: "◆", label: "Project Docs", desc: "Invoices & certs" },
    { id: "manpower", icon: "◈", label: "Manpower", desc: "Staff & records" },
    { id: "equipment", icon: "◎", label: "Equipment", desc: "Assets & permits" },
  ];

  return (
    <aside
      style={{
        width: "clamp(220px,18vw,280px)",
        flexShrink: 0,
        background: T.sidebar,
        borderRight: `1px solid rgba(255,255,255,0.08)`,
        display: "flex",
        flexDirection: "column",
        zIndex: 50,
        position: isMobile ? "fixed" : "relative",
        top: 0,
        left: 0,
        height: "100%",
        transform: isMobile ? (sideOpen ? "translateX(0)" : "translateX(-100%)") : "none",
        transition: "transform .28s ease",
      }}
    >
      <div style={{ padding: "22px 18px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              overflow: "hidden",
              background: "#000",
              boxShadow: "0 0 0 2px rgba(251,191,36,0.5)",
            }}
          >
            <img src="logo.png" alt="Scorpion Arabia" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontWeight: 800,
                fontSize: 20,
                color: "#fff",
                letterSpacing: ".5px",
              }}
            >
              SCORPION ARABIA
            </div>
            <div style={{ color: "#93c5fd", fontSize: 11, letterSpacing: "1.5px" }}>ASSET MANAGER</div>
          </div>
        </div>
      </div>

      <nav style={{ padding: 10, flex: 1, overflowY: "auto" }}>
        {nav.map((n) => {
          const active = page === n.id;
          const badge = n.id === "dashboard" ? alerts : null;

          return (
            <button
              key={n.id}
              onClick={() => {
                setPage(n.id);
                setSideOpen(false);
              }}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "11px 12px",
                borderRadius: 8,
                border: "none",
                marginBottom: 4,
                textAlign: "left",
                background: active ? "rgba(59,130,246,0.15)" : "transparent",
                borderLeft: `2px solid ${active ? "#93c5fd" : "transparent"}`,
              }}
            >
              <span style={{ fontSize: 19, color: active ? "#93c5fd" : "#94a3b8" }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: active ? "#93c5fd" : "#e2e8f0" }}>
                  {n.label}
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{n.desc}</div>
              </div>
              {badge ? (
                <span
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    borderRadius: 999,
                    padding: "1px 7px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "8px 10px", display: "grid", gap: 8 }}>
        <button onClick={onManageProjects} style={sidebarAuxBtnStyle()}>
          ⊕ Manage Projects
        </button>

        <button onClick={() => setDarkMode((d) => !d)} style={sidebarAuxBtnStyle()}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>
      </div>

      <div style={{ padding: "12px 18px 18px", fontSize: 10, color: "rgba(255,255,255,0.2)", textAlign: "center" }}>
        Scorpion Arabia © 2025
      </div>
    </aside>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   DASHBOARD
────────────────────────────────────────────────────────────────────────── */
function Dashboard({ data, alerts, setPage }) {
  const scorpionExp = data.scorpionDocs.filter((d) => {
    const x = daysUntil(d.expiryDate);
    return x !== null && x <= 90;
  }).length;

  const projectCount = data.projectDocs.length;
  const manpowerCount = data.manpower.length;
  const equipmentCount = data.equipment.length;
  const overdueCount = alerts.filter((a) => a.days < 0).length;
  const expiring30 = alerts.filter((a) => a.days >= 0 && a.days <= 30).length;

  return (
    <div style={{ maxWidth: 1300, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(170px,1fr))",
          gap: 12,
          marginBottom: 18,
        }}
      >
        <KpiCard label="Total Alerts" value={alerts.length} color={alerts.length ? T.red : T.green} />
        <KpiCard label="Overdue" value={overdueCount} color={overdueCount ? T.red : T.textMuted} />
        <KpiCard label="Due in 30 Days" value={expiring30} color={expiring30 ? T.gold : T.textMuted} />
        <KpiCard label="Company Docs" value={data.scorpionDocs.length} color={T.blue} />
        <KpiCard label="Project Docs" value={projectCount} color={T.teal} />
        <KpiCard label="People" value={manpowerCount} color={T.green} />
        <KpiCard label="Equipment" value={equipmentCount} color={T.gold} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
          gap: 14,
          marginBottom: 18,
        }}
      >
        <QuickCard title="Scorpion Documents" sub="CR, insurance, licenses, contracts" stat={`${data.scorpionDocs.length} total / ${scorpionExp} expiring`} color={T.blue} onClick={() => setPage("scorpion")} />
        <QuickCard title="Project Docs" sub="Invoices, certificates, work orders" stat={`${projectCount} records`} color={T.teal} onClick={() => setPage("projects")} />
        <QuickCard title="Manpower" sub="Staff documents and certifications" stat={`${manpowerCount} people`} color={T.green} onClick={() => setPage("manpower")} />
        <QuickCard title="Equipment" sub="Assets, certs, insurance, permits" stat={`${equipmentCount} assets`} color={T.gold} onClick={() => setPage("equipment")} />
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, boxShadow: T.shadow, padding: 18 }}>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: T.text,
            marginBottom: 12,
          }}
        >
          ALERTS
        </div>

        {alerts.length === 0 ? (
          <div style={{ color: T.green, fontWeight: 700 }}>✓ No expiring items</div>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            {alerts.slice(0, 10).map((a, i) => (
              <AlertRow key={i} a={a} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SCORPION DOCS
────────────────────────────────────────────────────────────────────────── */
function ScorpionDocs({ data, setData, showToast }) {
  const [modal, setModal] = useState(null);
  const [catModal, setCatModal] = useState(false);
  const [selCat, setSelCat] = useState("All");

  const docs = data.scorpionDocs || [];
  const cats = data.scorpionDocCats || DEFAULT_SCORPION_CATS;
  const visible = selCat === "All" ? docs : docs.filter((d) => d.category === selCat);

  const saveDoc = (doc, mode) => {
    setModal(null);
    setData((prev) => {
      const list = [...prev.scorpionDocs];
      if (mode === "add") {
        list.push({ ...doc, id: uid() });
      } else {
        const idx = list.findIndex((x) => x.id === doc.id);
        if (idx >= 0) list[idx] = doc;
      }
      return { ...prev, scorpionDocs: list };
    });
    showToast(mode === "add" ? "Document added" : "Document updated");
  };

  const delDoc = (id) => {
    setData((prev) => ({
      ...prev,
      scorpionDocs: prev.scorpionDocs.filter((d) => d.id !== id),
    }));
    showToast("Document deleted", "del");
  };

  const saveCats = (catsNew) => {
    setData((prev) => ({ ...prev, scorpionDocCats: catsNew }));
    setCatModal(false);
    showToast("Categories updated");
  };

  return (
    <PageWrap>
      <PageHeader title="SCORPION DOCUMENTS" sub="Company licenses, insurance, contracts & registrations">
        <Btn color={T.blue} onClick={() => setCatModal(true)}>⊕ Categories</Btn>
        <Btn color={T.blue} onClick={() => exportToExcel(docs, "Scorpion_Documents")}>⬇ Export Excel</Btn>
        <Btn color={T.blue} solid onClick={() => setModal({ mode: "add" })}>+ Add Document</Btn>
      </PageHeader>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {["All", ...cats].map((c) => (
          <button
            key={c}
            onClick={() => setSelCat(c)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid ${selCat === c ? T.blue : T.border}`,
              background: selCat === c ? T.blueDim : "transparent",
              color: selCat === c ? T.blue : T.textSub,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty icon="◉" label="No company documents yet" sub="Add your first document" color={T.blue} onAdd={() => setModal({ mode: "add" })} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((doc, i) => {
            const s = getStatus(daysUntil(doc.expiryDate));
            return (
              <CardRow key={doc.id} delay={i * 0.03} borderLeft={doc.expiryDate ? s.color : T.blue}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <Title>{doc.name || "Document"}</Title>
                    {doc.category && <Tag color={T.blue}>{doc.category}</Tag>}
                    {doc.expiryDate && <Tag color={s.color}>{s.label}</Tag>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {doc.issueDate && <Chip>Issue: {fmtDate(doc.issueDate)}</Chip>}
                    {doc.expiryDate && <Chip color={s.color}>Expiry: {fmtDate(doc.expiryDate)}</Chip>}
                    {doc.fileLink && <FileLink href={doc.fileLink} />}
                  </div>
                  {doc.notes && <div style={{ marginTop: 6, color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>{doc.notes}</div>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <ABtn color={T.blue} onClick={() => setModal({ mode: "edit", doc })}>✎</ABtn>
                  <ABtn color={T.red} onClick={() => delDoc(doc.id)}>✕</ABtn>
                </div>
              </CardRow>
            );
          })}
        </div>
      )}

      {modal && (
        <DocModal
          mode={modal.mode}
          doc={modal.doc}
          cats={cats}
          onClose={() => setModal(null)}
          onSave={saveDoc}
        />
      )}

      {catModal && (
        <CatManagerModal
          title="Document Categories"
          cats={cats}
          onClose={() => setCatModal(false)}
          onSave={saveCats}
        />
      )}
    </PageWrap>
  );
}

function DocModal({ mode, doc, cats, onClose, onSave }) {
  const [f, setF] = useState(doc || {});
  const [uploading, setUploading] = useState(false);

  const handleSave = async () => {
    try {
      setUploading(true);

      const finalData = {
        ...f,
        name: f.name || f.fileUpload?.name || "Document",
      };

      if (f.fileUpload) {
        const uploadedUrl = await uploadPdfToSupabase(f.fileUpload, "scorpion-docs");
        finalData.fileLink = uploadedUrl;
      }

      delete finalData.fileUpload;
      onSave(finalData, mode);
    } catch (err) {
      console.error("Upload error:", err);
      alert(`PDF upload failed: ${err?.message || "Unknown error"}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <FormModal
      title={`${mode === "add" ? "ADD" : "EDIT"} DOCUMENT`}
      color={T.blue}
      onClose={onClose}
      onSave={handleSave}
    >
      <FieldRow label="Category">
        <FSelect value={f.category || ""} onChange={(v) => setF((p) => ({ ...p, category: v }))}>
          <option value="">Select…</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FSelect>
      </FieldRow>

      <FieldRow label="File Link (optional manual URL)">
        <FInput value={f.fileLink || ""} onChange={(v) => setF((p) => ({ ...p, fileLink: v }))} />
      </FieldRow>

      <FieldRow label="Upload PDF">
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setF((p) => ({
              ...p,
              fileUpload: e.target.files?.[0] || null,
            }))
          }
          style={fieldStyle()}
        />
      </FieldRow>

      <FieldRow label="Notes">
        <FTextarea value={f.notes || ""} onChange={(v) => setF((p) => ({ ...p, notes: v }))} />
      </FieldRow>

      {uploading && (
        <div style={{ color: T.blue, fontSize: 12, fontWeight: 700, marginTop: 6 }}>
          Uploading PDF...
        </div>
      )}
    </FormModal>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PROJECT DOCS
────────────────────────────────────────────────────────────────────────── */
const PROJECT_TABS = [
  { id: "invoices", label: "Invoices", icon: "🧾", color: "#34d399" },
  { id: "certificates", label: "Job Completion Certificates", icon: "📜", color: "#38bdf8" },
  { id: "workorders", label: "Work Orders / Agreements", icon: "📋", color: "#a78bfa" },
];

function ProjectDocs({ data, setData, showToast }) {
  const [subTab, setSubTab] = useState("invoices");
  const [modal, setModal] = useState(null);
  const [filterProject, setFilterProject] = useState("");

  const docs = data.projectDocs || [];
  const projects = data.projects || [];
  const visible = docs.filter((d) => d.subTab === subTab && (!filterProject || d.project === filterProject));
  const curTab = PROJECT_TABS.find((t) => t.id === subTab);

  const saveDoc = (doc, mode) => {
    setModal(null);
    setData((prev) => {
      const list = [...prev.projectDocs];
      if (mode === "add") list.push({ ...doc, id: uid(), subTab });
      else {
        const idx = list.findIndex((x) => x.id === doc.id);
        if (idx >= 0) list[idx] = { ...doc, subTab };
      }
      return { ...prev, projectDocs: list };
    });
    showToast(mode === "add" ? "Document added" : "Document updated");
  };

  const delDoc = (id) => {
    setData((prev) => ({ ...prev, projectDocs: prev.projectDocs.filter((d) => d.id !== id) }));
    showToast("Document deleted", "del");
  };

  return (
    <PageWrap>
      <PageHeader title="PROJECT DOCUMENTS" sub="Invoices, completion certificates and work orders">
        <Btn color={curTab.color} onClick={() => exportToExcel(visible, "Project_Documents")}>⬇ Export Excel</Btn>
        <Btn color={curTab.color} solid onClick={() => setModal({ mode: "add" })}>
          + Add {curTab.label.replace(/s$/, "")}
        </Btn>
      </PageHeader>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        {PROJECT_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            style={{
              padding: "9px 14px",
              borderRadius: 10,
              border: `1px solid ${subTab === t.id ? t.color : T.border}`,
              background: subTab === t.id ? `${t.color}22` : "transparent",
              color: subTab === t.id ? t.color : T.textSub,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
        <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} style={fieldStyle()}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <Empty
          icon={curTab.icon}
          label={`No ${curTab.label.toLowerCase()} yet`}
          sub={`Add your first ${curTab.label.replace(/s$/, "").toLowerCase()}`}
          color={curTab.color}
          onAdd={() => setModal({ mode: "add" })}
        />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((doc, i) => {
            const s = getStatus(daysUntil(doc.expiryDate));
            return (
              <CardRow key={doc.id} delay={i * 0.03} borderLeft={curTab.color}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <Title>{doc.name || "Project Document"}</Title>
                    {doc.project && <Tag color={T.teal}>{doc.project}</Tag>}
                    {doc.expiryDate && <Tag color={s.color}>{s.label}</Tag>}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {doc.refNo && <Chip>Ref: {doc.refNo}</Chip>}
                    {doc.date && <Chip>Date: {fmtDate(doc.date)}</Chip>}
                    {doc.expiryDate && <Chip color={s.color}>Expiry: {fmtDate(doc.expiryDate)}</Chip>}
                    {doc.amount && <Chip color={T.green}>SAR {Number(doc.amount).toLocaleString()}</Chip>}
                    {doc.fileLink && <FileLink href={doc.fileLink} />}
                  </div>
                  {doc.notes && <div style={{ marginTop: 6, color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>{doc.notes}</div>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <ABtn color={T.blue} onClick={() => setModal({ mode: "edit", doc })}>✎</ABtn>
                  <ABtn color={T.red} onClick={() => delDoc(doc.id)}>✕</ABtn>
                </div>
              </CardRow>
            );
          })}
        </div>
      )}

      {modal && (
        <ProjectDocModal
          mode={modal.mode}
          doc={modal.doc}
          projects={projects}
          subTab={subTab}
          onClose={() => setModal(null)}
          onSave={saveDoc}
        />
      )}
    </PageWrap>
  );
}

function ProjectDocModal({ mode, doc, projects, subTab, onClose, onSave }) {
  const [f, setF] = useState(doc || {});
  const color = subTab === "invoices" ? T.green : subTab === "certificates" ? T.blue : T.purple;

  return (
    <FormModal
      title={`${mode === "add" ? "ADD" : "EDIT"} ${subTab === "invoices" ? "INVOICE" : subTab === "certificates" ? "CERTIFICATE" : "WORK ORDER"}`}
      color={color}
      onClose={onClose}
      onSave={() => onSave(f, mode)}
    >
      <FieldRow label="Title / Name">
        <FInput value={f.name || ""} onChange={(v) => setF((p) => ({ ...p, name: v }))} />
      </FieldRow>

      <FieldRow label="Project">
        <FSelect value={f.project || ""} onChange={(v) => setF((p) => ({ ...p, project: v }))}>
          <option value="">Select…</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </FSelect>
      </FieldRow>

      <FieldRow label={subTab === "invoices" ? "Invoice / Ref No." : "Reference No."}>
        <FInput value={f.refNo || ""} onChange={(v) => setF((p) => ({ ...p, refNo: v }))} />
      </FieldRow>

      <FieldRow label="Date">
        <FInput type="date" value={f.date || ""} onChange={(v) => setF((p) => ({ ...p, date: v }))} />
      </FieldRow>

      <FieldRow label="Expiry Date">
        <FInput type="date" value={f.expiryDate || ""} onChange={(v) => setF((p) => ({ ...p, expiryDate: v }))} />
      </FieldRow>

      <FieldRow label="Amount">
        <FInput type="number" value={f.amount || ""} onChange={(v) => setF((p) => ({ ...p, amount: v }))} />
      </FieldRow>

      <FieldRow label="File Link">
        <FInput value={f.fileLink || ""} onChange={(v) => setF((p) => ({ ...p, fileLink: v }))} />
      </FieldRow>

      <FieldRow label="Notes">
        <FTextarea value={f.notes || ""} onChange={(v) => setF((p) => ({ ...p, notes: v }))} />
      </FieldRow>
    </FormModal>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   MANPOWER
────────────────────────────────────────────────────────────────────────── */
function ManpowerPage({ data, setData, showToast }) {
  const [modal, setModal] = useState(null);
  const [selCat, setSelCat] = useState("All");

  const cats = data.manpowerCats || DEFAULT_MANPOWER_CATS;
  const people = data.manpower || [];
  const visible = selCat === "All" ? people : people.filter((p) => p.category === selCat);

  const savePerson = (person, mode) => {
    setModal(null);
    setData((prev) => {
      const list = [...prev.manpower];
      if (mode === "add") list.push({ ...person, id: uid(), certs: person.certs || [], docs: person.docs || [] });
      else {
        const idx = list.findIndex((x) => x.id === person.id);
        if (idx >= 0) list[idx] = person;
      }
      return { ...prev, manpower: list };
    });
    showToast(mode === "add" ? "Person added" : "Person updated");
  };

  const delPerson = (id) => {
    setData((prev) => ({ ...prev, manpower: prev.manpower.filter((p) => p.id !== id) }));
    showToast("Person deleted", "del");
  };

  return (
    <PageWrap>
      <PageHeader title="MANPOWER" sub="Staff records, IDs and certifications">
        <Btn color={T.green} onClick={() => exportToExcel(people, "Manpower")}>⬇ Export Excel</Btn>
        <Btn color={T.green} solid onClick={() => setModal({ mode: "add" })}>+ Add Person</Btn>
      </PageHeader>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {["All", ...cats].map((c) => (
          <button
            key={c}
            onClick={() => setSelCat(c)}
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              border: `1px solid ${selCat === c ? T.green : T.border}`,
              background: selCat === c ? T.greenDim : "transparent",
              color: selCat === c ? T.green : T.textSub,
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty icon="◈" label="No manpower records yet" sub="Add your first employee" color={T.green} onAdd={() => setModal({ mode: "add" })} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((p, i) => {
            const expiryList = [p.passportExpiry, p.visaExpiry, p.iqamaExpiry, p.muqeemExpiry].filter(Boolean);
            const alerts = expiryList.filter((d) => {
              const x = daysUntil(d);
              return x !== null && x <= 90;
            }).length;

            return (
              <CardRow key={p.id} delay={i * 0.03} borderLeft={alerts ? T.gold : T.green}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <Title>{p.name || "Person"}</Title>
                    {p.category && <Tag color={T.green}>{p.category}</Tag>}
                    {p.designation && <Tag color={T.teal}>{p.designation}</Tag>}
                    {alerts ? <Tag color={T.gold}>{alerts} expiring</Tag> : null}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {p.idNo && <Chip>ID: {p.idNo}</Chip>}
                    {p.nationality && <Chip>{p.nationality}</Chip>}
                    {p.passportExpiry && <Chip>Passport: {fmtDate(p.passportExpiry)}</Chip>}
                    {p.iqamaExpiry && <Chip>Iqama: {fmtDate(p.iqamaExpiry)}</Chip>}
                    {p.visaExpiry && <Chip>Visa: {fmtDate(p.visaExpiry)}</Chip>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <ABtn color={T.blue} onClick={() => setModal({ mode: "edit", person: p })}>✎</ABtn>
                  <ABtn color={T.red} onClick={() => delPerson(p.id)}>✕</ABtn>
                </div>
              </CardRow>
            );
          })}
        </div>
      )}

      {modal && (
        <ManpowerModal
          mode={modal.mode}
          person={modal.person}
          cats={cats}
          onClose={() => setModal(null)}
          onSave={savePerson}
        />
      )}
    </PageWrap>
  );
}

function ManpowerModal({ mode, person, cats, onClose, onSave }) {
  const [f, setF] = useState(person || {});

  return (
    <FormModal
      title={`${mode === "add" ? "ADD" : "EDIT"} PERSON`}
      color={T.green}
      onClose={onClose}
      onSave={() => onSave(f, mode)}
    >
      <FieldRow label="Name">
        <FInput value={f.name || ""} onChange={(v) => setF((p) => ({ ...p, name: v }))} />
      </FieldRow>
      <FieldRow label="Category">
        <FSelect value={f.category || ""} onChange={(v) => setF((p) => ({ ...p, category: v }))}>
          <option value="">Select…</option>
          {cats.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </FSelect>
      </FieldRow>
      <FieldRow label="Employee ID">
        <FInput value={f.idNo || ""} onChange={(v) => setF((p) => ({ ...p, idNo: v }))} />
      </FieldRow>
      <FieldRow label="Designation">
        <FInput value={f.designation || ""} onChange={(v) => setF((p) => ({ ...p, designation: v }))} />
      </FieldRow>
      <FieldRow label="Nationality">
        <FInput value={f.nationality || ""} onChange={(v) => setF((p) => ({ ...p, nationality: v }))} />
      </FieldRow>
      <FieldRow label="Passport Expiry">
        <FInput type="date" value={f.passportExpiry || ""} onChange={(v) => setF((p) => ({ ...p, passportExpiry: v }))} />
      </FieldRow>
      <FieldRow label="Visa Expiry">
        <FInput type="date" value={f.visaExpiry || ""} onChange={(v) => setF((p) => ({ ...p, visaExpiry: v }))} />
      </FieldRow>
      <FieldRow label="Iqama Expiry">
        <FInput type="date" value={f.iqamaExpiry || ""} onChange={(v) => setF((p) => ({ ...p, iqamaExpiry: v }))} />
      </FieldRow>
      <FieldRow label="Muqeem Expiry">
        <FInput type="date" value={f.muqeemExpiry || ""} onChange={(v) => setF((p) => ({ ...p, muqeemExpiry: v }))} />
      </FieldRow>
    </FormModal>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   EQUIPMENT
────────────────────────────────────────────────────────────────────────── */
function EquipmentPage({ data, setData, showToast }) {
  const [modal, setModal] = useState(null);
  const [filter, setFilter] = useState("");

  const visible = (data.equipment || []).filter((e) =>
    !filter ? true : `${e.name} ${e.model} ${e.serialNo} ${e.project}`.toLowerCase().includes(filter.toLowerCase())
  );

  const saveEq = (eq, mode) => {
    setModal(null);
    setData((prev) => {
      const list = [...prev.equipment];
      if (mode === "add") {
        list.push({
          ...eq,
          id: uid(),
          certifications: eq.certifications || [],
          invoices: eq.invoices || [],
          insurance: eq.insurance || [],
          permits: eq.permits || [],
        });
      } else {
        const idx = list.findIndex((x) => x.id === eq.id);
        if (idx >= 0) list[idx] = eq;
      }
      return { ...prev, equipment: list };
    });
    showToast(mode === "add" ? "Equipment added" : "Equipment updated");
  };

  const delEq = (id) => {
    setData((prev) => ({ ...prev, equipment: prev.equipment.filter((e) => e.id !== id) }));
    showToast("Equipment deleted", "del");
  };

  return (
    <PageWrap>
      <PageHeader title="EQUIPMENT" sub="Assets, certifications, insurance and permits">
        <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search equipment…" style={{ ...fieldStyle(), width: 220 }} />
        <Btn color={T.gold} onClick={() => exportToExcel(data.equipment, "Equipment")}>⬇ Export Excel</Btn>
        <Btn color={T.gold} solid onClick={() => setModal({ mode: "add" })}>+ Add Equipment</Btn>
      </PageHeader>

      {visible.length === 0 ? (
        <Empty icon="◎" label="No equipment found" sub="Add your first asset" color={T.gold} onAdd={() => setModal({ mode: "add" })} />
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {visible.map((eq, i) => {
            const alertDates = [
              ...(eq.certifications || []).map((x) => x.expiryDate),
              ...(eq.insurance || []).map((x) => x.expiryDate),
              ...(eq.permits || []).map((x) => x.expiryDate),
            ].filter(Boolean);

            const alerts = alertDates.filter((d) => {
              const x = daysUntil(d);
              return x !== null && x <= 90;
            }).length;

            const statusColor =
              eq.status === "Active"
                ? T.green
                : eq.status === "Under Maintenance"
                ? T.gold
                : eq.status === "Inactive"
                ? T.red
                : T.textMuted;

            return (
              <CardRow key={eq.id} delay={i * 0.03} borderLeft={statusColor}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 6 }}>
                    <Title>{eq.name || "Equipment"}</Title>
                    {eq.status && <Tag color={statusColor}>{eq.status}</Tag>}
                    {alerts ? <Tag color={T.gold}>{alerts} expiring</Tag> : null}
                  </div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {eq.model && <Chip>{eq.model}</Chip>}
                    {eq.serialNo && <Chip>S/N: {eq.serialNo}</Chip>}
                    {eq.project && <Chip>{eq.project}</Chip>}
                    {eq.operator && <Chip>Op: {eq.operator}</Chip>}
                  </div>
                  {eq.notes && <div style={{ marginTop: 6, color: T.textMuted, fontSize: 12, fontStyle: "italic" }}>{eq.notes}</div>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <ABtn color={T.blue} onClick={() => setModal({ mode: "edit", eq })}>✎</ABtn>
                  <ABtn color={T.red} onClick={() => delEq(eq.id)}>✕</ABtn>
                </div>
              </CardRow>
            );
          })}
        </div>
      )}

      {modal && (
        <EquipmentModal
          mode={modal.mode}
          eq={modal.eq}
          projects={data.projects}
          onClose={() => setModal(null)}
          onSave={saveEq}
        />
      )}
    </PageWrap>
  );
}

function EquipmentModal({ mode, eq, projects, onClose, onSave }) {
  const [f, setF] = useState(eq || {});

  return (
    <FormModal
      title={`${mode === "add" ? "ADD" : "EDIT"} EQUIPMENT`}
      color={T.gold}
      onClose={onClose}
      onSave={() => onSave(f, mode)}
    >
      <FieldRow label="Equipment Name">
        <FInput value={f.name || ""} onChange={(v) => setF((p) => ({ ...p, name: v }))} />
      </FieldRow>
      <FieldRow label="Model">
        <FInput value={f.model || ""} onChange={(v) => setF((p) => ({ ...p, model: v }))} />
      </FieldRow>
      <FieldRow label="Serial No.">
        <FInput value={f.serialNo || ""} onChange={(v) => setF((p) => ({ ...p, serialNo: v }))} />
      </FieldRow>
      <FieldRow label="Status">
        <FSelect value={f.status || ""} onChange={(v) => setF((p) => ({ ...p, status: v }))}>
          <option value="">Select…</option>
          <option value="Active">Active</option>
          <option value="Under Maintenance">Under Maintenance</option>
          <option value="Inactive">Inactive</option>
        </FSelect>
      </FieldRow>
      <FieldRow label="Operator">
        <FInput value={f.operator || ""} onChange={(v) => setF((p) => ({ ...p, operator: v }))} />
      </FieldRow>
      <FieldRow label="Project">
        <FSelect value={f.project || ""} onChange={(v) => setF((p) => ({ ...p, project: v }))}>
          <option value="">Select…</option>
          {projects.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </FSelect>
      </FieldRow>
      <FieldRow label="Purchase Date">
        <FInput type="date" value={f.purchaseDate || ""} onChange={(v) => setF((p) => ({ ...p, purchaseDate: v }))} />
      </FieldRow>
      <FieldRow label="Notes">
        <FTextarea value={f.notes || ""} onChange={(v) => setF((p) => ({ ...p, notes: v }))} />
      </FieldRow>
    </FormModal>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   PROJECT MANAGER MODAL
────────────────────────────────────────────────────────────────────────── */
function ProjectsModal({ projects, onSave, onClose }) {
  const [list, setList] = useState([...projects]);
  const [newName, setNewName] = useState("");

  const add = () => {
    const n = newName.trim();
    if (!n || list.includes(n)) return;
    setList((p) => [...p, n]);
    setNewName("");
  };

  const del = (idx) => setList((p) => p.filter((_, i) => i !== idx));

  return (
    <Overlay onClose={onClose}>
      <div style={modalShellStyle(460)}>
        <ModalHeader title="MANAGE PROJECTS" sub="Add or delete projects" onClose={onClose} />
        <div style={{ padding: 18, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New project name…" style={{ ...fieldStyle(), flex: 1 }} />
            <Btn color={T.green} solid onClick={add}>+ Add</Btn>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {list.map((p, i) => (
              <div
                key={`${p}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: T.card2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div style={{ flex: 1, color: T.text, fontSize: 14 }}>{p}</div>
                <ABtn color={T.red} onClick={() => del(i)}>✕</ABtn>
              </div>
            ))}
          </div>

          <Btn color={T.blue} solid onClick={() => onSave(list)}>Save Projects</Btn>
        </div>
      </div>
    </Overlay>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   CATEGORY MODAL
────────────────────────────────────────────────────────────────────────── */
function CatManagerModal({ title, cats, onSave, onClose }) {
  const [list, setList] = useState([...cats]);
  const [newName, setNewName] = useState("");

  const add = () => {
    const n = newName.trim();
    if (!n || list.includes(n)) return;
    setList((p) => [...p, n]);
    setNewName("");
  };

  const del = (idx) => setList((p) => p.filter((_, i) => i !== idx));

  return (
    <Overlay onClose={onClose}>
      <div style={modalShellStyle(460)}>
        <ModalHeader title={title} sub="Manage your categories" onClose={onClose} />
        <div style={{ padding: 18, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="New category…" style={{ ...fieldStyle(), flex: 1 }} />
            <Btn color={T.blue} solid onClick={add}>+ Add</Btn>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {list.map((c, i) => (
              <div
                key={`${c}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: T.card2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                <div style={{ flex: 1, color: T.text, fontSize: 14 }}>{c}</div>
                <ABtn color={T.red} onClick={() => del(i)}>✕</ABtn>
              </div>
            ))}
          </div>

          <Btn color={T.blue} solid onClick={() => onSave(list)}>Save Categories</Btn>
        </div>
      </div>
    </Overlay>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
   SHARED UI
────────────────────────────────────────────────────────────────────────── */
function PageWrap({ children }) {
  return <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%" }}>{children}</div>;
}

function PageHeader({ title, sub, children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: 12,
        alignItems: "flex-start",
        marginBottom: 18,
        flexWrap: "wrap",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 800,
            fontSize: 28,
            color: T.text,
            letterSpacing: ".5px",
          }}
        >
          {title}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{sub}</div>
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{children}</div>
    </div>
  );
}

function KpiCard({ label, value, color }) {
  return (
    <div
      className="fade-up"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 12,
        boxShadow: T.shadow,
        padding: "16px 18px",
      }}
    >
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: 34,
          lineHeight: 1,
          color,
        }}
      >
        {value}
      </div>
      <div style={{ marginTop: 5, fontSize: 12, color: T.textMuted }}>{label}</div>
    </div>
  );
}

function QuickCard({ title, sub, stat, color, onClick }) {
  return (
    <div
      className="fade-up"
      onClick={onClick}
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        boxShadow: T.shadow,
        padding: 18,
        cursor: "pointer",
      }}
    >
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, color: T.text }}>
        {title}
      </div>
      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>{sub}</div>
      <div style={{ marginTop: 10, color, fontWeight: 700, fontSize: 13 }}>{stat}</div>
    </div>
  );
}

function AlertRow({ a }) {
  const s = getStatus(a.days);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: T.card2,
        border: `1px solid ${T.border}`,
        borderRadius: 10,
        padding: "10px 12px",
      }}
    >
      <div style={{ width: 3, alignSelf: "stretch", background: s.color, borderRadius: 999 }} />
      <div style={{ flex: 1 }}>
        <div style={{ color: T.text, fontSize: 13, fontWeight: 700 }}>{a.label}</div>
        <div style={{ color: T.textMuted, fontSize: 11 }}>{a.src}</div>
      </div>
      <div style={{ color: s.color, fontWeight: 800, fontSize: 13 }}>
        {a.days < 0 ? `${Math.abs(a.days)}d overdue` : `${a.days}d left`}
      </div>
    </div>
  );
}

function Empty({ icon, label, sub, color, onAdd }) {
  return (
    <div
      style={{
        background: T.card,
        border: `1px dashed ${T.borderLight}`,
        borderRadius: 14,
        padding: "40px 18px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 40, marginBottom: 10 }}>{icon}</div>
      <div
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontWeight: 800,
          fontSize: 22,
          color: T.text,
          marginBottom: 5,
        }}
      >
        {label}
      </div>
      <div style={{ color: T.textMuted, fontSize: 13, marginBottom: 14 }}>{sub}</div>
      <Btn color={color} solid onClick={onAdd}>+ Add</Btn>
    </div>
  );
}

function Btn({ color, solid, children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: solid ? color : `${color}18`,
        color: solid ? "#000" : color,
        border: solid ? "none" : `1px solid ${color}55`,
        borderRadius: 9,
        padding: "9px 14px",
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      {children}
    </button>
  );
}

function ABtn({ color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 30,
        height: 30,
        borderRadius: 8,
        border: `1px solid ${color}55`,
        background: `${color}18`,
        color,
        fontSize: 12,
        fontWeight: 800,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

function Tag({ color, children }) {
  return (
    <span
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}33`,
        borderRadius: 999,
        padding: "2px 8px",
        fontSize: 10,
        fontWeight: 800,
      }}
    >
      {children}
    </span>
  );
}

function Chip({ color = T.textSub, children }) {
  return (
    <span
      style={{
        background: T.card2,
        border: `1px solid ${T.border}`,
        color,
        borderRadius: 999,
        padding: "4px 9px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      {children}
    </span>
  );
}

function Title({ children }) {
  return (
    <span
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        fontWeight: 800,
        fontSize: 17,
        color: T.text,
      }}
    >
      {children}
    </span>
  );
}

function FileLink({ href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={(e) => e.stopPropagation()}
      style={{
        background: T.blueDim,
        border: `1px solid ${T.blue}33`,
        borderRadius: 999,
        padding: "4px 9px",
        fontSize: 11,
        color: T.blue,
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      📎 Open File
    </a>
  );
}

function CardRow({ children, delay = 0, borderLeft }) {
  return (
    <div
      className="fade-up"
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderLeft: `4px solid ${borderLeft}`,
        borderRadius: 12,
        padding: "15px 16px",
        display: "flex",
        gap: 14,
        alignItems: "flex-start",
        animationDelay: `${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 14,
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function FormModal({ title, color, onClose, onSave, children }) {
  return (
    <Overlay onClose={onClose}>
      <div style={modalShellStyle(620)}>
        <ModalHeader title={title} sub="Complete the form below" onClose={onClose} />
        <div style={{ padding: 18, display: "grid", gap: 12 }}>
          {children}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
            <Btn color={T.textMuted} onClick={onClose}>Cancel</Btn>
            <Btn color={color} solid onClick={onSave}>Save</Btn>
          </div>
        </div>
      </div>
    </Overlay>
  );
}

function ModalHeader({ title, sub, onClose }) {
  return (
    <div
      style={{
        padding: "18px 18px 14px",
        borderBottom: `1px solid ${T.border}`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 22, color: T.text }}>
          {title}
        </div>
        <div style={{ fontSize: 12, color: T.textMuted }}>{sub}</div>
      </div>
      <button onClick={onClose} style={iconBtnStyle(T.card2, T.text)}>×</button>
    </div>
  );
}

function FieldRow({ label, children }) {
  return (
    <div>
      <div style={{ marginBottom: 6, fontSize: 12, color: T.textSub, fontWeight: 700 }}>{label}</div>
      {children}
    </div>
  );
}

function FInput({ value, onChange, type = "text" }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle()} />;
}

function FSelect({ value, onChange, children }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={fieldStyle()}>
      {children}
    </select>
  );
}

function FTextarea({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      style={{ ...fieldStyle(), resize: "vertical", minHeight: 100 }}
    />
  );
}

function fieldStyle() {
  return {
    width: "100%",
    background: T.inputBg,
    border: `1px solid ${T.border}`,
    borderRadius: 9,
    padding: "10px 12px",
    fontSize: 13,
    color: T.text,
    outline: "none",
  };
}

function modalShellStyle(maxWidth) {
  return {
    width: "100%",
    maxWidth,
    background: T.card,
    border: `1px solid ${T.border}`,
    borderRadius: 16,
    boxShadow: T.shadow,
    overflow: "hidden",
  };
}

function iconBtnStyle(bg, color) {
  return {
    width: 38,
    height: 38,
    borderRadius: 9,
    border: "1px solid rgba(255,255,255,0.12)",
    background: bg,
    color,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  };
}

function sidebarAuxBtnStyle() {
  return {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "transparent",
    color: "#e2e8f0",
    fontSize: 12,
    fontWeight: 700,
  };
}
