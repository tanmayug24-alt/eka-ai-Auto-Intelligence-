import { useState, useEffect, useRef, useCallback } from "react";

/* ══════════════════════════════════════════════════════════
   DESIGN TOKENS
══════════════════════════════════════════════════════════ */
const C = {
  bg:         "#0d0d0d",
  surface:    "#161616",
  card:       "#1a1a1a",
  card2:      "#202020",
  border:     "#262626",
  border2:    "#303030",
  orange:     "#f18a22",
  orangeD:    "#c4701a",
  orangeGlow: "rgba(241,138,34,0.12)",
  orangeGlow2:"rgba(241,138,34,0.06)",
  green:      "#22c55e",
  red:        "#ef4444",
  blue:       "#3b82f6",
  yellow:     "#f59e0b",
  purple:     "#a855f7",
  text:       "#ebebeb",
  textSub:    "#a0a0a0",
  textDim:    "#606060",
  textDimmer: "#3a3a3a",
  white:      "#ffffff",
};

/* ══════════════════════════════════════════════════════════
   MOCK SERVICE LAYER  (src/services/mock/)
══════════════════════════════════════════════════════════ */
const delay = (ms = 800) => new Promise(r => setTimeout(r, ms));

const MockAuthService = {
  login: async (email, pass) => {
    await delay(600);
    const roles = { "owner@ekaai.in": "Workshop Owner", "tech@ekaai.in": "Technician", "fleet@ekaai.in": "Fleet Manager", "owner2@ekaai.in": "Vehicle Owner" };
    if (roles[email] && pass === "demo1234") return { ok: true, user: { name: email.split("@")[0].charAt(0).toUpperCase()+email.split("@")[0].slice(1), email, role: roles[email], avatar: email.slice(0,2).toUpperCase(), plan: "Pro", jobsUsed: 47, jobsLimit: 100, tokensUsed: 82400, tokensLimit: 100000 } };
    return { ok: false, error: "Invalid credentials" };
  },
  googleOAuth: async () => { await delay(800); return { ok: true, user: { name: "Arjun Mehta", email: "arjun@ekaai.in", role: "Workshop Owner", avatar: "AM", plan: "Pro", jobsUsed: 47, jobsLimit: 100, tokensUsed: 82400, tokensLimit: 100000 } }; },
};

const MockJobService = {
  getAll: async () => { await delay(400); return MOCK_JOBS; },
  advance: async (id, nextStatus) => { await delay(800); return { ok: true, status: nextStatus }; },
  approve: async (id) => { await delay(500); return { ok: true }; },
};

const MockCatalogService = {
  search: async (q) => { await delay(300); return CATALOG_ITEMS.filter(i => i.name.toLowerCase().includes(q.toLowerCase()) || i.id.toLowerCase().includes(q.toLowerCase())); },
};

const MockAIService = {
  diagnose: async (prompt) => {
    await delay(1400);
    return {
      issue_summary: `Intermittent engine stalling and rough idle on ${prompt.includes("Swift") ? "2019 Maruti Swift 1.2 K-Series" : "vehicle"} under warm operating conditions`,
      probable_causes: ["Clogged Mass Air Flow (MAF) sensor causing lean air-fuel mixture at idle","Faulty Idle Air Control (IAC) valve — reduced bypass airflow at low RPM","Carbon buildup on throttle body bore restricting airflow","Degraded fuel pressure due to aging fuel pump (pressure < 280 kPa)","Vacuum leak at intake manifold gasket or PCV hose"],
      diagnostic_steps: ["Connect OBD-II scanner — retrieve & document all DTCs (P0300, P0171, P0507)","Inspect MAF sensor with scan tool live data; clean with MAF-safe spray if dirty","Measure fuel rail pressure at idle (spec: 280–320 kPa) and at WOT","Visually inspect throttle body; clean if carbon deposits > 1mm","Test IAC valve coil resistance (spec: 10–15 Ω); replace if open/shorted","Perform smoke test on intake manifold for vacuum leaks"],
      safety_advisory: { level: "warning", message: "Avoid extended idling during diagnosis. Ensure workshop ventilation is active. Do NOT clear DTCs before customer provides written approval." },
      confidence_score: 87,
      estimated_repair_time: "2.5–4 hrs",
      urgency: "medium",
    };
  },
};

/* ══════════════════════════════════════════════════════════
   MOCK DATA
══════════════════════════════════════════════════════════ */
const JOB_STATES = ["OPEN","DIAGNOSIS","ESTIMATE","APPROVAL","REPAIR","READY","INVOICED"];

const MOCK_JOBS = [
  { id:"JC-2401", vehicle:"MH12-AB-1234", make:"Maruti Swift", customer:"Rajesh Kumar", status:"REPAIR", tech:"Vikas S.", amount:12500, pdi:60, approved:true, updated:"2h ago", complaint:"Engine stalling at idle" },
  { id:"JC-2402", vehicle:"MH14-CD-5678", make:"Hyundai Creta", customer:"Priya Sharma", status:"ESTIMATE", tech:"Amit P.", amount:8200, pdi:0, approved:false, updated:"4h ago", complaint:"AC not cooling" },
  { id:"JC-2403", vehicle:"MH01-EF-9012", make:"Toyota Fortuner", customer:"Suresh Nair", status:"DIAGNOSIS", tech:"Ravi K.", amount:0, pdi:0, approved:false, updated:"1d ago", complaint:"Vibration at highway speed" },
  { id:"JC-2404", vehicle:"MH04-GH-3456", make:"Tata Nexon", customer:"Meena Joshi", status:"READY", tech:"Vikas S.", amount:6800, pdi:100, approved:true, updated:"30m ago", complaint:"Brake noise on stopping" },
  { id:"JC-2405", vehicle:"MH02-IJ-7890", make:"Honda City", customer:"Deepak Rao", status:"INVOICED", tech:"Amit P.", amount:15600, pdi:100, approved:true, updated:"1d ago", complaint:"Full service + oil change" },
  { id:"JC-2406", vehicle:"MH03-KL-2345", make:"Kia Seltos", customer:"Anita Verma", status:"OPEN", tech:"Ravi K.", amount:0, pdi:0, approved:false, updated:"10m ago", complaint:"Check engine light on" },
];

const CATALOG_ITEMS = [
  { id:"P001", name:"Engine Oil Filter", type:"PART", hsn:"84212300", price:320, gst:18 },
  { id:"P002", name:"Brake Pad Set (Front)", type:"PART", hsn:"87083000", price:1800, gst:18 },
  { id:"P003", name:"Air Filter", type:"PART", hsn:"84213900", price:450, gst:18 },
  { id:"P004", name:"Spark Plug (x4)", type:"PART", hsn:"85113000", price:1200, gst:18 },
  { id:"P005", name:"Engine Oil 5W30 (5L)", type:"PART", hsn:"27101980", price:2200, gst:18 },
  { id:"P006", name:"Timing Belt Kit", type:"PART", hsn:"40103990", price:4500, gst:18 },
  { id:"P007", name:"AC Refrigerant R134a", type:"PART", hsn:"29031900", price:1800, gst:18 },
  { id:"P008", name:"Wiper Blade Set", type:"PART", hsn:"85121000", price:650, gst:18 },
  { id:"L001", name:"Engine Oil Change", type:"LABOUR", sac:"998714", price:500, gst:18 },
  { id:"L002", name:"Brake Inspection & Pad Replace", type:"LABOUR", sac:"998714", price:800, gst:18 },
  { id:"L003", name:"Full Service (3000 km)", type:"LABOUR", sac:"998714", price:2500, gst:18 },
  { id:"L004", name:"AC Gas Recharge", type:"LABOUR", sac:"998714", price:1500, gst:18 },
  { id:"L005", name:"Wheel Alignment & Balancing", type:"LABOUR", sac:"998714", price:1200, gst:18 },
  { id:"L006", name:"Diagnostic Scan (OBD-II)", type:"LABOUR", sac:"998714", price:600, gst:18 },
];

const PDI_ITEMS = [
  { id:"p1",  label:"Engine oil level & quality", category:"Fluids" },
  { id:"p2",  label:"Coolant level & colour", category:"Fluids" },
  { id:"p3",  label:"Brake fluid level", category:"Fluids" },
  { id:"p4",  label:"Power steering fluid", category:"Fluids" },
  { id:"p5",  label:"Tyre pressure (all 4)", category:"Tyres & Brakes" },
  { id:"p6",  label:"Spare tyre pressure", category:"Tyres & Brakes" },
  { id:"p7",  label:"Brake pad thickness (front)", category:"Tyres & Brakes" },
  { id:"p8",  label:"Brake pad thickness (rear)", category:"Tyres & Brakes" },
  { id:"p9",  label:"All exterior lights functional", category:"Electrical" },
  { id:"p10", label:"Horn functional", category:"Electrical" },
  { id:"p11", label:"Battery terminals — clean & tight", category:"Electrical" },
  { id:"p12", label:"AC cooling performance", category:"Comfort" },
  { id:"p13", label:"All doors & locks functional", category:"Body" },
  { id:"p14", label:"No oil leaks under vehicle", category:"Engine Bay" },
  { id:"p15", label:"Test drive completed — no abnormal sounds", category:"Final" },
];

const MOCK_REVENUE = [
  {month:"Sep",rev:128000,cost:84000}, {month:"Oct",rev:142000,cost:91000},
  {month:"Nov",rev:156000,cost:98000}, {month:"Dec",rev:134000,cost:88000},
  {month:"Jan",rev:168000,cost:104000}, {month:"Feb",rev:179000,cost:112000},
];

