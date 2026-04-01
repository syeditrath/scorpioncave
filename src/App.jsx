import { useState, useEffect } from "react";

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
  border:"#b8cce0",
  text:"#0d1f35",
  textSub:"#2d4a6b",
  textMuted:"#5a7a9a",
  blue:"#1d6fce",
  green:"#0d9e6e",
  gold:"#d97706",
  red:"#dc2626",
  blueDim:"rgba(29,111,206,0.12)",
  greenDim:"rgba(13,158,110,0.12)",
  goldDim:"rgba(217,119,6,0.12)",
  redDim:"rgba(220,38,38,0.12)",
  inputBg:"#f4f7fb",
  shadow:"0 4px 16px rgba(13,31,53,0.10)",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const uid = () => Math.random().toString(36).slice(2,9);
const daysUntil = d => d ? Math.ceil((new Date(d) - new Date()) / 86400000) : null;
const fmtDate = d => d ? new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}) : "—";
function getStatus(days) {
  if (days === null) return { label:"Unknown", color:T.textMuted, bg:"rgba(61,80,104,.15)" };
  if (days < 0) return { label:"Expired", color:T.red, bg:T.redDim };
  if (days <= 90) return { label:"Expiring Soon", color:T.gold, bg:T.goldDim };
  return { label:"Valid", color:T.green, bg:T.greenDim };
}

/* ─── Shared UI Components ───────────────────────────────────────────────── */
const Card = ({children, style, noPad}) => (
  <div className="slide-up" style={{background:T.card, border:`1px solid ${T.border}`, borderRadius:16, padding:noPad?0:24, boxShadow:T.shadow, ...style}}>{children}</div>
);
const Input = ({label, value, onChange, type="text", placeholder, options}) => (
  <div style={{marginBottom:16}}>
    {label && <label style={{display:"block", fontSize:12, fontWeight:700, color:T.textSub, marginBottom
