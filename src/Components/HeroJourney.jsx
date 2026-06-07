import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

gsap.registerPlugin(ScrollTrigger);

// ─── STYLE INJECTION ────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Space+Grotesk:wght@300;400;500;700&family=JetBrains+Mono:wght@400;500&display=swap');

  /* Scanlines */
  .scanlines::after {
    content: '';
    position: absolute;
    inset: 0;
    background: repeating-linear-gradient(
      to bottom,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.04) 2px,
      rgba(0,0,0,0.04) 4px
    );
    pointer-events: none;
    z-index: 100;
  }

  /* Vignette pulse */
  @keyframes vignettePulse {
    0%, 100% { opacity: 0.55; }
    50%       { opacity: 0.85; }
  }
  .vignette-pulse {
    animation: vignettePulse 4s ease-in-out infinite;
  }

  /* Dust float - infinite CSS loops, no GSAP */
  @keyframes dustDrift {
    0%   { transform: translate(0px, 0px) scale(1); opacity: 0.18; }
    33%  { transform: translate(var(--dx1), var(--dy1)) scale(1.3); opacity: 0.46; }
    66%  { transform: translate(var(--dx2), var(--dy2)) scale(0.8); opacity: 0.28; }
    100% { transform: translate(0px, 0px) scale(1); opacity: 0.18; }
  }
  .dust-particle {
    animation: dustDrift var(--dur) ease-in-out infinite;
    animation-delay: var(--delay);
  }

  /* Glitch keyframe for dead UI elements */
  @keyframes glitchUI {
    0%   { transform: translateX(0); clip-path: inset(0 0 0 0); filter: none; }
    10%  { transform: translateX(-4px); clip-path: inset(10% 0 60% 0); filter: hue-rotate(90deg) brightness(1.4); }
    20%  { transform: translateX(4px); clip-path: inset(50% 0 20% 0); filter: hue-rotate(-90deg); }
    30%  { transform: translateX(0); clip-path: inset(0 0 0 0); filter: none; }
    100% { transform: translateX(0); clip-path: inset(0 0 0 0); filter: none; }
  }
  .glitch-active {
    animation: glitchUI 0.35s steps(2) forwards;
  }

  /* Red shake for rejected interaction */
  @keyframes rejectShake {
    0%   { transform: translateX(0) rotate(0deg); }
    15%  { transform: translateX(-6px) rotate(-1deg); }
    30%  { transform: translateX(6px) rotate(1deg); }
    45%  { transform: translateX(-4px) rotate(-0.5deg); }
    60%  { transform: translateX(4px) rotate(0.5deg); }
    80%  { transform: translateX(-2px); }
    100% { transform: translateX(0) rotate(0deg); }
  }
  .rejecting {
    animation: rejectShake 0.45s cubic-bezier(0.36,0.07,0.19,0.97) forwards;
    outline: 1px solid rgba(220,38,38,0.7);
    outline-offset: 4px;
  }

  /* 1993 text crack effect */
  @keyframes crackFlicker {
    0%, 94%, 100% { opacity: 1; text-shadow: 0 0 120px rgba(148,163,184,0.08); }
    95% { opacity: 0.7; text-shadow: 0 0 120px rgba(148,163,184,0.5), 2px 0 0 rgba(220,38,38,0.3); }
    97% { opacity: 0.9; }
  }
  .cracked-text {
    animation: crackFlicker 6s ease-in-out infinite;
  }

  /* Cursor blink */
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .cursor-blink {
    animation: blink 0.75s step-end infinite;
  }

  /* DEAD text shake */
  @keyframes deadShake {
    0%, 100% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
    10% { transform: translate(calc(-50% - 8px), -50%) rotate(-1.5deg) scale(1.02); }
    20% { transform: translate(calc(-50% + 8px), -50%) rotate(1.5deg) scale(0.99); }
    30% { transform: translate(calc(-50% - 5px), -50%) rotate(-1deg) scale(1.01); }
    40% { transform: translate(calc(-50% + 5px), -50%) rotate(0.5deg) scale(1); }
    50% { transform: translate(-50%, -50%) rotate(0deg) scale(1); }
  }
  .dead-shake {
    animation: deadShake 0.6s cubic-bezier(0.36,0.07,0.19,0.97);
  }

  /* Z-depth perspective layers */
  .perspective-scene {
    perspective: 900px;
    perspective-origin: 50% 45%;
  }
  .depth-layer {
    transform-style: preserve-3d;
  }

  /* Subtle noise texture overlay */
  .noise-overlay::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
    background-size: 256px 256px;
    pointer-events: none;
    z-index: 5;
    opacity: 0.5;
  }

  /* Scroll hint arrow */
  @keyframes bounceDown {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(8px); opacity: 0.8; }
  }
  .scroll-hint { animation: bounceDown 1.8s ease-in-out infinite; }

  /* Terminal cursor */
  @keyframes termBlink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  .term-cursor { animation: termBlink 1s step-end infinite; }

  /* Scene 2 type-in animation handled via JS */
  .code-line { white-space: pre; }

  /* Particle JS text shape */
  @keyframes particleOrbit {
    0%   { transform: rotate(0deg) translateX(var(--radius)) rotate(0deg); }
    100% { transform: rotate(360deg) translateX(var(--radius)) rotate(-360deg); }
  }
