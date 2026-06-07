import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LiquidText from "./Temp";

gsap.registerPlugin(ScrollTrigger);

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  @keyframes endingStarPulse {
    0%,100% { opacity: 0.3; transform: scale(1); }
    50%      { opacity: 0.9; transform: scale(1.6); }
  }
  .ending-star { animation: endingStarPulse var(--dur,3s) ease-in-out infinite; animation-delay: var(--delay,0s); }

  @keyframes endingOrbit {
    from { transform: rotate(0deg) translateX(var(--r,60px)) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(var(--r,60px)) rotate(-360deg); }
  }
  .ending-orbit { animation: endingOrbit var(--dur,12s) linear infinite; }

  @keyframes jsGlow {
    0%,100% { text-shadow: 0 0 40px rgba(247,223,30,0.4), 0 0 80px rgba(247,223,30,0.15); }
    50%      { text-shadow: 0 0 80px rgba(247,223,30,0.8), 0 0 160px rgba(247,223,30,0.3), 0 0 240px rgba(247,223,30,0.1); }
  }
  .js-glow { animation: jsGlow 3s ease-in-out infinite; }

  @keyframes scanlineMove {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }
  .ending-scanline {
    position: absolute; left: 0; right: 0; height: 2px;
    background: linear-gradient(to right, transparent, rgba(247,223,30,0.06), transparent);
    animation: scanlineMove 8s linear infinite;
    pointer-events: none;
  }

  @keyframes particleDrift {
    0%   { transform: translate(0,0) scale(1); opacity: 0.6; }
    33%  { transform: translate(var(--dx1),var(--dy1)) scale(1.4); opacity: 1; }
    66%  { transform: translate(var(--dx2),var(--dy2)) scale(0.7); opacity: 0.4; }
    100% { transform: translate(0,0) scale(1); opacity: 0.6; }
  }
  .ending-particle {
    animation: particleDrift var(--dur,6s) ease-in-out infinite;
    animation-delay: var(--delay,0s);
  }

  .ending-link {
    display: block;
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.78rem;
    color: rgba(148,163,184,0.65);
    text-decoration: none;
    letter-spacing: 0.06em;
    padding: 5px 0;
    transition: color 0.25s, letter-spacing 0.25s;
    position: relative;
  }
  .ending-link::after {
    content: '';
    position: absolute;
    bottom: 3px; left: 0;
    width: 0; height: 1px;
    background: #f7df1e;
    transition: width 0.3s ease;
  }
  .ending-link:hover { color: rgba(247,223,30,0.9); letter-spacing: 0.12em; }
  .ending-link:hover::after { width: 100%; }

  .ending-col-title {
    font-family: 'Cinzel', serif;
    font-size: 0.62rem;
    letter-spacing: 0.35em;
    text-transform: uppercase;
    color: rgba(247,223,30,0.5);
    margin-bottom: 18px;
    font-weight: 700;
  }

  .liquid-hint {
    font-family: 'Space Grotesk', sans-serif;
    font-size: 0.6rem;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: rgba(247,223,30,0.22);
    text-align: center;
    margin: -4px 0 32px;
    pointer-events: none;
    user-select: none;
  }
