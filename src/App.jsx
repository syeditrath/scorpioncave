import React, { useState, useEffect } from "react";

/* =========================
   THEMES
========================= */
const LIGHT_T = {
  bg:"#f0e6d3",
  sidebar:"#080b10",
  text:"#ffffff",
};

const DARK_T = {
  bg:"#0b1220",
  sidebar:"#f0e6d3",
  text:"#1a0a00",
};

/* =========================
   APP
========================= */
export default function App() {
  const [dark, setDark] = useState(localStorage.getItem("dark")==="true");
  const T = dark ? DARK_T : LIGHT_T;

  useEffect(()=>{
    localStorage.setItem("dark", dark);
  },[dark]);

  return (
    <div style={{display:"flex",height:"100vh",background:T.bg}}>

      {/* Sidebar */}
      <div style={{
        width:260,
        background:T.sidebar,
        padding:20,
        display:"flex",
        flexDirection:"column",
        gap:20
      }}>

        {/* Logo FIXED */}
        <div style={{
          width:70,
          height:70,
          borderRadius:"50%",
          background:"#ffffff",
          overflow:"hidden",
          boxShadow:"0 0 0 2px rgba(251,191,36,0.6)",
          display:"flex",
          alignItems:"center",
          justifyContent:"center"
        }}>
          <img
            src="logo.png?v=2"
            alt="logo"
            style={{
              width:"115%",
              height:"115%",
              objectFit:"cover",
              display:"block"
            }}
          />
        </div>

        <div style={{color:T.text,fontWeight:"bold"}}>
          SCORPION ARABIA
        </div>

        <button onClick={()=>setDark(d=>!d)}>
          Toggle Theme
        </button>

      </div>

      {/* Main */}
      <div style={{flex:1,padding:40}}>
        <h1 style={{color:dark?"#fff":"#000"}}>
          Dashboard
        </h1>
      </div>

    </div>
  );
}