`;

// ─── SCENE 1 ─────────────────────────────────────────────────────────────────

const STORY_BEATS = [
  { text: "The internet existed.", sub: "Pages loaded across phone lines." },
  { text: "You could read.", sub: "You could not interact." },
  { text: "Forms submitted blindly.", sub: "You waited. The server decided." },
  { text: "Something had to break.", sub: "Something was about to." },
];

const DEAD_UI = [
  {
    label: "Button",
    pos: "left-[7%] top-[28%]",
    depthZ: 60,
    element: ({ shake, tooltip }) => (
      <div className="relative group">
        <button
          className={`px-7 py-3.5 rounded-sm border border-slate-500/30 bg-slate-900/60 text-slate-400/70 font-['Space_Grotesk',sans-serif] text-sm tracking-[0.18em] uppercase backdrop-blur-sm shadow-[0_0_30px_rgba(100,116,139,0.1)] ${shake ? "rejecting" : ""}`}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Submit
        </button>
        {tooltip && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-red-950/90 text-red-300 px-2 py-1 rounded whitespace-nowrap border border-red-700/40 z-50">
            No JavaScript. Cannot react.
          </div>
        )}
      </div>
    ),
  },
  {
    label: "Input",
    pos: "right-[6%] top-[26%]",
    depthZ: 30,
    element: ({ shake, tooltip }) => (
      <div className="relative group">
        <div
          className={`w-60 px-4 py-3.5 rounded-sm border border-slate-500/25 bg-slate-950/50 text-slate-500/50 font-mono text-sm backdrop-blur-sm shadow-[0_0_25px_rgba(100,116,139,0.08)] ${shake ? "rejecting" : ""}`}
        >
          <span className="opacity-40">user@1993:~$</span>
          <span className="ml-1 opacity-20">_</span>
        </div>
        {tooltip && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-red-950/90 text-red-300 px-2 py-1 rounded whitespace-nowrap border border-red-700/40 z-50">
            No JavaScript. Cannot react.
          </div>
        )}
      </div>
    ),
  },
  {
    label: "Image",
    pos: "left-[9%] bottom-[24%]",
    depthZ: 80,
    element: ({ shake, tooltip }) => (
      <div className="relative group">
        <div
          className={`w-44 h-32 rounded-sm border border-slate-600/20 bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center gap-2 shadow-[0_0_30px_rgba(100,116,139,0.06)] ${shake ? "rejecting" : ""}`}
        >
          <svg width="32" height="28" viewBox="0 0 32 28" fill="none" className="opacity-20">
            <rect x="1" y="1" width="30" height="26" rx="2" stroke="#94a3b8" strokeWidth="1.5"/>
            <circle cx="10" cy="10" r="3" stroke="#94a3b8" strokeWidth="1.2"/>
            <path d="M1 20 L9 13 L16 19 L22 14 L31 20" stroke="#94a3b8" strokeWidth="1.2" fill="none"/>
          </svg>
          <span className="text-[10px] text-slate-600/60 font-mono tracking-wider">broken.gif</span>
        </div>
        {tooltip && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-red-950/90 text-red-300 px-2 py-1 rounded whitespace-nowrap border border-red-700/40 z-50">
            No JavaScript. Cannot react.
          </div>
        )}
      </div>
    ),
  },
  {
    label: "Form",
    pos: "right-[7%] bottom-[20%]",
    depthZ: 50,
    element: ({ shake, tooltip }) => (
      <div className="relative group">
        <div
          className={`w-64 rounded-sm border border-slate-500/20 bg-slate-950/45 p-4 backdrop-blur-sm shadow-[0_0_35px_rgba(100,116,139,0.07)] ${shake ? "rejecting" : ""}`}
        >
          <div className="text-[10px] text-slate-600/50 font-mono mb-3 tracking-wider">CONTACT.HTML</div>
          <div className="h-8 rounded-sm border border-slate-700/30 bg-slate-900/50 mb-2" />
          <div className="h-8 rounded-sm border border-slate-700/30 bg-slate-900/50 mb-3" />
          <div className="h-8 w-24 rounded-sm border border-slate-600/25 bg-slate-800/40" />
        </div>
        {tooltip && (
          <div className="absolute -top-9 left-1/2 -translate-x-1/2 text-[10px] font-mono bg-red-950/90 text-red-300 px-2 py-1 rounded whitespace-nowrap border border-red-700/40 z-50">
            No JavaScript. Cannot react.
          </div>
        )}
      </div>
    ),
  },
];

function DeadUIElement({ item, index }) {
  const [shake, setShake] = useState(false);
  const [tooltip, setTooltip] = useState(false);
  const El = item.element;

  const handleInteract = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShake(false);
    setTimeout(() => setShake(true), 10);
    setTooltip(true);
    setTimeout(() => { setShake(false); setTooltip(false); }, 1200);
  };

  return (
    <div
      className={`absolute ${item.pos} pointer-events-auto select-none`}
      onClick={handleInteract}
      onPointerDown={handleInteract}
      onMouseEnter={handleInteract}
    >
      <El shake={shake} tooltip={tooltip} />
    </div>
  );
}

const dustParticles = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  size: Math.random() * 2.5 + 0.8,
  dx1: `${(Math.random() - 0.5) * 40}px`,
  dy1: `${(Math.random() - 0.5) * 50}px`,
  dx2: `${(Math.random() - 0.5) * 30}px`,
  dy2: `${(Math.random() - 0.5) * 35}px`,
  dur: `${Math.random() * 8 + 7}s`,
  delay: `${Math.random() * -12}s`,
  opacity: Math.random() * 0.3 + 0.1,
}));

function Scene1() {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const year1993Ref = useRef(null);
  const gridRef = useRef(null);
  const beatRefs = useRef([]);
  const subBeatRefs = useRef([]);
  const artifactRefs = useRef([]);
  const deadWordRef = useRef(null);
  const cursorWrapRef = useRef(null);
  const endTextRef = useRef(null);
  const darknessRef = useRef(null);
  const zLayerRefs = useRef([]);

  const shatterParticles = useMemo(() =>
    Array.from({ length: 120 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2,
      ox: (Math.random() - 0.5) * 400,
      oy: (Math.random() - 0.5) * 220,
      tx: (Math.random() - 0.5) * 900,
      ty: (Math.random() - 0.5) * 600,
      color: Math.random() > 0.7 ? "rgba(220,38,38,0.9)" : "rgba(100,116,139,0.7)",
    })), []);

  const shatterRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial states
      gsap.set(year1993Ref.current, { opacity: 0, y: -120, rotateX: 45, z: -200, filter: "blur(20px)" });
      gsap.set(beatRefs.current, { opacity: 0, y: 50, z: -100, filter: "blur(12px)" });
      gsap.set(subBeatRefs.current, { opacity: 0, y: 20, filter: "blur(8px)" });
      gsap.set(artifactRefs.current, { opacity: 0, z: -300, scale: 0.7, filter: "blur(20px)" });
      gsap.set(deadWordRef.current, { opacity: 0, scale: 2.5, filter: "blur(30px)", z: 300 });
      gsap.set(cursorWrapRef.current, { opacity: 0 });
      gsap.set(endTextRef.current, { opacity: 0, y: 30 });
      gsap.set(shatterRefs.current, {
        opacity: 0,
        x: (i) => shatterParticles[i].ox,
        y: (i) => shatterParticles[i].oy,
        scale: 0.3,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "+=5000",
          scrub: 1.5,
          pin: true,
          anticipatePin: 1,
        },
      });

      // ─── Beat 0: 1993 slams in, Z-forward ─────────────────────────────
      tl
        .to(year1993Ref.current, {
          opacity: 1, y: 0, rotateX: 0, z: 0,
          filter: "blur(0px)",
          duration: 1.4,
          ease: "expo.out",
        }, 0)
        .to(darknessRef.current, { opacity: 0.6, duration: 1 }, 0.3)
        // Grid lines breathe in
        .to(gridRef.current, { opacity: 0.12, duration: 1.2 }, 0)

        // ─── Beat 1: "The internet existed." ─────────────────────────────
        .to(beatRefs.current[0], {
          opacity: 1, y: 0, z: 0, filter: "blur(0px)", duration: 0.9,
        }, 1.5)
        .to(subBeatRefs.current[0], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }, 2)

        // Artifacts drift in from corners (z-depth approach)
        .to(artifactRefs.current, {
          opacity: 0.85,
          z: 0,
          scale: 1,
          filter: "blur(0px)",
          stagger: 0.2,
          duration: 1.1,
        }, 2.2)

        // ─── Beat 2: "You could read. You could not interact." ───────────
        .to([beatRefs.current[0], subBeatRefs.current[0]], {
          opacity: 0, y: -40, filter: "blur(10px)", duration: 0.6,
        }, 3.5)
        .to(beatRefs.current[1], {
          opacity: 1, y: 0, z: 0, filter: "blur(0px)", duration: 0.9,
        }, 4)
        .to(subBeatRefs.current[1], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }, 4.5)

        // Artifacts dim + turn grey
        .to(artifactRefs.current, {
          filter: "grayscale(1) brightness(0.5)",
          opacity: 0.4,
          duration: 0.8,
        }, 4.6)

        // Year pushes backward in Z
        .to(year1993Ref.current, {
          z: -150,
          opacity: 0.3,
          scale: 0.88,
          filter: "blur(4px)",
          duration: 1.4,
        }, 4.8)

        // ─── Beat 3: "Forms submitted blindly." ──────────────────────────
        .to([beatRefs.current[1], subBeatRefs.current[1]], {
          opacity: 0, y: -40, filter: "blur(10px)", duration: 0.6,
        }, 5.5)
        .to(beatRefs.current[2], {
          opacity: 1, y: 0, z: 0, filter: "blur(0px)", duration: 0.9,
        }, 6)
        .to(subBeatRefs.current[2], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }, 6.5)

        // Grid lines flash red
        .to(gridRef.current, {
          filter: "hue-rotate(180deg) brightness(2)",
          opacity: 0.2,
          duration: 0.3,
        }, 6.8)
        .to(gridRef.current, {
          filter: "hue-rotate(0deg) brightness(1)",
          opacity: 0.12,
          duration: 0.5,
        }, 7.1)

        // ─── Beat 4: Shatter ──────────────────────────────────────────────
        .to([beatRefs.current[2], subBeatRefs.current[2]], {
          opacity: 0, y: -40, filter: "blur(10px)", duration: 0.5,
        }, 7.5)
        .to(beatRefs.current[3], {
          opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8,
        }, 7.9)
        .to(subBeatRefs.current[3], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7 }, 8.4)

        // Artifacts shatter out
        .to(artifactRefs.current, {
          opacity: 0,
          scale: 0.4,
          filter: "blur(25px) grayscale(1)",
          z: 200,
          stagger: 0.08,
          duration: 0.7,
          ease: "power4.in",
        }, 9)

        // Shatter particles explode
        .to(shatterRefs.current, {
          opacity: 0.85,
          scale: 1.2,
          stagger: { each: 0.004, from: "random" },
          duration: 0.6,
          ease: "power2.out",
        }, 9.2)
        .to(shatterRefs.current, {
          x: (i) => shatterParticles[i].tx,
          y: (i) => shatterParticles[i].ty,
          opacity: 0,
          scale: 0.6,
          stagger: { each: 0.003, from: "center" },
          duration: 1.4,
          ease: "power3.out",
        }, 9.6)

        // DEAD word slams in from Z=+300, shrinks to natural size
        .to(deadWordRef.current, {
          opacity: 1,
          scale: 1,
          filter: "blur(0px)",
          z: 0,
          duration: 0.7,
          ease: "expo.out",
        }, 9.5)

        // Year completely gone
        .to(year1993Ref.current, {
          opacity: 0, z: -400, scale: 0.5, filter: "blur(30px)", duration: 0.8,
        }, 9.4)

        // ─── Outro: cursor + final text ───────────────────────────────────
        .to([beatRefs.current[3], subBeatRefs.current[3]], {
          opacity: 0, y: -30, filter: "blur(8px)", duration: 0.5,
        }, 10.5)
        .to(deadWordRef.current, {
          opacity: 0, y: -80, filter: "blur(20px)", duration: 0.8, ease: "power2.in",
        }, 10.8)
        .to(darknessRef.current, { opacity: 0.97, duration: 1 }, 11)
        .to(cursorWrapRef.current, { opacity: 1, duration: 0.4 }, 11.4)
        .to(endTextRef.current, { opacity: 1, y: 0, duration: 0.8 }, 11.8);

    }, rootRef);

    return () => ctx.revert();
  }, [shatterParticles]);

  return (
    <section
      ref={sceneRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden scanlines noise-overlay perspective-scene"
      style={{ background: "#020309" }}
    >
      {/* Grid lines */}
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(100,116,139,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(100,116,139,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "72px 72px",
        }}
      />

      {/* Radial atmosphere */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 50% 50%, rgba(15,20,40,0.3) 0%, transparent 70%),
            radial-gradient(ellipse 80% 60% at 20% 80%, rgba(30,10,10,0.25) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(10,20,30,0.2) 0%, transparent 50%)
          `,
        }}
      />

      {/* Vignette pulse */}
      <div
        className="absolute inset-0 pointer-events-none vignette-pulse"
        style={{
          background: "radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
        }}
      />

      {/* Darkness overlay */}
      <div ref={darknessRef} className="absolute inset-0 bg-black/0 pointer-events-none z-20" />

      {/* Dust particles (pure CSS, infinite) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {dustParticles.map((p) => (
          <span
            key={p.id}
            className="absolute rounded-full dust-particle"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              background: "rgba(148,163,184,0.7)",
              boxShadow: `0 0 6px rgba(148,163,184,0.5)`,
              opacity: p.opacity,
              "--dx1": p.dx1,
              "--dy1": p.dy1,
              "--dx2": p.dx2,
              "--dy2": p.dy2,
              "--dur": p.dur,
              "--delay": p.delay,
            }}
          />
        ))}
      </div>

      {/* Z-depth scene container */}
      <div ref={rootRef} className="relative w-full h-screen max-w-7xl mx-auto depth-layer">

        {/* "1993" — massive, cracked-looking */}
        <div
          ref={year1993Ref}
          className="absolute inset-x-0 top-[10%] flex items-center justify-center pointer-events-none z-10"
        >
          <h1
            className="cracked-text select-none font-['Cinzel',serif] font-black leading-none tracking-[0.06em]"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(9rem, 26vw, 26rem)",
              color: "transparent",
              WebkitTextStroke: "1px rgba(148,163,184,0.35)",
              backgroundImage: `
                linear-gradient(180deg,
                  rgba(226,232,240,0.95) 0%,
                  rgba(148,163,184,0.7) 40%,
                  rgba(71,85,105,0.5) 70%,
                  rgba(30,41,59,0.4) 100%
                )
              `,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              textShadow: "0 0 200px rgba(148,163,184,0.06)",
              letterSpacing: "0.06em",
            }}
          >
            1993
          </h1>
        </div>

        {/* Dead UI artifacts */}
        <div className="absolute inset-0 z-30">
          {DEAD_UI.map((item, i) => (
            <div
              key={item.label}
              ref={(el) => { artifactRefs.current[i] = el; }}
            >
              <DeadUIElement item={item} index={i} />
            </div>
          ))}
        </div>

        {/* Shatter particles */}
        <div className="absolute inset-0 pointer-events-none z-40 flex items-center justify-center">
          {shatterParticles.map((p, i) => (
            <span
              key={p.id}
              ref={(el) => { shatterRefs.current[i] = el; }}
              className="absolute rounded-sm"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                boxShadow: `0 0 8px ${p.color}`,
              }}
            />
          ))}
        </div>

        {/* DEAD word */}
        <div
          ref={deadWordRef}
          className="absolute left-1/2 top-1/2 pointer-events-none z-50"
          style={{ transform: "translate(-50%, -50%)" }}
        >
          <span
            className="font-['Cinzel',serif] font-black select-none"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(5rem, 16vw, 16rem)",
              color: "#dc2626",
              filter: "drop-shadow(0 0 60px rgba(220,38,38,0.6)) drop-shadow(0 0 120px rgba(220,38,38,0.3))",
              letterSpacing: "0.1em",
            }}
          >
            DEAD.
          </span>
        </div>

        {/* Story beats — center bottom */}
        <div className="absolute bottom-[12%] inset-x-0 z-30 text-center pointer-events-none">
          {STORY_BEATS.map((beat, i) => (
            <div key={i} className="absolute inset-x-0 bottom-0">
              <p
                ref={(el) => { beatRefs.current[i] = el; }}
                className="font-['Cinzel',serif] font-bold leading-tight"
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: "clamp(2rem, 5.5vw, 5.5rem)",
                  color: "rgba(226,232,240,0.95)",
                  letterSpacing: "0.05em",
                  textShadow: "0 0 80px rgba(148,163,184,0.15)",
                }}
              >
                {beat.text}
              </p>
              <p
                ref={(el) => { subBeatRefs.current[i] = el; }}
                className="mt-3 font-['Space_Grotesk',sans-serif] font-light"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "clamp(0.85rem, 1.8vw, 1.4rem)",
                  color: "rgba(100,116,139,0.8)",
                  letterSpacing: "0.12em",
                }}
              >
                {beat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* Final cursor scene */}
        <div
          ref={cursorWrapRef}
          className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
        >
          <div
            className="font-mono text-slate-400/90 cursor-blink mb-6"
            style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}
          >
            _
          </div>
          <p
            ref={endTextRef}
            className="font-['Space_Grotesk',sans-serif] font-light tracking-[0.2em] uppercase"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(0.75rem, 1.5vw, 1.1rem)",
              color: "rgba(100,116,139,0.7)",
              letterSpacing: "0.25em",
            }}
          >
            Someone was about to change this.
          </p>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 scroll-hint pointer-events-none">
          <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
            <rect x="7" y="1" width="6" height="10" rx="3" stroke="rgba(100,116,139,0.4)" strokeWidth="1.2"/>
            <circle cx="10" cy="5" r="1.5" fill="rgba(100,116,139,0.4)"/>
            <path d="M10 16 L10 26 M6 22 L10 26 L14 22" stroke="rgba(100,116,139,0.3)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </section>
  );
}