const FEATURE_SLIDES = [
  { icon:"🔧", title:"AI Diagnostics", desc:"Constitutional AI analyses symptoms and returns structured diagnosis — never hallucinated pricing.", color: C.orange },
  { icon:"📋", title:"Job Card Engine", desc:"7-stage state machine with governance gates. Repair cannot start without customer approval.", color: C.blue },
  { icon:"💰", title:"Smart Invoicing", desc:"GST-compliant invoices with HSN/SAC codes, auto-calculated from the locked catalog.", color: C.green },
  { icon:"✅", title:"PDI Checklist", desc:"Zero-tolerance delivery inspection. Every item must pass before vehicle handover.", color: C.purple },
  { icon:"📊", title:"Analytics", desc:"Real-time revenue tracking, technician efficiency scores, and profit margin analysis.", color: C.yellow },
  { icon:"🚗", title:"Fleet Management", desc:"Downtime tracking, cost-per-vehicle analysis, and high-risk vehicle alerts.", color: C.red },
];

/* ══════════════════════════════════════════════════════════
   PRICING DATA
══════════════════════════════════════════════════════════ */
const PRICING = {
  "EKA-Ai": [
    { name:"Starter", price:0, period:"Free forever", jobs:5, tokens:"10k", highlight:false, features:["5 Job Cards/month","10,000 AI tokens","Basic diagnostics","Email support"] },
    { name:"Pro", price:999, period:"/month", jobs:100, tokens:"200k", highlight:true, badge:"Most Popular", features:["100 Job Cards/month","200,000 AI tokens","Full diagnostics + PDI","Priority support","Catalog access","GST invoicing"] },
    { name:"Elite", price:2499, period:"/month", jobs:500, tokens:"1M", highlight:false, features:["500 Job Cards/month","1M AI tokens","Multi-technician","Analytics dashboard","API access","SLA support"] },
  ],
  "Workshop": [
    { name:"Single Bay", price:1499, period:"/month", jobs:150, tokens:"300k", highlight:false, features:["1 workshop","150 Job Cards","300k tokens","Technician accounts × 3","Basic analytics"] },
    { name:"Workshop Pro", price:3499, period:"/month", jobs:500, tokens:"1M", highlight:true, badge:"Recommended", features:["1 workshop","500 Job Cards","1M tokens","Unlimited technicians","Full analytics","Custom branding","WhatsApp alerts"] },
    { name:"Workshop Elite", price:7999, period:"/month", jobs:2000, tokens:"5M", highlight:false, features:["Multi-location","2000 Job Cards","5M tokens","Fleet integration","ERP sync","Dedicated CSM"] },
  ],
  "MG Fleet": [
    { name:"Fleet Starter", price:4999, period:"/month", jobs:200, tokens:"500k", highlight:false, features:["Up to 50 vehicles","200 Job Cards","Downtime tracking","Cost analysis","Monthly reports"] },
    { name:"Fleet Pro", price:9999, period:"/month", jobs:1000, tokens:"2M", highlight:true, badge:"Best Value", features:["Up to 200 vehicles","1000 Job Cards","2M tokens","Risk scoring","Driver reports","Fleet API","Priority SLA"] },
    { name:"Enterprise", price:null, period:"Custom", jobs:"∞", tokens:"∞", highlight:false, features:["Unlimited vehicles","Custom Job limits","Dedicated infra","Custom integrations","24/7 support","On-site training"] },
  ],
  "Add-Ons": [
    { name:"Token Pack 500k", price:799, period:"one-time", jobs:null, tokens:"500k", highlight:false, features:["500,000 AI tokens","Never expires","Stackable","All models included"] },
    { name:"Job Card Pack 100", price:499, period:"one-time", jobs:100, tokens:null, highlight:false, features:["100 additional Job Cards","Carry forward unused","No expiry","GST invoice"] },
    { name:"WhatsApp Integration", price:999, period:"/month", jobs:null, tokens:null, highlight:true, badge:"Popular Add-on", features:["Customer notifications","Job status updates","Estimate approval via WA","Delivery reminders"] },
    { name:"Custom Branding", price:1999, period:"one-time", jobs:null, tokens:null, highlight:false, features:["Logo on invoices","Custom domain","Branded customer portal","Email white-labeling"] },
  ],
};

/* ══════════════════════════════════════════════════════════
   SHARED UI COMPONENTS
══════════════════════════════════════════════════════════ */
const css = (obj) => Object.entries(obj).map(([k,v])=>`${k.replace(/([A-Z])/g,'-$1').toLowerCase()}:${v}`).join(';');

const Pill = ({ children, color = C.orange, bg, style = {} }) => (
  <span style={{ background: bg || `${color}20`, color, border: `1px solid ${color}35`,
    padding:"2px 10px", borderRadius:4, fontSize:10, fontWeight:700,
    letterSpacing:"0.1em", display:"inline-block", ...style }}>{children}</span>
);

const Btn = ({ children, variant="primary", onClick, disabled, loading, style={}, full }) => {
  const variants = {
    primary: { background: disabled ? `${C.orange}40` : C.orange, color: "#000", border:"none" },
    ghost:   { background:"transparent", color:C.textSub, border:`1px solid ${C.border}` },
    danger:  { background:`${C.red}18`, color:C.red, border:`1px solid ${C.red}30` },
    success: { background:`${C.green}18`, color:C.green, border:`1px solid ${C.green}30` },
    outline: { background:"transparent", color:C.orange, border:`1px solid ${C.orange}` },
    google:  { background:"#fff", color:"#1a1a1a", border:`1px solid #ddd` },
  };
  return (
    <button onClick={!disabled && !loading ? onClick : undefined} disabled={disabled || loading}
      style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        padding:"9px 18px", borderRadius:6, fontSize:13, fontWeight:600, letterSpacing:"0.03em",
        cursor: disabled || loading ? "not-allowed" : "pointer", transition:"all 0.15s",
        opacity: disabled ? 0.45 : 1, width: full?"100%":undefined, ...variants[variant], ...style }}>
      {loading ? <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>◌</span> : children}
    </button>
  );
};

const Card = ({ children, style={}, hover, onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>hover&&setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:C.card, border:`1px solid ${hov?C.border2:C.border}`,
        borderRadius:10, padding:20, transition:"all 0.2s",
        cursor: onClick?"pointer":undefined,
        boxShadow: hov ? `0 4px 24px rgba(0,0,0,0.4)` : "none",
        ...style }}>{children}</div>
  );
};

const Input = ({ value, onChange, placeholder, type="text", style={} }) => (
  <input value={value} onChange={onChange} type={type} placeholder={placeholder}
    style={{ width:"100%", background:C.surface, border:`1px solid ${C.border}`,
      borderRadius:6, padding:"10px 14px", color:C.text, fontSize:13,
      outline:"none", transition:"border-color 0.15s", boxSizing:"border-box", ...style }}
    onFocus={e=>e.target.style.borderColor=C.orange}
    onBlur={e=>e.target.style.borderColor=C.border} />
);

const StatusBadge = ({ status }) => {
  const map = { OPEN:[C.blue,"OPEN"], DIAGNOSIS:[C.yellow,"DIAG"], ESTIMATE:[C.purple,"EST"],
    APPROVAL:[C.yellow,"APPROVAL"], REPAIR:[C.orange,"REPAIR"], READY:[C.green,"READY"], INVOICED:[C.textDim,"INVOICED"] };
  const [color, label] = map[status] || [C.textDim, status];
  return <Pill color={color}>{label}</Pill>;
};

const ProgressBar = ({ value, max, color = C.orange, height = 4 }) => (
  <div style={{ background:C.border, borderRadius:99, height, overflow:"hidden" }}>
    <div style={{ width:`${Math.min((value/max)*100,100)}%`, height:"100%", borderRadius:99,
      background:color, transition:"width 0.4s ease" }} />
  </div>
);