`;

function NebulaCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    const stars = Array.from({ length: 300 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.8 + 0.2,
      a: Math.random() * 0.6 + 0.1,
      da: (Math.random() - 0.5) * 0.003,
      color: Math.random() > 0.85 ? "rgba(247,223,30," : Math.random() > 0.6 ? "rgba(103,232,249," : "rgba(148,163,184,",
    }));
    function draw() {
      const w = canvas.width  = canvas.offsetWidth;
      const h = canvas.height = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);
      const g1 = ctx.createRadialGradient(w*0.3,h*0.4,0,w*0.3,h*0.4,w*0.55);
      g1.addColorStop(0,"rgba(20,10,50,0.7)"); g1.addColorStop(1,"rgba(2,3,9,0)");
      ctx.fillStyle=g1; ctx.fillRect(0,0,w,h);
      const g2 = ctx.createRadialGradient(w*0.75,h*0.6,0,w*0.75,h*0.6,w*0.4);
      g2.addColorStop(0,"rgba(50,15,5,0.5)"); g2.addColorStop(1,"rgba(2,3,9,0)");
      ctx.fillStyle=g2; ctx.fillRect(0,0,w,h);
      const g3 = ctx.createRadialGradient(w*0.5,h*0.2,0,w*0.5,h*0.2,w*0.35);
      g3.addColorStop(0,"rgba(247,223,30,0.04)"); g3.addColorStop(1,"rgba(2,3,9,0)");
      ctx.fillStyle=g3; ctx.fillRect(0,0,w,h);
      stars.forEach((s) => {
        s.a = Math.max(0.05, Math.min(0.75, s.a + s.da));
        if (Math.random() < 0.002) s.da *= -1;
        ctx.beginPath();
        ctx.arc(s.x*w, s.y*h, s.r, 0, Math.PI*2);
        ctx.fillStyle = s.color + s.a.toFixed(2) + ")";
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />
  );
}

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: Math.random() * 100 + "%",
  top:  Math.random() * 100 + "%",
  size: Math.random() * 2.5 + 0.5,
  color: Math.random() > 0.8 ? "rgba(247,223,30,0.8)" : "rgba(103,232,249,0.6)",
  dx1: (Math.random()-0.5)*40 + "px", dy1: (Math.random()-0.5)*30 + "px",
  dx2: (Math.random()-0.5)*25 + "px", dy2: (Math.random()-0.5)*20 + "px",
  dur: Math.random()*7+5 + "s",
  delay: Math.random()*-10 + "s",
}));

const COLS = [
  { title:"Learn", links:[
    { label:"Lecture 01 — Origin Story", href:"#" },
    { label:"Lecture 02 — Data Types",   href:"#" },
    { label:"Lecture 03 — Operators",    href:"#" },
    { label:"Lecture 04 — Loops & Math", href:"#" },
  ]},
  { title:"Play", links:[
    { label:"Memory Playground",   href:"#" },
    { label:"Primitive Arena",     href:"#" },
    { label:"Floating Point Boss", href:"#" },
    { label:"String Kitchen",      href:"#" },
  ]},
  { title:"Connect", links:[
    { label:"GitHub",      href:"https://github.com/Sbcodes2101" },
    { label:"Twitter / X", href:"https://x.com/BahugunaSa85631" },
    { label:"Discord",     href:"https://discord.com/users/SARTHAK#5300" },
    { label:"Feedback",    href:"#" },
  ]},
];

export default function Ending() {
  const rootRef    = useRef(null);
  const heroRef    = useRef(null);
  const colsRef    = useRef(null);
  const bottomRef  = useRef(null);
  const logoRef    = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(logoRef.current, {
        scale:0.7, opacity:0, filter:"blur(20px)",
        duration:1.6, ease:"expo.out",
        scrollTrigger:{ trigger:rootRef.current, start:"top 80%" },
      });
      // hero block (liquid canvas) fades up as a unit
      gsap.from(heroRef.current, {
        y:60, opacity:0, filter:"blur(16px)",
        duration:1.4, ease:"power3.out",
        scrollTrigger:{ trigger:rootRef.current, start:"top 80%" },
      });
      gsap.from(".ending-col", {
        y:50, opacity:0, duration:1, ease:"power3.out", stagger:0.15,
        scrollTrigger:{ trigger:colsRef.current, start:"top 85%" },
      });
      gsap.from(bottomRef.current, {
        y:24, opacity:0, duration:0.9, ease:"power3.out", delay:0.4,
        scrollTrigger:{ trigger:colsRef.current, start:"top 85%" },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      style={{ position:"relative", background:"transparent", overflow:"hidden", paddingTop:"120px" }}
    >
      <NebulaCanvas />
      <div className="ending-scanline" />

      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:2 }}>
        {PARTICLES.map((p) => (
          <span key={p.id} className="ending-particle" style={{
            position:"absolute", left:p.left, top:p.top,
            width:p.size, height:p.size, borderRadius:"50%",
            background:p.color, boxShadow:"0 0 6px "+p.color,
            "--dx1":p.dx1,"--dy1":p.dy1,"--dx2":p.dx2,"--dy2":p.dy2,
            "--dur":p.dur,"--delay":p.delay,
          }} />
        ))}
      </div>

      <div style={{
        position:"absolute", top:0, left:0, right:0, height:"220px",
        pointerEvents:"none", zIndex:3,
        background:"linear-gradient(to bottom, #020309 0%, transparent 100%)",
      }} />

      <div style={{ position:"relative", zIndex:4, maxWidth:"1100px", margin:"0 auto", padding:"0 32px 80px" }}>

        {/* ── Hero ── */}
        <div style={{ textAlign:"center", marginBottom:"100px" }}>

          {/* Orbiting JS logo — unchanged from original */}
          <div ref={logoRef} style={{
            position:"relative", width:"140px", height:"140px",
            margin:"0 auto 40px",
            display:"flex", alignItems:"center", justifyContent:"center",
          }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"1px solid rgba(247,223,30,0.15)" }} />
            <div className="ending-orbit" style={{
              position:"absolute", left:"50%", top:"50%",
              width:"8px", height:"8px", marginLeft:"-4px", marginTop:"-4px",
              "--r":"66px","--dur":"8s",
            }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#f7df1e", boxShadow:"0 0 16px rgba(247,223,30,0.9)" }} />
            </div>
            <div style={{ position:"absolute", inset:"20px", borderRadius:"50%", border:"1px solid rgba(247,223,30,0.08)" }} />
            <div style={{
              width:"72px", height:"72px", borderRadius:"16px", background:"#f7df1e",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 0 60px rgba(247,223,30,0.4), 0 0 120px rgba(247,223,30,0.15)",
              position:"relative", zIndex:2,
            }}>
              <span style={{ fontFamily:"'Space Grotesk', sans-serif", fontWeight:900, fontSize:"1.4rem", color:"#020309", letterSpacing:"-0.02em" }}>JS</span>
            </div>
          </div>

          {/* ── LiquidText replaces h2 + p, mirrors original typography exactly ── */}
          <div ref={heroRef} style={{ margin:"0 -16px" }}>
            <LiquidText height={480} />
          </div>
          <p className="liquid-hint">move cursor over text</p>

          {/* CTA buttons — unchanged */}
          <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide" target="_blank" rel="noopener noreferrer" style={{
              fontFamily:"'Space Grotesk', sans-serif", fontSize:"0.75rem", fontWeight:600,
              letterSpacing:"0.25em", textTransform:"uppercase",
              color:"#020309", background:"#f7df1e", border:"none",
              padding:"14px 32px", borderRadius:"4px", cursor:"pointer",
              textDecoration:"none", boxShadow:"0 0 40px rgba(247,223,30,0.25)",
              transition:"box-shadow 0.3s, transform 0.2s", display:"inline-block",
            }}
            onMouseEnter={(e)=>{ e.target.style.boxShadow="0 0 80px rgba(247,223,30,0.5)"; e.target.style.transform="translateY(-2px)"; }}
            onMouseLeave={(e)=>{ e.target.style.boxShadow="0 0 40px rgba(247,223,30,0.25)"; e.target.style.transform="translateY(0)"; }}
             target="_blank" rel="noopener noreferrer">Start Learning</a>
            <a href="#" style={{
              fontFamily:"'Space Grotesk', sans-serif", fontSize:"0.75rem", fontWeight:600,
              letterSpacing:"0.25em", textTransform:"uppercase",
              color:"rgba(148,163,184,0.8)", background:"transparent",
              border:"1px solid rgba(148,163,184,0.2)",
              padding:"14px 32px", borderRadius:"4px", cursor:"pointer",
              textDecoration:"none", transition:"border-color 0.3s, color 0.3s", display:"inline-block",
            }}
            onMouseEnter={(e)=>{ e.target.style.borderColor="rgba(247,223,30,0.4)"; e.target.style.color="rgba(247,223,30,0.9)"; }}
            onMouseLeave={(e)=>{ e.target.style.borderColor="rgba(148,163,184,0.2)"; e.target.style.color="rgba(148,163,184,0.8)"; }}
            >Play Games</a>
          </div>
        </div>

        {/* ── Divider ── */}
        <div style={{
          height:"1px",
          background:"linear-gradient(to right, transparent, rgba(247,223,30,0.15), rgba(100,116,139,0.15), transparent)",
          marginBottom:"64px",
        }} />

        {/* ── Link columns ── */}
        <div ref={colsRef} style={{
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))",
          gap:"48px", marginBottom:"64px",
        }}>
          {COLS.map((col) => (
            <div key={col.title} className="ending-col">
              <div className="ending-col-title">{col.title}</div>
              {col.links.map((link) => (
                <a key={link.label} href={link.href} className="ending-link" target="_blank" rel="noopener noreferrer">{link.label}</a>
              ))}
            </div>
          ))}
          <div className="ending-col">
            <div className="ending-col-title">By the numbers</div>
            {[
              { num:"10",    label:"Days to build JS" },
              { num:"30+",   label:"Years in production" },
              { num:"98.7%", label:"Of websites use it" },
              { num:"7",     label:"Primitive types" },
            ].map((stat) => (
              <div key={stat.label} style={{ marginBottom:"14px" }}>
                <div style={{ fontFamily:"'Cinzel', serif", fontSize:"1.2rem", fontWeight:700, color:"#f7df1e", lineHeight:1, marginBottom:"2px" }}>{stat.num}</div>
                <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:"0.7rem", color:"rgba(100,116,139,0.6)", letterSpacing:"0.06em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div ref={bottomRef} style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          flexWrap:"wrap", gap:"16px", paddingTop:"24px",
          borderTop:"1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ fontFamily:"'Space Grotesk', sans-serif", fontSize:"0.68rem", color:"rgba(100,116,139,0.5)", letterSpacing:"0.12em" }}>
            © 2025 JSOrigins · Built for Hackathon
          </div>
          <div style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:"0.65rem", color:"rgba(247,223,30,0.35)", letterSpacing:"0.08em" }}>
            console.log("The web was dead. Now it's not.")
          </div>
          <div style={{ display:"flex", gap:"20px" }}>
            {["Terms","Privacy","GitHub"].map((item) => (
              <a key={item} href="#" style={{
                fontFamily:"'Space Grotesk', sans-serif", fontSize:"0.65rem",
                color:"rgba(100,116,139,0.4)", textDecoration:"none",
                letterSpacing:"0.1em", transition:"color 0.2s",
              }}
              onMouseEnter={(e)=>e.target.style.color="rgba(247,223,30,0.7)"}
              onMouseLeave={(e)=>e.target.style.color="rgba(100,116,139,0.4)"}
              >{item}</a>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:"120px",
        pointerEvents:"none", zIndex:5,
        background:"linear-gradient(to bottom, transparent, #000)",
      }} />
    </section>
  );
}