// ─── SCENE 2: THE 10-DAY WAR ──────────────────────────────────────────────────

const CODE_LINES = [
  "// Day 10: The brief said: make it look like Java",
  'const web = document.querySelector("body");',
  'web.addEventListener("click", () => {});',
  "function greet(name) { return 'Hello ' + name; }",
  "let isAlive = true; // finally",
  "if (isAlive) { web.style.color = 'yellow'; }",
  "for (let i = 0; i < 10; i++) { console.log(i); }",
  'const lang = { name: "JavaScript", days: 10 };',
  "// One more day. It has to work.",
  "// Done.",
];

function HelixParticles({ scrollProgress }) {
  const meshRef = useRef();
  const count = 800;

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 6;
      const strand = i % 2 === 0 ? 1 : -1;
      const r = 2.5;
      pos[i * 3]     = Math.cos(t + strand * Math.PI) * r;
      pos[i * 3 + 1] = t * 0.6 - 9;
      pos[i * 3 + 2] = Math.sin(t + strand * Math.PI) * r;
      const progress = i / count;
      col[i * 3]     = 0.8 - progress * 0.6;   // r: red → yellow
      col[i * 3 + 1] = 0.1 + progress * 0.75;  // g
      col[i * 3 + 2] = 0;
    }
    return [pos, col];
  }, []);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = clock.getElapsedTime() * 0.18;
      meshRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.08) * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.06} vertexColors sizeAttenuation transparent opacity={0.75} />
    </points>
  );
}