/* ══════════════════════════════════════════════════════════
   LOGIN PAGE — Split Screen with Feature Carousel
══════════════════════════════════════════════════════════ */
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("owner@ekaai.in");
  const [pass, setPass] = useState("demo1234");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);

  // Auto-advance carousel
  useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i+1) % FEATURE_SLIDES.length), 3200);
    return () => clearInterval(t);
  }, []);

  const handleLogin = async () => {
    setLoading(true); setError("");
    const res = await MockAuthService.login(email, pass);
    if (res.ok) onLogin(res.user);
    else { setError(res.error); setLoading(false); }
  };

  const handleGoogle = async () => {
    setLoading(true);
    const res = await MockAuthService.googleOAuth();
    if (res.ok) onLogin(res.user);
  };

  const slide = FEATURE_SLIDES[slideIdx];

  return (
    <div style={{ minHeight:"100vh", display:"flex", fontFamily:"'DM Sans', system-ui, sans-serif",
      background:C.bg }}>

      {/* LEFT — Login Form */}
      <div style={{ width:"42%", display:"flex", flexDirection:"column", justifyContent:"center",
        padding:"48px 56px", position:"relative", zIndex:2 }}>

        {/* Ambient glow */}
        <div style={{ position:"absolute", top:-100, left:-100, width:400, height:400, borderRadius:"50%",
          background:`radial-gradient(circle, ${C.orangeGlow} 0%, transparent 70%)`, pointerEvents:"none" }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48 }}>
          <div style={{ width:44, height:44, background:C.orange, borderRadius:10,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:22, fontWeight:900, color:"#000", boxShadow:`0 0 24px ${C.orange}60` }}>⚡</div>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:C.text, letterSpacing:"0.04em" }}>EKA-AI</div>
            <div style={{ fontSize:9, color:C.orange, letterSpacing:"0.2em", marginTop:1 }}>AUTO INTELLIGENCE</div>
          </div>
        </div>

        <h1 style={{ fontSize:32, fontWeight:900, color:C.text, lineHeight:1.15, marginBottom:8, margin:"0 0 8px" }}>
          AI-powered<br /><span style={{ color:C.orange }}>garage intelligence</span>
        </h1>
        <p style={{ color:C.textSub, fontSize:14, marginBottom:32, lineHeight:1.6, margin:"0 0 32px" }}>
          Constitutional AI governance for workshops, fleets & vehicle owners. Zero hallucinated pricing.
        </p>

        {/* Google OAuth */}
        <Btn variant="google" onClick={handleGoogle} loading={loading} full style={{ marginBottom:16 }}>
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </Btn>

        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:C.border }} />
          <span style={{ fontSize:11, color:C.textDim }}>or</span>
          <div style={{ flex:1, height:1, background:C.border }} />
        </div>

        <div style={{ marginBottom:12 }}>
          <label style={{ display:"block", fontSize:10, color:C.textDim, letterSpacing:"0.1em", marginBottom:5 }}>EMAIL</label>
          <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@workshop.com" />
        </div>
        <div style={{ marginBottom:8 }}>
          <label style={{ display:"block", fontSize:10, color:C.textDim, letterSpacing:"0.1em", marginBottom:5 }}>PASSWORD</label>
          <Input value={pass} onChange={e=>setPass(e.target.value)} type="password" placeholder="••••••••" />
        </div>

        {error && <div style={{ color:C.red, fontSize:12, marginBottom:8 }}>⚠ {error}</div>}

        <Btn variant="primary" onClick={handleLogin} loading={loading} full
          style={{ marginTop:8, padding:"11px", fontSize:14, fontWeight:700 }}>
          Sign In →
        </Btn>

        <div style={{ marginTop:20, padding:"12px 14px", background:C.surface,
          border:`1px solid ${C.border}`, borderRadius:8 }}>
          <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.08em", marginBottom:6 }}>DEMO ACCOUNTS</div>
          {[["owner@ekaai.in","Workshop Owner"],["tech@ekaai.in","Technician"],["fleet@ekaai.in","Fleet Manager"]].map(([e,r]) => (
            <div key={e} onClick={() => { setEmail(e); setPass("demo1234"); }}
              style={{ fontSize:11, color:C.textSub, padding:"3px 0", cursor:"pointer" }}>
              <span style={{ color:C.orange }}>→</span> {e} <span style={{ color:C.textDim }}>({r})</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Feature Carousel */}
      <div style={{ flex:1, background:"#f8f8f8", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center", padding:48, position:"relative", overflow:"hidden" }}>

        {/* Grid background */}
        <div style={{ position:"absolute", inset:0,
          backgroundImage:`linear-gradient(${C.border}20 1px, transparent 1px), linear-gradient(90deg, ${C.border}20 1px, transparent 1px)`,
          backgroundSize:"32px 32px" }} />

        {/* Constitutional Badge */}
        <div style={{ position:"absolute", top:24, right:24,
          background:"#fff", border:`2px solid ${C.orange}`, borderRadius:8,
          padding:"6px 14px", fontSize:10, fontWeight:700, color:C.orange, letterSpacing:"0.08em",
          boxShadow:`0 0 20px ${C.orangeGlow}` }}>
          Constitutional AI • Governed Pricing • No Unlimited Chat
        </div>

        {/* Phone Mockup */}
        <div style={{ position:"relative", zIndex:1, textAlign:"center", marginBottom:32 }}>
          <div style={{ width:220, height:400, background:"#1a1a1a", borderRadius:32, margin:"0 auto",
            border:"8px solid #2a2a2a", boxShadow:"0 32px 80px rgba(0,0,0,0.4)",
            overflow:"hidden", position:"relative" }}>
            {/* Status bar */}
            <div style={{ background:"#0d0d0d", padding:"12px 16px 6px", display:"flex",
              justifyContent:"space-between", fontSize:9, color:"#888" }}>
              <span>9:41</span><span>● ●●● WiFi</span>
            </div>
            {/* App content */}
            <div style={{ padding:16, display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ fontSize:11, fontWeight:700, color:slide.color, letterSpacing:"0.1em" }}>
                {slide.icon} {slide.title.toUpperCase()}
              </div>
              <div style={{ fontSize:10, color:"#888", lineHeight:1.5 }}>{slide.desc}</div>
              <div style={{ background:`${slide.color}15`, border:`1px solid ${slide.color}30`,
                borderRadius:8, padding:10, marginTop:8 }}>
                <div style={{ fontSize:10, color:slide.color, fontWeight:600 }}>ACTIVE</div>
                <div style={{ background:C.border, borderRadius:99, height:3, marginTop:6 }}>
                  <div style={{ width:"72%", height:"100%", borderRadius:99, background:slide.color }} />
                </div>
              </div>
              {[1,2,3].map(n => (
                <div key={n} style={{ background:"#242424", borderRadius:6, padding:"8px 10px",
                  display:"flex", gap:8, alignItems:"center" }}>
                  <div style={{ width:8, height:8, borderRadius:99, background:slide.color }} />
                  <div style={{ flex:1, height:3, background:"#333", borderRadius:99 }}>
                    <div style={{ width:`${[60,80,45][n-1]}%`, height:"100%", background:"#444", borderRadius:99 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Slide Info */}
        <div style={{ textAlign:"center", maxWidth:360, position:"relative", zIndex:1 }}>
          <div style={{ fontSize:22, fontWeight:800, color:"#1a1a1a", marginBottom:8 }}>{slide.title}</div>
          <div style={{ fontSize:14, color:"#666", lineHeight:1.6 }}>{slide.desc}</div>
        </div>

        {/* Dots */}
        <div style={{ display:"flex", gap:8, marginTop:24, position:"relative", zIndex:1 }}>
          {FEATURE_SLIDES.map((_,i) => (
            <div key={i} onClick={() => setSlideIdx(i)} style={{
              width: i===slideIdx?24:8, height:8, borderRadius:99, cursor:"pointer", transition:"all 0.3s",
              background: i===slideIdx ? C.orange : "#ccc" }} />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   SIDEBAR + USAGE METER
══════════════════════════════════════════════════════════ */
const NAV_ITEMS = [
  { id:"dashboard", icon:"⊞", label:"Dashboard" },
  { id:"jobs",      icon:"◈", label:"Job Cards" },
  { id:"estimate",  icon:"◧", label:"Estimate Builder" },
  { id:"ai",        icon:"◉", label:"EKA AI Chat" },
  { id:"catalog",   icon:"▤", label:"Parts Catalog" },
  { id:"pdi",       icon:"✓", label:"PDI Checklist" },
  { id:"pricing",   icon:"◈", label:"Pricing & Plans" },
];

const UsageMeter = ({ user }) => {
  const jp = (user.jobsUsed/user.jobsLimit)*100;
  const tp = (user.tokensUsed/user.tokensLimit)*100;
  return (
    <div style={{ padding:"14px 16px", borderTop:`1px solid ${C.border}` }}>
      <div style={{ fontSize:9, color:C.textDim, letterSpacing:"0.12em", marginBottom:10 }}>USAGE QUOTA · {user.plan}</div>
      {[[`JOB CARDS`, jp, `${user.jobsUsed} / ${user.jobsLimit}`],
        [`TOKENS`, tp, `${(user.tokensUsed/1000).toFixed(1)}k / ${(user.tokensLimit/1000).toFixed(0)}k`]
      ].map(([label,pct,disp]) => (
        <div key={label} style={{ marginBottom:10 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, marginBottom:5 }}>
            <span style={{ color:C.textDim }}>{label}</span>
            <span style={{ color: pct>80?C.red:C.orange, fontWeight:600 }}>{disp}</span>
          </div>
          <ProgressBar value={pct} max={100} color={pct>80?C.red:C.orange} height={5} />
        </div>
      ))}
      {jp > 70 && (
        <div style={{ background:`${C.orange}12`, border:`1px solid ${C.orange}25`,
          borderRadius:6, padding:"6px 10px", marginTop:6 }}>
          <div style={{ fontSize:10, color:C.orange }}>⚠ Approaching limit · Upgrade for more</div>
        </div>
      )}
    </div>
  );
};

const Sidebar = ({ active, setActive, user }) => (
  <div style={{ width:230, background:C.surface, borderRight:`1px solid ${C.border}`,
    display:"flex", flexDirection:"column", height:"100vh", position:"fixed", left:0, top:0, zIndex:100 }}>

    {/* Logo */}
    <div style={{ padding:"18px 16px 14px", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, background:C.orange, borderRadius:8,
          display:"flex", alignItems:"center", justifyContent:"center",
          fontSize:17, color:"#000", fontWeight:900, boxShadow:`0 0 14px ${C.orange}50` }}>⚡</div>
        <div>
          <div style={{ fontSize:14, fontWeight:900, color:C.text, letterSpacing:"0.04em" }}>EKA-AI</div>
          <div style={{ fontSize:9, color:C.orange, letterSpacing:"0.15em" }}>AUTO INTELLIGENCE</div>
        </div>
      </div>
    </div>

    {/* User */}
    <div style={{ padding:"12px 16px 10px", borderBottom:`1px solid ${C.border}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, borderRadius:999, background:C.orangeGlow,
          border:`1px solid ${C.orange}44`, display:"flex", alignItems:"center",
          justifyContent:"center", fontSize:11, fontWeight:700, color:C.orange }}>{user.avatar}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:12, fontWeight:600, color:C.text, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
          <div style={{ fontSize:9, color:C.orange, letterSpacing:"0.08em" }}>{user.role.toUpperCase()}</div>
        </div>
      </div>
    </div>

    {/* Nav */}
    <nav style={{ flex:1, padding:"8px 0", overflowY:"auto" }}>
      {NAV_ITEMS.map(n => {
        const isActive = active === n.id;
        return (
          <button key={n.id} onClick={() => setActive(n.id)} style={{
            width:"100%", display:"flex", alignItems:"center", gap:10, padding:"9px 16px",
            background: isActive ? C.orangeGlow : "transparent",
            borderLeft: isActive ? `2px solid ${C.orange}` : "2px solid transparent",
            border:"none", borderRight:"none", borderTop:"none", borderBottom:"none",
            borderLeft: isActive ? `2px solid ${C.orange}` : "2px solid transparent",
            color: isActive ? C.orange : C.textSub, cursor:"pointer", fontSize:13,
            fontWeight: isActive ? 600 : 400, transition:"all 0.15s",
          }}>
            <span style={{ fontSize:15, width:18, textAlign:"center" }}>{n.icon}</span>
            {n.label}
            {n.id === "pricing" && <span style={{ marginLeft:"auto", background:`${C.orange}20`,
              color:C.orange, fontSize:9, padding:"1px 6px", borderRadius:3, fontWeight:700 }}>NEW</span>}
          </button>
        );
      })}
    </nav>

    <UsageMeter user={user} />
  </div>
);

/* ══════════════════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════════════════ */
const Header = ({ title, subtitle, actions }) => (
  <div style={{ height:58, background:C.surface, borderBottom:`1px solid ${C.border}`,
    display:"flex", alignItems:"center", padding:"0 28px", gap:16,
    position:"sticky", top:0, zIndex:50 }}>
    <div style={{ flex:1 }}>
      <div style={{ fontSize:15, fontWeight:700, color:C.text, letterSpacing:"0.02em" }}>{title}</div>
      {subtitle && <div style={{ fontSize:11, color:C.textSub, marginTop:1 }}>{subtitle}</div>}
    </div>
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      {actions}
      <div style={{ fontSize:11, color:C.textDim }}>
        {new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <div style={{ width:7, height:7, borderRadius:99, background:C.green, boxShadow:`0 0 8px ${C.green}` }} />
        <span style={{ fontSize:10, color:C.green, letterSpacing:"0.06em" }}>LIVE</span>
      </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════
   DASHBOARD — Role-Aware
══════════════════════════════════════════════════════════ */
const Dashboard = ({ user }) => {
  const totalRev = MOCK_REVENUE.reduce((s,r)=>s+r.rev,0);
  const totalCost = MOCK_REVENUE.reduce((s,r)=>s+r.cost,0);
  const maxRev = Math.max(...MOCK_REVENUE.map(r=>r.rev));

  const OwnerDashboard = () => (
    <>
      {/* KPI Row */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[["₹1.79L","MONTHLY REVENUE","+11.3%",C.green,"Feb 2026"],
          ["₹67k","NET PROFIT","37.4% margin",C.green,""],
          ["12","ACTIVE JOBS","3 need approval",C.yellow,""],
          ["8","VEHICLES TODAY","2 ready for pickup",C.orange,""],
        ].map(([val,label,sub,col]) => (
          <Card key={label}>
            <div style={{ fontSize:9, color:C.textDim, letterSpacing:"0.12em", marginBottom:8 }}>{label}</div>
            <div style={{ fontSize:24, fontWeight:800, color:C.text }}>{val}</div>
            <div style={{ fontSize:11, color:col, marginTop:4 }}>{sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1.6fr 1fr", gap:14, marginBottom:14 }}>
        {/* Revenue Chart */}
        <Card>
          <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:14 }}>REVENUE vs COST — LAST 6 MONTHS</div>
          {MOCK_REVENUE.map(r => (
            <div key={r.month} style={{ display:"grid", gridTemplateColumns:"32px 1fr", gap:6, marginBottom:6, alignItems:"center" }}>
              <span style={{ fontSize:10, color:C.textDim }}>{r.month}</span>
              <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ flex:1, background:C.border, borderRadius:99, height:5 }}>
                    <div style={{ width:`${(r.rev/maxRev)*100}%`, height:"100%", borderRadius:99,
                      background:`linear-gradient(90deg,${C.orange},${C.orangeD})` }} />
                  </div>
                  <span style={{ fontSize:9, color:C.orange, width:36, textAlign:"right" }}>₹{(r.rev/1000).toFixed(0)}k</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ flex:1, background:C.border, borderRadius:99, height:5 }}>
                    <div style={{ width:`${(r.cost/maxRev)*100}%`, height:"100%", borderRadius:99,
                      background:C.textDim }} />
                  </div>
                  <span style={{ fontSize:9, color:C.textDim, width:36, textAlign:"right" }}>₹{(r.cost/1000).toFixed(0)}k</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ display:"flex", gap:14, marginTop:10 }}>
            <span style={{ fontSize:10, color:C.orange }}>● Revenue</span>
            <span style={{ fontSize:10, color:C.textDim }}>● Cost</span>
          </div>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:14 }}>JOB STATUS BREAKDOWN</div>
          {JOB_STATES.map(s => {
            const n = MOCK_JOBS.filter(j=>j.status===s).length;
            return (
              <div key={s} style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
                <StatusBadge status={s} />
                <span style={{ fontSize:14, fontWeight:700, color:n>0?C.text:C.textDim }}>{n}</span>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Quick Actions + Alerts */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
        <Card>
          <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:12 }}>QUICK ACTIONS</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
            {[["📋","New Job Card",C.orange],["💰","Create Estimate",C.green],["✅","PDI Check",C.blue]].map(([icon,label,col]) => (
              <div key={label} style={{ background:`${col}10`, border:`1px solid ${col}25`,
                borderRadius:8, padding:"14px 10px", textAlign:"center", cursor:"pointer" }}>
                <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:10, fontWeight:600, color:col }}>{label}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:12 }}>⚠ LOW STOCK ALERTS</div>
          {[["Engine Oil 5W30 (5L)","2 units",C.red],["Brake Fluid DOT4","4 units",C.yellow],["Air Filter (Swift)","3 units",C.yellow]].map(([name,qty,col]) => (
            <div key={name} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
              padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
              <span style={{ fontSize:12, color:C.text }}>{name}</span>
              <span style={{ fontSize:11, color:col, fontWeight:600 }}>{qty}</span>
            </div>
          ))}
        </Card>
      </div>
    </>
  );

  const TechDashboard = () => (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:20 }}>
        {[["3","ASSIGNED JOBS","In progress",C.orange],["1","PENDING PDI","Needs check",C.yellow],["94%","EFFICIENCY SCORE","This month",C.green]].map(([v,l,s,c]) => (
          <Card key={l}><div style={{ fontSize:9,color:C.textDim,letterSpacing:"0.12em",marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:28,fontWeight:800,color:C.text }}>{v}</div>
            <div style={{ fontSize:11,color:c,marginTop:4 }}>{s}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize:10,color:C.textSub,letterSpacing:"0.1em",marginBottom:14 }}>ASSIGNED JOBS TODAY</div>
        {MOCK_JOBS.filter(j=>["REPAIR","DIAGNOSIS","READY"].includes(j.status)).map(j => (
          <div key={j.id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
            padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{j.make} — {j.vehicle}</div>
              <div style={{ fontSize:11, color:C.textSub }}>{j.complaint}</div>
            </div>
            <StatusBadge status={j.status} />
          </div>
        ))}
      </Card>
    </>
  );

  const FleetDashboard = () => (
    <>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:20 }}>
        {[["47","TOTAL VEHICLES","Fleet size",C.blue],["3","HIGH RISK","Needs attention",C.red],["8.2h","AVG DOWNTIME","Per vehicle/mo",C.yellow],["₹42k","COST THIS MONTH","Fleet total",C.orange]].map(([v,l,s,c]) => (
          <Card key={l}><div style={{ fontSize:9,color:C.textDim,letterSpacing:"0.12em",marginBottom:8 }}>{l}</div>
            <div style={{ fontSize:24,fontWeight:800,color:C.text }}>{v}</div>
            <div style={{ fontSize:11,color:c,marginTop:4 }}>{s}</div></Card>
        ))}
      </div>
      <Card>
        <div style={{ fontSize:10,color:C.textSub,letterSpacing:"0.1em",marginBottom:14 }}>HIGH RISK VEHICLES</div>
        {[["MH12-ZA-0001","Toyota Fortuner","3 open faults","Engine + Brakes"],
          ["MH14-ZB-0024","Hyundai Creta","Overdue service","12,000 km overdue"],
          ["MH01-ZC-0008","Tata Nexon","Brake fluid low","Safety critical"],
        ].map(([reg,make,issue,detail]) => (
          <div key={reg} style={{ display:"flex", gap:12, alignItems:"center", padding:"10px 0", borderBottom:`1px solid ${C.border}` }}>
            <div style={{ width:8,height:8,borderRadius:99,background:C.red,flexShrink:0 }} />
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:10 }}>
                <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{reg}</span>
                <span style={{ fontSize:11, color:C.textSub }}>{make}</span>
              </div>
              <div style={{ fontSize:11, color:C.red }}>{issue} — <span style={{ color:C.textDim }}>{detail}</span></div>
            </div>
            <Pill color={C.red}>HIGH RISK</Pill>
          </div>
        ))}
      </Card>
    </>
  );

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:20 }}>
        <div style={{ fontSize:12, color:C.textSub }}>Dashboard view for:</div>
        <Pill color={C.orange}>{user.role.toUpperCase()}</Pill>
      </div>
      {user.role === "Workshop Owner" && <OwnerDashboard />}
      {user.role === "Technician" && <TechDashboard />}
      {user.role === "Fleet Manager" && <FleetDashboard />}
      {user.role === "Vehicle Owner" && (
        <Card><div style={{ padding:20, color:C.textSub }}>Vehicle owner view — Service history, active job status, estimate approvals.</div></Card>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   JOB CARD LIST
══════════════════════════════════════════════════════════ */
const JobList = ({ onSelect }) => {
  const [filter, setFilter] = useState("ALL");
  const filtered = filter==="ALL" ? MOCK_JOBS : MOCK_JOBS.filter(j=>j.status===filter);

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        {["ALL",...JOB_STATES].map(s => (
          <button key={s} onClick={()=>setFilter(s)} style={{
            padding:"5px 14px", borderRadius:4, fontSize:10, fontWeight:700,
            letterSpacing:"0.08em", cursor:"pointer", border:"none", transition:"all 0.15s",
            background: filter===s ? C.orange : C.card,
            color: filter===s ? "#000" : C.textSub,
          }}>{s}</button>
        ))}
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["JOB ID","VEHICLE","COMPLAINT","TECHNICIAN","STATUS","AMOUNT","UPDATED",""].map(h=>(
                <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:9,
                  color:C.textDim, letterSpacing:"0.12em", fontWeight:700 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((j,i) => (
              <tr key={j.id} style={{ borderBottom:`1px solid ${C.border}`,
                background: i%2===1 ? `${C.surface}60`:undefined }}>
                <td style={{ padding:"11px 16px" }}>
                  <span style={{ fontFamily:"monospace", fontSize:12, color:C.orange, fontWeight:700 }}>{j.id}</span>
                </td>
                <td style={{ padding:"11px 16px" }}>
                  <div style={{ fontSize:12, fontWeight:600, color:C.text }}>{j.vehicle}</div>
                  <div style={{ fontSize:10, color:C.textSub }}>{j.make}</div>
                </td>
                <td style={{ padding:"11px 16px", fontSize:11, color:C.textSub, maxWidth:160 }}>{j.complaint}</td>
                <td style={{ padding:"11px 16px", fontSize:12, color:C.textSub }}>{j.tech}</td>
                <td style={{ padding:"11px 16px" }}><StatusBadge status={j.status} /></td>
                <td style={{ padding:"11px 16px", fontSize:12, fontWeight:600, color:j.amount>0?C.text:C.textDim }}>
                  {j.amount>0?`₹${j.amount.toLocaleString()}`:"—"}
                </td>
                <td style={{ padding:"11px 16px", fontSize:11, color:C.textDim }}>{j.updated}</td>
                <td style={{ padding:"11px 16px" }}>
                  <Btn variant="ghost" onClick={()=>onSelect(j)} style={{ padding:"5px 12px", fontSize:11 }}>
                    Open →
                  </Btn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   JOB CARD DETAIL — Governance Engine
══════════════════════════════════════════════════════════ */
const JobDetail = ({ job, onBack }) => {
  const [j, setJ] = useState({...job});
  const [pdi, setPdi] = useState(PDI_ITEMS.reduce((a,i)=>({...a,[i.id]:job.pdi===100?"PASS":null}),{}));
  const [advLoading, setAdvLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const stateIdx = JOB_STATES.indexOf(j.status);
  const pdiPassed = PDI_ITEMS.filter(i=>pdi[i.id]==="PASS").length;
  const pdiFailed = PDI_ITEMS.filter(i=>pdi[i.id]==="FAIL").length;
  const pdiPct = Math.round((pdiPassed/PDI_ITEMS.length)*100);
  const hasFail = pdiFailed > 0;

  const showToast = (msg, col=C.green) => {
    setToast({ msg, col });
    setTimeout(()=>setToast(null), 2500);
  };

  const advance = async () => {
    setAdvLoading(true);
    const next = JOB_STATES[stateIdx+1];
    const res = await MockJobService.advance(j.id, next);
    if (res.ok) { setJ(prev=>({...prev,status:next})); showToast(`Status advanced to ${next}`); }
    setAdvLoading(false);
  };

  const approve = async () => {
    await MockJobService.approve(j.id);
    setJ(prev=>({...prev,approved:true}));
    showToast("Customer approval recorded ✓");
  };

  const nextLabel = { OPEN:"→ Start Diagnosis", DIAGNOSIS:"→ Submit Estimate", ESTIMATE:"→ Request Approval",
    APPROVAL:"→ Start Repair", REPAIR:"→ Mark Ready (PDI)", READY:"→ Generate Invoice", INVOICED:null }[j.status];

  const blocked_repair = j.status==="APPROVAL" && !j.approved;
  const blocked_pdi    = j.status==="REPAIR" && (pdiPct<100 || hasFail);

  const pdiCategories = [...new Set(PDI_ITEMS.map(i=>i.category))];

  return (
    <div style={{ padding:28, position:"relative" }}>
      {/* Toast */}
      {toast && (
        <div style={{ position:"fixed", top:24, right:24, background:C.card,
          border:`1px solid ${toast.col}`, borderRadius:8, padding:"12px 20px",
          fontSize:13, color:toast.col, zIndex:999, boxShadow:"0 8px 24px rgba(0,0,0,0.4)" }}>
          {toast.msg}
        </div>
      )}

      <button onClick={onBack} style={{ background:"none", border:"none", color:C.textSub,
        cursor:"pointer", fontSize:12, marginBottom:16, display:"flex", alignItems:"center", gap:6 }}>
        ← Back to Job Cards
      </button>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:4 }}>
            <span style={{ fontFamily:"monospace", fontSize:20, fontWeight:800, color:C.orange }}>{j.id}</span>
            <StatusBadge status={j.status} />
            {j.approved && <Pill color={C.green}>APPROVED</Pill>}
          </div>
          <div style={{ fontSize:14, color:C.text, fontWeight:600 }}>{j.make} — {j.vehicle}</div>
          <div style={{ fontSize:12, color:C.textSub, marginTop:2 }}>
            Customer: {j.customer} · Assigned: {j.tech} · Complaint: {j.complaint}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8 }}>
          {blocked_repair && (
            <div style={{ background:`${C.yellow}12`, border:`1px solid ${C.yellow}30`,
              borderRadius:6, padding:"6px 12px", fontSize:11, color:C.yellow }}>
              ⚠ Awaiting customer approval before repair
            </div>
          )}
          {blocked_pdi && (
            <div style={{ background:`${C.yellow}12`, border:`1px solid ${C.yellow}30`,
              borderRadius:6, padding:"6px 12px", fontSize:11, color:C.yellow }}>
              ⚠ PDI must be 100% PASS before marking ready
              {hasFail && " — FAIL items present!"}
            </div>
          )}
          <div style={{ display:"flex", gap:8 }}>
            {j.status==="APPROVAL" && !j.approved && (
              <Btn variant="success" onClick={approve}>✓ Simulate Customer Approval</Btn>
            )}
            {nextLabel && (
              <Btn variant="primary" loading={advLoading}
                disabled={blocked_repair || blocked_pdi}
                onClick={advance}>{nextLabel}</Btn>
            )}
          </div>
        </div>
      </div>

      {/* Stepper */}
      <Card style={{ marginBottom:20, padding:"14px 20px" }}>
        <div style={{ display:"flex", alignItems:"center" }}>
          {JOB_STATES.map((s,i) => {
            const done = i < stateIdx;
            const active = i === stateIdx;
            return (
              <div key={s} style={{ display:"flex", alignItems:"center", flex:i<JOB_STATES.length-1?1:"auto" }}>
                <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ width:26, height:26, borderRadius:99, display:"flex",
                    alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700,
                    background: done?C.orange : active?C.orangeGlow : C.border,
                    border: active?`2px solid ${C.orange}`:"2px solid transparent",
                    color: done?"#000" : active?C.orange : C.textDim, transition:"all 0.3s" }}>
                    {done?"✓":i+1}
                  </div>
                  <span style={{ fontSize:8, color:active?C.orange:C.textDim,
                    letterSpacing:"0.06em", whiteSpace:"nowrap" }}>{s}</span>
                </div>
                {i<JOB_STATES.length-1 && (
                  <div style={{ flex:1, height:2, background:done?C.orange:C.border,
                    margin:"0 3px", marginBottom:14, transition:"background 0.3s" }} />
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
        {/* PDI Checklist */}
        <Card>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
            <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em" }}>PDI CHECKLIST</div>
            <div style={{ display:"flex", gap:8, alignItems:"center" }}>
              {hasFail && <Pill color={C.red}>⚠ {pdiFailed} FAIL</Pill>}
              <span style={{ fontSize:12, fontWeight:700,
                color:pdiPct===100&&!hasFail?C.green:hasFail?C.red:C.yellow }}>{pdiPct}% PASS</span>
            </div>
          </div>
          <ProgressBar value={pdiPct} max={100} color={pdiPct===100&&!hasFail?C.green:hasFail?C.red:C.yellow} height={5} />
          <div style={{ marginTop:12, maxHeight:360, overflowY:"auto", display:"flex", flexDirection:"column", gap:16 }}>
            {pdiCategories.map(cat => (
              <div key={cat}>
                <div style={{ fontSize:9, color:C.textDim, letterSpacing:"0.12em", marginBottom:6 }}>{cat.toUpperCase()}</div>
                {PDI_ITEMS.filter(i=>i.category===cat).map(item => (
                  <div key={item.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"6px 0", borderBottom:`1px solid ${C.border}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <div style={{ width:6, height:6, borderRadius:99, flexShrink:0,
                        background: pdi[item.id]==="PASS"?C.green:pdi[item.id]==="FAIL"?C.red:C.textDimmer }} />
                      <span style={{ fontSize:11, color:C.text }}>{item.label}</span>
                    </div>
                    <div style={{ display:"flex", gap:4 }}>
                      {["PASS","FAIL"].map(v => (
                        <button key={v} onClick={()=>setPdi(p=>({...p,[item.id]:v}))} style={{
                          padding:"3px 10px", fontSize:9, fontWeight:700, border:"none",
                          borderRadius:3, cursor:"pointer", letterSpacing:"0.06em",
                          background: pdi[item.id]===v?(v==="PASS"?`${C.green}30`:`${C.red}30`):C.border,
                          color: pdi[item.id]===v?(v==="PASS"?C.green:C.red):C.textDim,
                        }}>{v}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Right Panel */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Estimate */}
          <Card>
            <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:10 }}>ESTIMATE SUMMARY</div>
            {j.amount > 0 ? (
              <>
                <div style={{ fontSize:26, fontWeight:800, color:C.orange }}>₹{j.amount.toLocaleString()}</div>
                <div style={{ fontSize:11, color:C.textSub, marginTop:2 }}>Total estimate incl. GST</div>
                <div style={{ marginTop:10, padding:"8px 12px", background:C.surface, borderRadius:6,
                  border:`1px solid ${j.approved?C.green:C.yellow}30` }}>
                  {j.approved
                    ? <span style={{ fontSize:11, color:C.green }}>✓ Customer approved — repair can proceed</span>
                    : <span style={{ fontSize:11, color:C.yellow }}>⏳ Awaiting customer approval</span>}
                </div>
              </>
            ) : (
              <div style={{ fontSize:12, color:C.textDim, padding:"10px 0" }}>
                No estimate generated. Advance to ESTIMATE stage to build one.
              </div>
            )}
          </Card>

          {/* Governance Gates */}
          <Card>
            <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:10 }}>GOVERNANCE GATES</div>
            {[
              ["Gate 1 — Customer Approval", j.approved, "Required before REPAIR can begin"],
              ["Gate 2 — PDI 100% PASS", pdiPct===100&&!hasFail, `${pdiPassed}/${PDI_ITEMS.length} passed, ${pdiFailed} failed`],
              ["Gate 3 — Invoice Ready", ["READY","INVOICED"].includes(j.status), "Final cost confirmed & job complete"],
            ].map(([label,passed,desc])=>(
              <div key={label} style={{ display:"flex", gap:10, padding:"8px 0", borderBottom:`1px solid ${C.border}` }}>
                <span style={{ fontSize:14, color:passed?C.green:C.textDim, flexShrink:0 }}>{passed?"✓":"○"}</span>
                <div>
                  <div style={{ fontSize:12, color:passed?C.text:C.textSub, fontWeight:passed?600:400 }}>{label}</div>
                  <div style={{ fontSize:10, color:C.textDim }}>{desc}</div>
                </div>
              </div>
            ))}
          </Card>

          {/* Dynamic Action Box */}
          <Card style={{ background:`${C.orangeGlow2}`, border:`1px solid ${C.orange}25` }}>
            <div style={{ fontSize:10, color:C.orange, letterSpacing:"0.1em", marginBottom:8 }}>CURRENT STAGE ACTION</div>
            <div style={{ fontSize:13, color:C.text, lineHeight:1.6 }}>
              {j.status==="OPEN" && "Vehicle received. Begin diagnostic inspection to identify faults."}
              {j.status==="DIAGNOSIS" && "Document all findings. Use EKA AI for structured diagnosis, then build an estimate."}
              {j.status==="ESTIMATE" && "Present the estimate to the customer. Get written/digital approval before proceeding."}
              {j.status==="APPROVAL" && (j.approved ? "Customer approved! Proceed to repair." : "Awaiting customer approval. Do NOT start repair without explicit approval.")}
              {j.status==="REPAIR" && "Repair in progress. Complete PDI checklist before marking ready."}
              {j.status==="READY" && "Vehicle ready for delivery. Generate final GST invoice."}
              {j.status==="INVOICED" && "Job complete. Invoice generated and vehicle delivered to customer."}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ESTIMATE BUILDER
══════════════════════════════════════════════════════════ */
const EstimateBuilder = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(CATALOG_ITEMS);
  const [lineItems, setLineItems] = useState([]);
  const [searching, setSearching] = useState(false);

  const doSearch = useCallback(async (q) => {
    setSearching(true);
    const res = await MockCatalogService.search(q);
    setResults(res); setSearching(false);
  }, []);

  useEffect(() => { doSearch(query); }, [query]);

  const addItem = (item) => {
    if (!lineItems.find(l=>l.id===item.id))
      setLineItems(prev=>[...prev,{...item,qty:1}]);
  };
  const removeItem = (id) => setLineItems(prev=>prev.filter(l=>l.id!==id));
  const setQty = (id,qty) => setLineItems(prev=>prev.map(l=>l.id===id?{...l,qty:Math.max(1,qty)}:l));

  const subtotal = lineItems.reduce((s,l)=>s+l.price*l.qty,0);
  const gst      = lineItems.reduce((s,l)=>s+(l.price*l.qty*l.gst/100),0);
  const total    = subtotal + gst;

  return (
    <div style={{ padding:28 }}>
      <div style={{ background:`${C.orange}10`, border:`1px solid ${C.orange}25`, borderRadius:8,
        padding:"10px 16px", marginBottom:20, fontSize:12, color:C.orange }}>
        ⚠ <strong>Deterministic Pricing:</strong> All prices are fetched from the catalog database. Manual price edits are disabled to prevent fraud.
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1.3fr", gap:20 }}>
        {/* Catalog */}
        <div>
          <Card>
            <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:12 }}>PARTS & LABOUR CATALOG</div>
            <Input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or ID..." style={{ marginBottom:12 }} />
            <div style={{ display:"flex", flexDirection:"column", gap:5, maxHeight:500, overflowY:"auto" }}>
              {searching && <div style={{ color:C.textDim, fontSize:12, textAlign:"center", padding:20 }}>Searching...</div>}
              {!searching && results.map(item => (
                <div key={item.id} style={{ display:"flex", justifyContent:"space-between",
                  alignItems:"center", padding:"9px 10px", borderRadius:7,
                  background:C.surface, border:`1px solid ${C.border}`,
                  opacity: lineItems.find(l=>l.id===item.id)?0.5:1 }}>
                  <div>
                    <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:2 }}>
                      <Pill color={item.type==="PART"?C.blue:C.green} style={{ fontSize:8 }}>{item.type}</Pill>
                      <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{item.name}</span>
                    </div>
                    <div style={{ fontSize:9, color:C.textDim }}>
                      {item.hsn?`HSN: ${item.hsn}`:`SAC: ${item.sac}`} · GST {item.gst}%
                    </div>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <span style={{ fontSize:13, fontWeight:700, color:C.orange }}>₹{item.price}</span>
                    <Btn variant="ghost" onClick={()=>addItem(item)}
                      disabled={!!lineItems.find(l=>l.id===item.id)}
                      style={{ padding:"4px 10px", fontSize:10 }}>+ Add</Btn>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Estimate */}
        <div>
          <Card>
            <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:14 }}>ESTIMATE LINE ITEMS</div>
            {lineItems.length===0 ? (
              <div style={{ textAlign:"center", padding:"40px 0", color:C.textDim, fontSize:13 }}>
                Search and add items from the catalog
              </div>
            ) : (
              <>
                <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:14 }}>
                  <thead>
                    <tr>
                      {["DESCRIPTION","QTY","RATE","GST","TOTAL",""].map(h=>(
                        <th key={h} style={{ textAlign:"left", fontSize:9, color:C.textDim,
                          letterSpacing:"0.1em", padding:"4px 6px", borderBottom:`1px solid ${C.border}` }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map(l => {
                      const gstAmt = l.price*l.qty*l.gst/100;
                      const lineTotal = l.price*l.qty + gstAmt;
                      return (
                        <tr key={l.id} style={{ borderBottom:`1px solid ${C.border}` }}>
                          <td style={{ padding:"8px 6px" }}>
                            <div style={{ fontSize:11, fontWeight:600, color:C.text }}>{l.name}</div>
                            <div style={{ fontSize:9, color:C.textDim }}>{l.hsn?`HSN ${l.hsn}`:`SAC ${l.sac}`}</div>
                          </td>
                          <td style={{ padding:"8px 6px" }}>
                            <input type="number" min="1" value={l.qty}
                              onChange={e=>setQty(l.id,parseInt(e.target.value)||1)}
                              style={{ width:44, background:C.surface, border:`1px solid ${C.border}`,
                                borderRadius:4, padding:"3px 6px", color:C.text, fontSize:11, textAlign:"center" }} />
                          </td>
                          <td style={{ padding:"8px 6px", fontSize:11, color:C.text }}>₹{l.price}</td>
                          <td style={{ padding:"8px 6px", fontSize:11, color:C.textSub }}>₹{gstAmt.toFixed(0)}</td>
                          <td style={{ padding:"8px 6px", fontSize:12, fontWeight:700, color:C.orange }}>₹{lineTotal.toFixed(0)}</td>
                          <td style={{ padding:"8px 6px" }}>
                            <button onClick={()=>removeItem(l.id)}
                              style={{ background:"none", border:"none", color:C.red, cursor:"pointer", fontSize:14 }}>✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
                  {[["Subtotal (excl. GST)", `₹${subtotal.toFixed(0)}`],
                    ["Total GST", `₹${gst.toFixed(0)}`]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between",
                      padding:"4px 0", fontSize:12, color:C.textSub }}>
                      <span>{l}</span><span>{v}</span>
                    </div>
                  ))}
                  <div style={{ display:"flex", justifyContent:"space-between",
                    padding:"10px 0 0", borderTop:`1px solid ${C.border}`, marginTop:6 }}>
                    <span style={{ fontSize:15, fontWeight:700, color:C.text }}>TOTAL</span>
                    <span style={{ fontSize:18, fontWeight:800, color:C.orange }}>₹{total.toFixed(0)}</span>
                  </div>
                </div>

                <div style={{ display:"flex", gap:8, marginTop:14 }}>
                  <Btn variant="ghost" style={{ flex:1 }}>Save Draft</Btn>
                  <Btn variant="primary" style={{ flex:1 }}>Attach to Job Card</Btn>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   AI CHAT
══════════════════════════════════════════════════════════ */
const AIChat = () => {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState("2019 Maruti Swift stalling at warm idle, no AC");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setInput("");
    setMsgs(prev=>[...prev,{role:"user",text}]);
    setLoading(true);
    const res = await MockAIService.diagnose(text);
    setMsgs(prev=>[...prev,{role:"assistant",structured:res}]);
    setLoading(false);
    setTimeout(()=>endRef.current?.scrollIntoView({behavior:"smooth"}),100);
  };

  const ConfidenceBar = ({ score }) => (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{ flex:1, background:C.border, borderRadius:99, height:6 }}>
        <div style={{ width:`${score}%`, height:"100%", borderRadius:99,
          background:score>80?C.green:score>60?C.yellow:C.red, transition:"width 0.5s" }} />
      </div>
      <span style={{ fontSize:12, fontWeight:700, color:score>80?C.green:score>60?C.yellow:C.red,
        minWidth:40 }}>{score}%</span>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"calc(100vh - 58px)" }}>
      <div style={{ flex:1, overflowY:"auto", padding:28, display:"flex", flexDirection:"column", gap:14 }}>
        {msgs.length===0 && (
          <div style={{ textAlign:"center", padding:"60px 0", color:C.textDim }}>
            <div style={{ fontSize:40, marginBottom:12 }}>⚡</div>
            <div style={{ fontSize:16, fontWeight:700, color:C.textSub }}>EKA Constitutional AI</div>
            <div style={{ fontSize:13, marginTop:6 }}>Describe vehicle symptoms to get a structured diagnostic report.</div>
            <div style={{ fontSize:11, marginTop:8, color:C.orange }}>All pricing via catalog only — no hallucinations.</div>
          </div>
        )}

        {msgs.map((m,i) => (
          <div key={i} style={{ display:"flex", justifyContent:m.role==="user"?"flex-end":"flex-start" }}>
            {m.role==="user" ? (
              <div style={{ background:C.orangeGlow, border:`1px solid ${C.orange}30`,
                borderRadius:"12px 12px 0 12px", padding:"10px 16px",
                maxWidth:"55%", fontSize:13, color:C.text }}>{m.text}</div>
            ) : (
              <Card style={{ maxWidth:700, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:16 }}>⚡</span>
                    <span style={{ fontSize:11, fontWeight:700, color:C.orange, letterSpacing:"0.08em" }}>EKA AI DIAGNOSIS REPORT</span>
                  </div>
                  <div style={{ display:"flex", gap:8 }}>
                    <Pill color={m.structured.urgency==="medium"?C.yellow:C.red}>
                      {m.structured.urgency?.toUpperCase()} URGENCY
                    </Pill>
                    <Pill color={C.blue}>{m.structured.estimated_repair_time}</Pill>
                  </div>
                </div>

                {/* Safety Advisory */}
                <div style={{ background:`${m.structured.safety_advisory.level==="warning"?C.yellow:C.red}10`,
                  border:`1px solid ${m.structured.safety_advisory.level==="warning"?C.yellow:C.red}30`,
                  borderRadius:6, padding:"8px 12px", marginBottom:12, display:"flex", gap:8 }}>
                  <span style={{ fontSize:14 }}>{m.structured.safety_advisory.level==="warning"?"⚠":"🛑"}</span>
                  <span style={{ fontSize:11, color:m.structured.safety_advisory.level==="warning"?C.yellow:C.red }}>
                    {m.structured.safety_advisory.message}
                  </span>
                </div>

                {/* Issue Summary */}
                <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.08em", marginBottom:4 }}>ISSUE SUMMARY</div>
                <div style={{ fontSize:13, color:C.text, padding:"8px 12px", background:C.surface,
                  borderRadius:6, borderLeft:`3px solid ${C.orange}`, marginBottom:14, lineHeight:1.5 }}>
                  {m.structured.issue_summary}
                </div>

                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
                  <div>
                    <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.08em", marginBottom:6 }}>PROBABLE CAUSES</div>
                    {m.structured.probable_causes.map((c,j)=>(
                      <div key={j} style={{ display:"flex", gap:8, padding:"4px 0", fontSize:12, color:C.text, lineHeight:1.4 }}>
                        <span style={{ color:C.yellow, flexShrink:0 }}>•</span>{c}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.08em", marginBottom:6 }}>DIAGNOSTIC STEPS</div>
                    {m.structured.diagnostic_steps.map((s,j)=>(
                      <div key={j} style={{ display:"flex", gap:8, padding:"4px 0", fontSize:12, color:C.text, lineHeight:1.4 }}>
                        <span style={{ color:C.orange, flexShrink:0, minWidth:16 }}>{j+1}.</span>{s}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.08em", marginBottom:6 }}>
                  CONFIDENCE SCORE
                </div>
                <ConfidenceBar score={m.structured.confidence_score} />
              </Card>
            )}
          </div>
        ))}
        {loading && (
          <div style={{ display:"flex", gap:8, alignItems:"center", color:C.textSub, fontSize:12 }}>
            <span style={{ animation:"spin 1s linear infinite", display:"inline-block" }}>◌</span>
            EKA AI is analysing symptoms...
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding:"14px 28px", borderTop:`1px solid ${C.border}`, background:C.surface }}>
        <div style={{ display:"flex", gap:10 }}>
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&(e.preventDefault(),send())}
            placeholder="Describe symptoms (e.g., '2019 Maruti Swift stalling at idle after warm-up, engine light on')..."
            rows={2}
            style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:8,
              padding:"10px 14px", color:C.text, fontSize:13, resize:"none",
              outline:"none", fontFamily:"inherit" }} />
          <Btn variant="primary" onClick={send} loading={loading} style={{ padding:"10px 20px", alignSelf:"flex-end" }}>
            Diagnose ↵
          </Btn>
        </div>
        <div style={{ fontSize:10, color:C.textDim, marginTop:6 }}>
          Enter ↵ to send · Shift+Enter for new line · AI output is structured JSON — no free-text pricing
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PDI STANDALONE PAGE
══════════════════════════════════════════════════════════ */
const PDIPage = () => {
  const [checks, setChecks] = useState(PDI_ITEMS.reduce((a,i)=>({...a,[i.id]:null}),{}));
  const [submitted, setSubmitted] = useState(false);
  const passed = PDI_ITEMS.filter(i=>checks[i.id]==="PASS").length;
  const failed = PDI_ITEMS.filter(i=>checks[i.id]==="FAIL").length;
  const complete = passed+failed === PDI_ITEMS.length;
  const pct = Math.round((passed/PDI_ITEMS.length)*100);
  const cats = [...new Set(PDI_ITEMS.map(i=>i.category))];

  return (
    <div style={{ padding:28 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:20 }}>
        <div>
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16 }}>
            <div style={{ fontSize:13, fontWeight:600, color:C.text }}>Overall</div>
            <div style={{ flex:1, maxWidth:300 }}><ProgressBar value={pct} max={100}
              color={failed>0?C.red:pct===100?C.green:C.yellow} height={8} /></div>
            <span style={{ fontSize:13, fontWeight:700,
              color:failed>0?C.red:pct===100?C.green:C.yellow }}>{pct}%</span>
            {failed>0 && <Pill color={C.red}>⚠ {failed} FAIL — CANNOT PROCEED</Pill>}
            {pct===100&&!failed && <Pill color={C.green}>✓ ALL PASSED</Pill>}
          </div>

          {cats.map(cat => (
            <Card key={cat} style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, color:C.textDim, letterSpacing:"0.1em", marginBottom:10 }}>{cat.toUpperCase()}</div>
              {PDI_ITEMS.filter(i=>i.category===cat).map(item => (
                <div key={item.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                  padding:"7px 0", borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:7, height:7, borderRadius:99, flexShrink:0,
                      background:checks[item.id]==="PASS"?C.green:checks[item.id]==="FAIL"?C.red:C.textDimmer }} />
                    <span style={{ fontSize:12, color:C.text }}>{item.label}</span>
                  </div>
                  <div style={{ display:"flex", gap:6 }}>
                    {["PASS","FAIL"].map(v=>(
                      <button key={v} onClick={()=>setChecks(c=>({...c,[item.id]:v}))} style={{
                        padding:"4px 14px", fontSize:10, fontWeight:700, border:"none",
                        borderRadius:4, cursor:"pointer", letterSpacing:"0.06em",
                        background:checks[item.id]===v?(v==="PASS"?`${C.green}30`:`${C.red}30`):C.border,
                        color:checks[item.id]===v?(v==="PASS"?C.green:C.red):C.textDim,
                        transition:"all 0.15s",
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>

        {/* Summary */}
        <div style={{ width:220 }}>
          <Card style={{ position:"sticky", top:80 }}>
            <div style={{ fontSize:10, color:C.textSub, letterSpacing:"0.1em", marginBottom:12 }}>PDI SUMMARY</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
              {[["Passed", passed, C.green], ["Failed", failed, C.red], ["Pending", PDI_ITEMS.length-passed-failed, C.textDim]].map(([l,n,c])=>(
                <div key={l} style={{ display:"flex", justifyContent:"space-between" }}>
                  <span style={{ fontSize:12, color:C.textSub }}>{l}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:c }}>{n}</span>
                </div>
              ))}
            </div>
            <Btn variant={failed>0?"danger":pct===100?"success":"ghost"}
              disabled={!complete} onClick={()=>setSubmitted(true)} full>
              {failed>0 ? "⚠ Cannot Submit" : pct===100 ? "✓ Submit PDI" : `${PDI_ITEMS.length-passed-failed} items remaining`}
            </Btn>
            {submitted && (
              <div style={{ marginTop:10, padding:"8px", background:`${C.green}12`,
                border:`1px solid ${C.green}25`, borderRadius:6, fontSize:11, color:C.green, textAlign:"center" }}>
                ✓ PDI submitted successfully
              </div>
            )}
            <div style={{ marginTop:12, fontSize:10, color:C.textDim, lineHeight:1.5 }}>
              Zero-tolerance policy: Any single FAIL item blocks vehicle delivery.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   PRICING PAGE — 4-Tab Layout
══════════════════════════════════════════════════════════ */
const PricingPage = () => {
  const [tab, setTab] = useState("EKA-Ai");
  const tabs = Object.keys(PRICING);
  const plans = PRICING[tab];

  return (
    <div style={{ padding:28 }}>
      {/* Constitutional Badge */}
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8,
          background:`${C.orange}10`, border:`2px solid ${C.orange}50`,
          borderRadius:99, padding:"8px 20px", marginBottom:16 }}>
          <span style={{ fontSize:14 }}>⚡</span>
          <span style={{ fontSize:11, fontWeight:700, color:C.orange, letterSpacing:"0.08em" }}>
            Constitutional AI · Governed Pricing · No Unlimited Chat
          </span>
        </div>
        <div style={{ fontSize:28, fontWeight:900, color:C.text, marginBottom:8 }}>
          Simple, transparent pricing
        </div>
        <div style={{ fontSize:14, color:C.textSub }}>
          Every plan includes Constitutional AI governance. No hallucinated outputs. No surprise overage.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:28, justifyContent:"center" }}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            padding:"8px 22px", borderRadius:6, fontSize:12, fontWeight:700,
            letterSpacing:"0.05em", cursor:"pointer", border:"none", transition:"all 0.15s",
            background:tab===t?C.orange:C.card, color:tab===t?"#000":C.textSub,
          }}>{t}</button>
        ))}
      </div>

      {/* Plans Grid */}
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${plans.length},1fr)`, gap:16, maxWidth:1000, margin:"0 auto" }}>
        {plans.map(plan => (
          <div key={plan.name} style={{
            background:C.card, borderRadius:12, padding:24,
            border:`2px solid ${plan.highlight?C.orange:C.border}`,
            position:"relative", transition:"all 0.2s",
            boxShadow:plan.highlight?`0 0 32px ${C.orange}20`:"none",
          }}>
            {plan.badge && (
              <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)",
                background:C.orange, color:"#000", fontSize:10, fontWeight:800,
                padding:"3px 14px", borderRadius:99, letterSpacing:"0.08em", whiteSpace:"nowrap" }}>
                {plan.badge}
              </div>
            )}
            <div style={{ fontSize:14, fontWeight:700, color:C.text, marginBottom:4 }}>{plan.name}</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:14 }}>
              {plan.price === null ? (
                <span style={{ fontSize:24, fontWeight:800, color:C.orange }}>Contact Sales</span>
              ) : plan.price === 0 ? (
                <span style={{ fontSize:28, fontWeight:800, color:C.text }}>Free</span>
              ) : (
                <>
                  <span style={{ fontSize:28, fontWeight:800, color:C.orange }}>₹{plan.price.toLocaleString()}</span>
                  <span style={{ fontSize:13, color:C.textSub }}>{plan.period}</span>
                </>
              )}
            </div>

            {/* Quotas */}
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              {plan.jobs && <Pill color={C.blue}>{plan.jobs} Jobs</Pill>}
              {plan.tokens && <Pill color={C.purple}>{plan.tokens} Tokens</Pill>}
            </div>

            {/* Features */}
            <div style={{ display:"flex", flexDirection:"column", gap:6, marginBottom:20 }}>
              {plan.features.map((f,i)=>(
                <div key={i} style={{ display:"flex", gap:8, fontSize:12, color:C.textSub }}>
                  <span style={{ color:C.green, flexShrink:0 }}>✓</span>{f}
                </div>
              ))}
            </div>

            <Btn variant={plan.highlight?"primary":"outline"} full
              style={{ borderRadius:8 }}>
              {plan.price===null?"Talk to Sales":plan.price===0?"Get Started Free":"Subscribe Now"}
            </Btn>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <div style={{ textAlign:"center", marginTop:32, fontSize:12, color:C.textDim }}>
        All plans include 18% GST · 7-day free trial on paid plans · Cancel anytime<br/>
        <span style={{ color:C.orange }}>Constitutional AI</span> ensures no unlimited generation — every token counts toward fair usage.
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   CATALOG VIEW
══════════════════════════════════════════════════════════ */
const CatalogView = () => {
  const [q, setQ] = useState("");
  const [typeF, setTypeF] = useState("ALL");
  const items = CATALOG_ITEMS.filter(c=>
    (typeF==="ALL"||c.type===typeF) &&
    c.name.toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div style={{ padding:28 }}>
      <div style={{ display:"flex", gap:12, marginBottom:20 }}>
        <Input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search catalog..." style={{ flex:1 }} />
        {["ALL","PART","LABOUR"].map(t=>(
          <button key={t} onClick={()=>setTypeF(t)} style={{
            padding:"8px 18px", borderRadius:6, fontSize:11, fontWeight:700,
            border:"none", cursor:"pointer",
            background:typeF===t?C.orange:C.card, color:typeF===t?"#000":C.textSub,
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:12 }}>
        {items.map(item=>(
          <Card key={item.id} hover>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontFamily:"monospace", fontSize:10, color:C.textDim }}>{item.id}</span>
              <Pill color={item.type==="PART"?C.blue:C.green} style={{ fontSize:8 }}>{item.type}</Pill>
            </div>
            <div style={{ fontSize:14, fontWeight:600, color:C.text, marginBottom:4 }}>{item.name}</div>
            <div style={{ fontSize:10, color:C.textDim, marginBottom:12 }}>
              {item.hsn?`HSN: ${item.hsn}`:`SAC: ${item.sac}`} · GST @{item.gst}%
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontSize:20, fontWeight:800, color:C.orange }}>₹{item.price}</div>
                <div style={{ fontSize:10, color:C.textDim }}>+₹{(item.price*item.gst/100).toFixed(0)} GST</div>
              </div>
              <Btn variant="ghost" style={{ fontSize:10, padding:"5px 12px" }}>+ Estimate</Btn>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   APP SHELL
══════════════════════════════════════════════════════════ */
const PAGE_META = {
  dashboard: ["Dashboard", "Workshop overview"],
  jobs:      ["Job Cards", "Active vehicle service records"],
  estimate:  ["Estimate Builder", "Build itemised estimates from catalog (deterministic pricing)"],
  ai:        ["EKA AI Chat", "Constitutional AI diagnostic assistant"],
  catalog:   ["Parts Catalog", "Approved parts & labour — governed pricing"],
  pdi:       ["PDI Checklist", "Zero-tolerance pre-delivery inspection"],
  pricing:   ["Pricing & Plans", "Usage-governed subscription tiers"],
};

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [selectedJob, setSelectedJob] = useState(null);

  if (!user) return <LoginPage onLogin={setUser} />;

  const [title, subtitle] = PAGE_META[page] || ["",""];

  const setPageNav = (p) => { setPage(p); setSelectedJob(null); };

  return (
    <div style={{ background:C.bg, minHeight:"100vh",
      fontFamily:"'DM Sans', system-ui, -apple-system, sans-serif", color:C.text }}>
      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; height:4px; }
        ::-webkit-scrollbar-track { background:${C.surface}; }
        ::-webkit-scrollbar-thumb { background:${C.border}; border-radius:99px; }
        input::placeholder, textarea::placeholder { color:${C.textDim}; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        button:hover { filter:brightness(1.1); }
      `}</style>

      <Sidebar active={page} setActive={setPageNav} user={user} />

      <div style={{ marginLeft:230, minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <Header
          title={selectedJob ? `Job — ${selectedJob.id}` : title}
          subtitle={selectedJob ? `${selectedJob.make} · ${selectedJob.customer}` : subtitle}
          actions={
            page==="jobs" && !selectedJob
              ? <Btn variant="primary" style={{ padding:"6px 14px", fontSize:12 }}>+ New Job Card</Btn>
              : undefined
          }
        />

        <div style={{ flex:1, overflowY:"auto" }}>
          {page==="dashboard" && <Dashboard user={user} />}
          {page==="jobs" && !selectedJob && <JobList onSelect={j=>{setSelectedJob(j)}} />}
          {page==="jobs" && selectedJob && <JobDetail job={selectedJob} onBack={()=>setSelectedJob(null)} />}
          {page==="estimate" && <EstimateBuilder />}
          {page==="ai" && <AIChat />}
          {page==="catalog" && <CatalogView />}
          {page==="pdi" && <PDIPage />}
          {page==="pricing" && <PricingPage />}
        </div>
      </div>
    </div>
  );
}