function Scene2() {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const dayNumberRef = useRef(null);
  const terminalRef = useRef(null);
  const codeContainerRef = useRef(null);
  const finalTitleRef = useRef(null);
  const finalSubRef = useRef(null);
  const flashRef = useRef(null);
  const bgRef = useRef(null);

  const [visibleLines, setVisibleLines] = useState([]);
  const [currentDay, setCurrentDay] = useState(10);
  const [scrollProg, setScrollProg] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set([headlineRef.current, subtitleRef.current], { opacity: 0, clipPath: "inset(0 100% 0 0)" });
      gsap.set(dayNumberRef.current, { opacity: 0, y: 120, scale: 0.7, filter: "blur(20px)" });
      gsap.set(terminalRef.current, { opacity: 0, scale: 0.9 });
      gsap.set([finalTitleRef.current, finalSubRef.current], { opacity: 0, y: 40 });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "+=6000",
          scrub: 1.2,
          pin: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            setScrollProg(self.progress);
            const progress = self.progress;

            // Day countdown
            if (progress > 0.08 && progress < 0.92) {
              const dayProgress = (progress - 0.08) / 0.84;
              const day = Math.round(10 - dayProgress * 10);
              setCurrentDay(Math.max(0, day));

              const lineIndex = Math.floor(dayProgress * 10);
              setVisibleLines(CODE_LINES.slice(0, Math.min(lineIndex + 1, 10)));
            }
          },
        },
      });

      tl
        .to(headlineRef.current, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 1 }, 0)
        .to(subtitleRef.current, { opacity: 1, clipPath: "inset(0 0% 0 0)", duration: 0.8 }, 0.5)
        .to(terminalRef.current, { opacity: 1, scale: 1, duration: 0.8 }, 0.9)
        .to(dayNumberRef.current, { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1 }, 1.2)
        .to({}, { duration: 8 }) // hold for countdown
        // Zero moment
        .to(flashRef.current, { opacity: 1, duration: 0.1, ease: "power4.in" }, 9.1)
        .to(flashRef.current, { opacity: 0, duration: 0.3 }, 9.2)
        .to(finalTitleRef.current, { opacity: 1, y: 0, duration: 1 }, 9.4)
        .to(finalSubRef.current, { opacity: 1, y: 0, duration: 0.8 }, 9.9);

    }, rootRef);

    return () => ctx.revert();
  }, []);

  const bgColor = `rgb(${Math.round(13 + scrollProg * 13)}, ${Math.round(scrollProg * 10)}, ${Math.round(scrollProg * 3)})`;

  return (
    <section
      ref={sceneRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Animated bg via scroll */}
      <div
        ref={bgRef}
        className="absolute inset-0 transition-colors duration-75"
        style={{ background: bgColor }}
      />

      {/* Three.js helix */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 14], fov: 55 }}>
          <ambientLight intensity={0.5} />
          <HelixParticles scrollProgress={scrollProg} />
        </Canvas>
      </div>

      {/* Flash overlay */}
      <div
        ref={flashRef}
        className="absolute inset-0 z-50 bg-[#f7df1e] opacity-0 pointer-events-none"
      />

      <div ref={rootRef} className="relative z-10 w-full max-w-5xl mx-auto px-6">
        {/* Newspaper headline */}
        <div className="text-center mb-8">
          <p
            ref={headlineRef}
            className="font-['Cinzel',serif] font-bold tracking-[0.15em] uppercase"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
              color: "rgba(251,191,36,0.9)",
              letterSpacing: "0.18em",
            }}
          >
            May 1995 — Netscape gives one engineer 10 days
          </p>
          <p
            ref={subtitleRef}
            className="mt-2 font-['Space_Grotesk',sans-serif] font-light"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(0.85rem, 1.5vw, 1.1rem)",
              color: "rgba(161,124,50,0.7)",
              letterSpacing: "0.12em",
            }}
          >
            His name was Brendan Eich.
          </p>
        </div>

        <div className="flex gap-8 items-start">
          {/* Day counter */}
          <div className="flex-shrink-0 text-center" style={{ minWidth: "200px" }}>
            <div
              ref={dayNumberRef}
              className="font-['Cinzel',serif] font-black leading-none"
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: "clamp(7rem, 18vw, 14rem)",
                color: "transparent",
                backgroundImage: `linear-gradient(180deg, #fbbf24 0%, #b45309 100%)`,
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 40px rgba(251,191,36,0.3))",
              }}
            >
              {currentDay}
            </div>
            <p
              className="font-['Space_Grotesk',sans-serif] text-amber-600/60 tracking-[0.3em] uppercase text-xs mt-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {currentDay === 0 ? "done" : "days left"}
            </p>
          </div>

          {/* Terminal */}
          <div
            ref={terminalRef}
            className="flex-1 rounded-sm overflow-hidden"
            style={{
              border: `1px solid ${currentDay === 0 ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.08)"}`,
              background: "rgba(0,0,0,0.75)",
              backdropFilter: "blur(12px)",
              boxShadow: currentDay === 0
                ? "0 0 60px rgba(251,191,36,0.2), inset 0 0 30px rgba(251,191,36,0.04)"
                : "0 0 30px rgba(0,0,0,0.5)",
              transition: "border-color 0.5s, box-shadow 0.5s",
            }}
          >
            {/* Terminal header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-green-500/60" />
              <span className="ml-3 font-mono text-xs text-slate-600/60 tracking-wider">eich@netscape — javascript.js</span>
            </div>

            {/* Code lines */}
            <div
              ref={codeContainerRef}
              className="p-5 font-['JetBrains_Mono',monospace] text-sm leading-relaxed"
              style={{ fontFamily: "'JetBrains Mono', monospace", minHeight: "260px" }}
            >
              {visibleLines.map((line, i) => (
                <div key={i} className="flex items-start gap-3 mb-1.5">
                  <span className="text-slate-600/40 select-none w-5 text-right flex-shrink-0 text-xs mt-0.5">
                    {i + 1}
                  </span>
                  <span
                    className="code-line"
                    style={{
                      color: line.startsWith("//")
                        ? "rgba(100,116,139,0.7)"
                        : currentDay === 0
                        ? "rgba(134,239,172,0.9)"
                        : "rgba(203,213,225,0.85)",
                      textShadow: currentDay === 0 ? "0 0 20px rgba(134,239,172,0.4)" : "none",
                      transition: "color 0.5s, text-shadow 0.5s",
                    }}
                  >
                    {line}
                  </span>
                </div>
              ))}
              {visibleLines.length > 0 && (
                <span className="inline-block w-2 h-4 bg-green-400/70 term-cursor ml-8" />
              )}
            </div>
          </div>
        </div>

        {/* Final reveal */}
        <div className="text-center mt-12">
          <h2
            ref={finalTitleRef}
            className="font-['Cinzel',serif] font-black"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: "clamp(3rem, 10vw, 8rem)",
              color: "#f7df1e",
              filter: "drop-shadow(0 0 40px rgba(247,223,30,0.4))",
              letterSpacing: "0.08em",
            }}
          >
            JavaScript.
          </h2>
          <p
            ref={finalSubRef}
            className="mt-4 font-['Space_Grotesk',sans-serif] font-light tracking-[0.2em] uppercase"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(0.8rem, 1.6vw, 1.1rem)",
              color: "rgba(161,124,50,0.8)",
              letterSpacing: "0.25em",
            }}
          >
            Built in 10 days. Used for 30 years.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── ROOT EXPORT ──────────────────────────────────────────────────────────────

export default function HeroJourney() {
  useEffect(() => {
    const styleEl = document.createElement("style");
    styleEl.textContent = STYLES;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <main style={{ background: "#020309", color: "white" }}>
      <Scene1 />
      <Scene2 />
    </main>
  );
}