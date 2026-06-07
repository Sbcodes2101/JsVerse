import { useEffect, useRef, useState, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════════════════ */
const STYLES = `
  @keyframes rotate3d { from { transform: rotateY(0deg); } to { transform: rotateY(-360deg); } }
  .carousel-ring { animation: rotate3d 18s linear infinite; }
  .carousel-ring.paused { animation-play-state: paused; }
  @keyframes fadeInScale { from { opacity:0; transform:scale(0.97); } to { opacity:1; transform:scale(1); } }
  .game-overlay-anim { animation: fadeInScale 0.35s ease; }
  @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
  .shake { animation: shake 0.3s ease; }
  @keyframes glitch {
    0%{transform:translate(0)} 20%{transform:translate(-3px,1px);filter:hue-rotate(30deg)}
    40%{transform:translate(3px,-1px);filter:hue-rotate(-30deg)} 60%{transform:translate(-2px)}
    80%{transform:translate(2px)} 100%{transform:translate(0)}
  }
  .glitch { animation: glitch 0.4s steps(2) 0.1s; }
  @keyframes bitFloat { 0%,100%{transform:translateY(0);opacity:0.4} 50%{transform:translateY(-8px);opacity:1} }
  .bit-float { animation: bitFloat 2s ease-in-out infinite; }
  @keyframes bossIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  .boss-in { animation: bossIn 0.5s ease; }
  @keyframes lessonIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .lesson-in { animation: lessonIn 0.5s ease 0.3s both; }
  .drag-over-slot { border-color: #fbbf24 !important; background: rgba(251,191,36,0.04) !important; }
  @keyframes appFloat {
    0%,100% { transform: translate3d(var(--float-x,0), var(--float-y,0), 0) rotate(var(--card-rotate,0deg)); }
    50% { transform: translate3d(calc(var(--float-x,0) + var(--drift-x,0px)), calc(var(--float-y,0) - var(--drift-y,18px)), 0) rotate(calc(var(--card-rotate,0deg) * -1)); }
  }
  @keyframes auraPulse {
    0%,100% { opacity: .45; transform: scale(.96); }
    50% { opacity: .9; transform: scale(1.08); }
  }
  @keyframes orbitDot {
    from { transform: rotate(0deg) translateX(74px) rotate(0deg); }
    to { transform: rotate(360deg) translateX(74px) rotate(-360deg); }
  }
  .ape-floating-card {
    animation: appFloat var(--float-duration, 7s) ease-in-out infinite;
    animation-delay: var(--float-delay, 0s);
    transform-style: preserve-3d;
  }
  .ape-card-inner {
    transform: perspective(900px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateZ(0);
    transition: transform .22s ease, border-color .22s ease, box-shadow .22s ease, filter .22s ease;
  }
  .ape-floating-card:hover .ape-card-inner {
    border-color: var(--accent);
    box-shadow: 0 28px 100px var(--accent-soft), inset 0 1px 0 rgba(255,255,255,.12);
    filter: saturate(1.16) brightness(1.08);
  }
  .ape-aura { animation: auraPulse 3.8s ease-in-out infinite; }
  .orbit-dot { animation: orbitDot 5.5s linear infinite; }
`;

/* ═══════════════════════════════════════════════════════════════════════════
   STAR CANVAS
═══════════════════════════════════════════════════════════════════════════ */
function StarCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.2 + 0.2,
      a: Math.random() * 0.5 + 0.1,
      da: (Math.random() - 0.5) * 0.003,
    }));
    let raf;
    function draw() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach((s) => {
        s.a = Math.max(0.05, Math.min(0.65, s.a + s.da));
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${s.a})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAMES METADATA
═══════════════════════════════════════════════════════════════════════════ */
const GAMES_META = [
  {
    id: 1, num: "01", tag: "Lecture II · Data Types", title: "Memory Playground",
    desc: "Drag values into memory slots. Instantly see their type, storage mode, and heap size.",
    chips: ["Primitive", "Reference", "typeof", "Stack", "Heap"],
    cls: "c1", btnColor: "#fbbf24",
    cardBg: "linear-gradient(135deg,#0d0a00 0%,#1a1200 60%,#0a0800 100%)",
    numColor: "#fbbf24", tagColor: "#92400e", titleColor: "#fde68a", descColor: "#a16207",
    chipBg: "rgba(251,191,36,0.12)", chipColor: "#fbbf24", chipBorder: "rgba(251,191,36,0.2)",
    cardBorder: "rgba(251,191,36,0.2)", cardShadow: "0 0 60px rgba(251,191,36,0.08)",
  },
  {
    id: 2, num: "02", tag: "Lecture III · References", title: "Primitive vs Reference Arena",
    desc: "Predict what happens to variables after mutation. See real memory arrows appear.",
    chips: ["By Value", "By Reference", "Objects", "Predict"],
    cls: "c2", btnColor: "#22d3ee",
    cardBg: "linear-gradient(135deg,#00080d 0%,#001a1a 60%,#000a0a 100%)",
    numColor: "#22d3ee", tagColor: "#0e7490", titleColor: "#a5f3fc", descColor: "#0891b2",
    chipBg: "rgba(34,211,238,0.1)", chipColor: "#22d3ee", chipBorder: "rgba(34,211,238,0.2)",
    cardBorder: "rgba(34,211,238,0.2)", cardShadow: "0 0 60px rgba(34,211,238,0.08)",
  },
  {
    id: 3, num: "03", tag: "Lecture II · Numbers", title: "Floating Point Nightmare",
    desc: "Type 0.1 + 0.2. Expect 0.3. Watch the screen break. Defeat the binary boss.",
    chips: ["IEEE 754", "Binary", "Boss Fight", "toFixed"],
    cls: "c3", btnColor: "#f87171",
    cardBg: "linear-gradient(135deg,#0d0000 0%,#1a0000 60%,#0a0000 100%)",
    numColor: "#f87171", tagColor: "#991b1b", titleColor: "#fca5a5", descColor: "#b91c1c",
    chipBg: "rgba(248,113,113,0.1)", chipColor: "#f87171", chipBorder: "rgba(248,113,113,0.2)",
    cardBorder: "rgba(248,113,113,0.2)", cardShadow: "0 0 60px rgba(248,113,113,0.08)",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CAROUSEL CARD
═══════════════════════════════════════════════════════════════════════════ */
function CarouselCard({ g, index, onEnter, onHover }) {
  const cardRef = useRef(null);
  const layouts = [
    { x: "-360px", y: "-18px", rotate: "-8deg", driftX: "22px", driftY: "28px", delay: "-1.2s", duration: "7.2s" },
    { x: "0px", y: "-88px", rotate: "2deg", driftX: "-18px", driftY: "24px", delay: "-3.1s", duration: "8.4s" },
    { x: "360px", y: "12px", rotate: "8deg", driftX: "16px", driftY: "30px", delay: "-2.2s", duration: "7.8s" },
  ];
  const layout = layouts[index] || layouts[0];

  function handleMove(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.setProperty("--tilt-x", `${px * 10}deg`);
    card.style.setProperty("--tilt-y", `${py * -10}deg`);
  }

  function resetTilt() {
    const card = cardRef.current;
    if (!card) return;
    card.style.setProperty("--tilt-x", "0deg");
    card.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <div
      ref={cardRef}
      className="ape-floating-card"
      style={{
        position: "absolute", width: 268, minHeight: 318,
        left: "50%", top: "50%",
        marginLeft: -134, marginTop: -159,
        cursor: "pointer",
        "--float-x": layout.x,
        "--float-y": layout.y,
        "--card-rotate": layout.rotate,
        "--drift-x": layout.driftX,
        "--drift-y": layout.driftY,
        "--float-delay": layout.delay,
        "--float-duration": layout.duration,
        "--accent": g.btnColor,
        "--accent-soft": `${g.btnColor}33`,
        zIndex: index === 1 ? 14 : 12,
      }}
      onMouseEnter={() => onHover(g.id)}
      onMouseLeave={() => { onHover(null); resetTilt(); }}
      onMouseMove={handleMove}
      onClick={() => onEnter(g.id)}
    >
      <div className="ape-aura" style={{ position: "absolute", inset: -34, borderRadius: 28, background: `radial-gradient(circle, ${g.btnColor}24, transparent 62%)`, filter: "blur(14px)" }} />
      <div className="orbit-dot" style={{ position: "absolute", left: "50%", top: "50%", width: 7, height: 7, borderRadius: 999, background: g.btnColor, boxShadow: `0 0 20px ${g.btnColor}` }} />
      <div className="ape-card-inner" style={{ position: "relative", width: "100%", minHeight: 318, padding: "22px 20px", display: "flex", flexDirection: "column", background: `linear-gradient(150deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025) 32%, rgba(0,0,0,0.62)), ${g.cardBg}`, borderRadius: 24, border: `1px solid ${g.cardBorder}`, boxShadow: `0 24px 80px rgba(0,0,0,0.45), ${g.cardShadow}`, overflow: "hidden", backdropFilter: "blur(18px)" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 26% 12%, ${g.btnColor}2e, transparent 34%), linear-gradient(120deg, transparent, rgba(255,255,255,0.08), transparent)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 16 }}>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "3.5rem", fontWeight: 900, lineHeight: 0.9, color: g.numColor, textShadow: `0 0 42px ${g.numColor}77` }}>{g.num}</div>
          <div style={{ width: 52, height: 52, borderRadius: 16, display: "grid", placeItems: "center", color: g.btnColor, border: `1px solid ${g.btnColor}44`, background: `${g.btnColor}12`, boxShadow: `0 0 28px ${g.btnColor}22`, fontFamily: "monospace", fontWeight: 800 }}>
            {g.id === 1 ? "{}" : g.id === 2 ? "=>" : "0.1"}
          </div>
        </div>
        <div style={{ position: "relative", fontSize: "0.58rem", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: 10, color: g.tagColor }}>{g.tag}</div>
        <div style={{ position: "relative", fontFamily: "Georgia,serif", fontSize: "1.2rem", fontWeight: 800, lineHeight: 1.15, marginBottom: 10, letterSpacing: "0.04em", color: g.titleColor }}>{g.title}</div>
        <div style={{ position: "relative", fontSize: "0.72rem", lineHeight: 1.65, color: g.descColor, flex: 1 }}>{g.desc}</div>
        <div style={{ position: "relative", display: "flex", flexWrap: "wrap", gap: 5, marginTop: 14 }}>
          {g.chips.map((c) => (
            <span key={c} style={{ fontSize: "0.56rem", padding: "3px 8px", borderRadius: 20, letterSpacing: "0.08em", background: g.chipBg, color: g.chipColor, border: `1px solid ${g.chipBorder}` }}>{c}</span>
          ))}
        </div>
        <div style={{ position: "relative", marginTop: 16, padding: "10px 0", borderRadius: 12, textAlign: "center", fontSize: "0.66rem", letterSpacing: "0.22em", textTransform: "uppercase", fontWeight: 700, color: g.btnColor, border: `1px solid ${g.btnColor}44`, background: `${g.btnColor}14`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
          Enter Game
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME 1 — Memory Playground
═══════════════════════════════════════════════════════════════════════════ */
const MEM_VALUES = [
  { val: "42",        type: "number",    prim: true,  color: "#fbbf24", size: 8  },
  { val: '"hello"',   type: "string",    prim: true,  color: "#34d399", size: 16 },
  { val: "true",      type: "boolean",   prim: true,  color: "#818cf8", size: 1  },
  { val: "null",      type: "object",    prim: true,  color: "#94a3b8", size: 1  },
  { val: "undefined", type: "undefined", prim: true,  color: "#64748b", size: 1  },
  { val: "[]",        type: "object",    prim: false, color: "#f472b6", size: 64 },
  { val: "{}",        type: "object",    prim: false, color: "#fb923c", size: 56 },
];
const MEM_SLOTS = [
  { addr: "0x7f1a", label: "Stack Frame A" },
  { addr: "0x7f2b", label: "Stack Frame B" },
  { addr: "0x7f3c", label: "Stack Frame C" },
  { addr: "0x7f4d", label: "Stack Frame D" },
];

function MemoryPlayground() {
  const [slots, setSlots] = useState(Array(MEM_SLOTS.length).fill(null));
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [overSlot, setOverSlot] = useState(null);

  const sel = selected !== null ? MEM_VALUES[selected] : null;

  return (
    <div>
      <h2 style={{ fontFamily: "Georgia,serif", fontSize: "1.1rem", color: "#fbbf24", letterSpacing: "0.1em", marginBottom: 4 }}>Memory Playground</h2>
      <p style={{ fontSize: "0.65rem", color: "#475569", letterSpacing: "0.12em", marginBottom: 16 }}>DRAG values from the pool into memory slots on the right.</p>
      <div style={{ display: "flex", gap: 20, minHeight: 340 }}>
        {/* Pool */}
        <div style={{ width: 180, flexShrink: 0 }}>
          <div style={{ fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#64748b", marginBottom: 10 }}>Value Pool</div>
          {MEM_VALUES.map((v, vi) => (
            <div
              key={vi}
              draggable
              onClick={() => setSelected(vi)}
              onDragStart={(e) => { e.dataTransfer.setData("vi", vi); setDragging(vi); setSelected(vi); }}
              onDragEnd={() => setDragging(null)}
              style={{
                padding: "8px 12px", marginBottom: 6, borderRadius: 8, cursor: "grab",
                fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 600,
                border: "1px solid rgba(255,255,255,0.1)", background: selected === vi ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
                color: "#e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between",
                opacity: dragging === vi ? 0.4 : 1, transition: "all 0.15s",
                outline: selected === vi ? `1px solid ${v.color}44` : "none",
              }}
            >
              <span style={{ color: v.color, fontWeight: 700 }}>{v.val}</span>
              <span style={{ fontSize: "0.55rem", color: "#334155" }}>{v.prim ? "prim" : "ref"}</span>
            </div>
          ))}
          <div style={{ marginTop: 16, fontSize: "0.62rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "#64748b", marginBottom: 6 }}>Score</div>
          <div style={{ fontFamily: "monospace", fontSize: "1.2rem", color: "#fbbf24" }}>{score}</div>
          <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: 4 }}>{"★".repeat(Math.min(score, 7))}</div>
        </div>

        {/* Slots */}
        <div style={{ flex: 1 }}>
          {MEM_SLOTS.map((s, si) => (
            <div
              key={si}
              onDragOver={(e) => { e.preventDefault(); setOverSlot(si); }}
              onDragLeave={() => setOverSlot(null)}
              onDrop={(e) => {
                e.preventDefault(); setOverSlot(null);
                const vi = parseInt(e.dataTransfer.getData("vi"));
                const updated = [...slots]; updated[si] = MEM_VALUES[vi];
                setSlots(updated); setScore((sc) => sc + 1); setSelected(vi);
              }}
              style={{
                border: overSlot === si ? "1px solid #fbbf24" : "1px dashed rgba(255,255,255,0.12)",
                borderRadius: 10, padding: 14, marginBottom: 10, minHeight: 60,
                background: overSlot === si ? "rgba(251,191,36,0.04)" : "transparent",
                display: "flex", alignItems: "center", gap: 12, transition: "all 0.2s",
              }}
            >
              <div style={{ fontSize: "0.6rem", color: "#334155", letterSpacing: "0.1em", width: 60, flexShrink: 0 }}>
                {s.addr}<br /><span style={{ fontSize: "0.52rem", color: "#1e293b" }}>{s.label}</span>
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.82rem", fontWeight: 600 }}>
                {slots[si] ? <span style={{ color: slots[si].color }}>{slots[si].val}</span> : <span style={{ color: "#1e293b", fontSize: "0.65rem" }}>drop here</span>}
              </div>
              {slots[si] && (
                <div style={{ marginLeft: "auto", textAlign: "right", fontSize: "0.6rem", lineHeight: 1.7 }}>
                  <span style={{ display: "inline-block", padding: "1px 7px", borderRadius: 20, fontSize: "0.58rem", background: slots[si].prim ? "rgba(251,191,36,0.1)" : "rgba(244,114,182,0.1)", color: slots[si].prim ? "#fbbf24" : "#f472b6" }}>
                    {slots[si].prim ? "primitive" : "reference"}
                  </span><br />
                  <span style={{ color: "#475569" }}>{slots[si].prim ? "by value" : "by ref"} · {slots[si].size}b</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Panel */}
        <div style={{ width: 200, flexShrink: 0 }}>
          {[
            { label: "Selected Value", val: sel ? sel.val : "—", color: sel ? sel.color : "#64748b" },
            { label: "typeof", val: sel ? `"${sel.type}"` : "—", color: sel ? sel.color : "#64748b" },
            { label: "Storage", val: sel ? (sel.prim ? "Stack (by value)" : "Heap (by ref)") : "—", color: sel ? (sel.prim ? "#34d399" : "#f472b6") : "#64748b" },
            { label: "Heap Size", val: sel ? `${sel.size} bytes` : "—", color: "#64748b" },
          ].map((row) => (
            <div key={row.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: 14, marginBottom: 10 }}>
              <div style={{ fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#475569", marginBottom: 6 }}>{row.label}</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, color: row.color }}>{row.val}</div>
              {row.label === "Heap Size" && sel && (
                <div style={{ position: "relative", height: 6, background: "rgba(255,255,255,0.04)", borderRadius: 3, marginTop: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", borderRadius: 3, width: `${Math.min(sel.size / 64 * 100, 100)}%`, background: sel.color, transition: "width 0.5s ease" }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME 2 — Primitive vs Reference Arena
═══════════════════════════════════════════════════════════════════════════ */
const PV_ROUNDS = [
  {
    codeHtml: `<span style="color:#818cf8">let</span> a = <span style="color:#34d399">5</span>;\n<span style="color:#818cf8">let</span> b = a;\nb = <span style="color:#34d399">10</span>;`,
    question: "After b = 10 … what is a?",
    choices: ["a = 5", "a = 10"], correct: 0,
    explain: "CORRECT. Primitives copy by value. a and b are independent.",
    wrongMsg: "Primitives are copied by VALUE. Changing b does not affect a.",
    showHeap: false, aVal: "5", bVal: "10",
  },
  {
    codeHtml: `<span style="color:#818cf8">let</span> a = { name: <span style="color:#f59e0b">"JS"</span> };\n<span style="color:#818cf8">let</span> b = a;\nb.name = <span style="color:#f59e0b">"Python"</span>;`,
    question: 'After b.name = "Python" … what is a.name?',
    choices: ['"JS"', '"Python"'], correct: 1,
    explain: "CORRECT. Objects share the same reference — a and b point to the same heap object.",
    wrongMsg: "Objects are shared by REFERENCE. Both a and b point to the same heap object.",
    showHeap: true, aVal: "0x4f2a", bVal: "0x4f2a", heapVal: '{ name: "Python" }',
  },
  {
    codeHtml: `<span style="color:#818cf8">let</span> x = <span style="color:#f59e0b">"hello"</span>;\n<span style="color:#818cf8">let</span> y = x;\nx = <span style="color:#f59e0b">"world"</span>;`,
    question: 'After x = "world" … what is y?',
    choices: ['"hello"', '"world"'], correct: 0,
    explain: "CORRECT! Strings are primitive. y keeps its own independent copy.",
    wrongMsg: 'Strings are primitive — y was copied by value and stays "hello".',
    showHeap: false, aVal: '"world"', bVal: '"hello"',
  },
  {
    codeHtml: `<span style="color:#818cf8">let</span> arr = [<span style="color:#34d399">1</span>,<span style="color:#34d399">2</span>,<span style="color:#34d399">3</span>];\n<span style="color:#818cf8">let</span> copy = arr;\ncopy.push(<span style="color:#34d399">4</span>);`,
    question: "What is arr.length now?",
    choices: ["3", "4"], correct: 1,
    explain: "CORRECT! Arrays are objects — both copy and arr share the same array.",
    wrongMsg: "Arrays are objects (reference types). copy and arr share the same array in memory.",
    showHeap: true, aVal: "0x9c11", bVal: "0x9c11", heapVal: "[1, 2, 3, 4]",
  },
];

function PrimitiveArena() {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);

  const r = PV_ROUNDS[round];

  function answer(idx) {
    if (answered) return;
    setAnswered(true);
    setChosen(idx);
    if (idx === r.correct) setScore((s) => s + 1);
  }
  function next() {
    if (round < PV_ROUNDS.length - 1) { setRound((r) => r + 1); setAnswered(false); setChosen(null); }
    else setDone(true);
  }
  function restart() { setRound(0); setScore(0); setAnswered(false); setChosen(null); setDone(false); }

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, paddingTop: 40 }}>
      <div style={{ fontFamily: "Georgia,serif", fontSize: "1.8rem", color: "#22d3ee", letterSpacing: "0.1em" }}>Game Complete!</div>
      <div style={{ fontSize: "0.9rem", color: "#64748b" }}>Final Score: {score} / {PV_ROUNDS.length}</div>
      <button onClick={restart} style={{ padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", border: "1px solid rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>Play Again</button>
    </div>
  );

  const correct = answered && chosen === r.correct;
  const wrong   = answered && chosen !== r.correct;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 480 }}>
        <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Round {round + 1} / {PV_ROUNDS.length}</span>
        <span style={{ fontSize: "0.65rem", color: "#475569" }}>Score: {score} / {PV_ROUNDS.length}</span>
      </div>
      <div style={{ fontFamily: "sans-serif", fontSize: "1rem", color: "#94a3b8", textAlign: "center" }}>{r.question}</div>
      <pre style={{ background: "#0a0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "16px 20px", fontFamily: "monospace", fontSize: "0.82rem", lineHeight: 1.8, color: "#94a3b8", width: "100%", maxWidth: 420, whiteSpace: "pre-wrap" }}
        dangerouslySetInnerHTML={{ __html: r.codeHtml }} />
      <div style={{ display: "flex", gap: 10 }}>
        {r.choices.map((c, i) => (
          <button key={i} onClick={() => answer(i)}
            className={answered && i === chosen && wrong ? "shake" : ""}
            style={{
              padding: "10px 22px", borderRadius: 8, cursor: "pointer", fontSize: "0.75rem",
              letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "monospace",
              fontWeight: 600, transition: "all 0.15s",
              border: answered && i === r.correct ? "1px solid #34d399" : answered && i === chosen ? "1px solid #f87171" : "1px solid rgba(255,255,255,0.1)",
              background: answered && i === r.correct ? "rgba(52,211,153,0.15)" : answered && i === chosen ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.04)",
              color: answered && i === r.correct ? "#34d399" : answered && i === chosen ? "#f87171" : "#e2e8f0",
            }}>{c}</button>
        ))}
      </div>
      {answered && (
        <>
          <div style={{ borderRadius: 10, padding: "14px 24px", textAlign: "center", fontFamily: "Georgia,serif", fontSize: "1rem", letterSpacing: "0.1em", width: "100%", maxWidth: 420, background: correct ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${correct ? "rgba(52,211,153,0.25)" : "rgba(248,113,113,0.25)"}`, color: correct ? "#34d399" : "#f87171" }}>
            {correct ? r.explain : r.wrongMsg}
          </div>
          <div style={{ display: "flex", gap: 30, alignItems: "flex-start", justifyContent: "center", width: "100%", flexWrap: "wrap" }}>
            {r.showHeap ? (
              <>
                <MemBox label="Variable a" name="a" val={r.aVal} color="#22d3ee" />
                <div style={{ display: "flex", alignItems: "center", paddingTop: 28, color: "#475569", fontSize: "1.4rem" }}>→</div>
                <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: "14px 18px" }}>
                  <div style={{ fontSize: "0.58rem", letterSpacing: "0.2em", color: "#6366f1", textTransform: "uppercase", marginBottom: 8 }}>Heap Object</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.78rem", color: "#a5b4fc", lineHeight: 1.8 }}>{r.heapVal}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", paddingTop: 28, color: "#475569", fontSize: "1.4rem" }}>←</div>
                <MemBox label="Variable b" name="b" val={r.bVal} color="#22d3ee" />
              </>
            ) : (
              <>
                <MemBox label="Variable a" name="a" val={r.aVal} color="#34d399" />
                <div style={{ display: "flex", alignItems: "center", paddingTop: 28, color: "#1e293b", fontSize: "1.4rem" }}>✗</div>
                <MemBox label="Variable b" name="b" val={r.bVal} color="#34d399" />
              </>
            )}
          </div>
          <button onClick={next} style={{ padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", border: "1px solid rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>
            {round < PV_ROUNDS.length - 1 ? "Next Round →" : "See Results →"}
          </button>
        </>
      )}
    </div>
  );
}

function MemBox({ label, name, val, color }) {
  return (
    <div style={{ background: `${color}0f`, border: `1px solid ${color}33`, borderRadius: 10, padding: "14px 18px", textAlign: "center", minWidth: 120 }}>
      <div style={{ fontSize: "0.62rem", letterSpacing: "0.2em", color: "#64748b", marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, marginBottom: 4, color }}>{name}</div>
      <div style={{ fontFamily: "monospace", fontSize: "0.78rem", color: `${color}cc` }}>{val}</div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   GAME 3 — Floating Point Nightmare
═══════════════════════════════════════════════════════════════════════════ */
const FP_CHALLENGES = [
  { expr: "0.1 + 0.2",   expected: "0.3",   actual: String(0.1 + 0.2),   fix: "parseFloat((0.1+0.2).toFixed(2))" },
  { expr: "0.1 + 0.7",   expected: "0.8",   actual: String(0.1 + 0.7),   fix: "parseFloat((0.1+0.7).toFixed(2))" },
  { expr: "1.005 * 100", expected: "100.5", actual: String(1.005 * 100), fix: "parseFloat((1.005*100).toFixed(2))" },
];
const BITS = Array.from({ length: 32 }, () => (Math.random() > 0.5 ? "1" : "0"));

function FloatingPointNightmare() {
  const [ci, setCi] = useState(0);
  const [tries, setTries] = useState(0);
  const [beaten, setBeaten] = useState(0);
  const [input, setInput] = useState("");
  const [stage, setStage] = useState("input"); // input | result | boss | lesson | win
  const [glitching, setGlitching] = useState(false);
  const [wrongHint, setWrongHint] = useState(false);

  const c = FP_CHALLENGES[ci];

  function submit() {
    setTries((t) => t + 1);
    if (input.trim() === c.expected) {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 600);
      setStage("result");
      setTimeout(() => setStage("boss"), 400);
      setTimeout(() => setStage("lesson"), 1400);
      setTimeout(() => {
        const newBeaten = beaten + 1;
        setBeaten(newBeaten);
        if (newBeaten >= FP_CHALLENGES.length) setStage("win");
        else {
          setTimeout(() => { setCi((i) => i + 1); setInput(""); setStage("input"); }, 2400);
        }
      }, 3000);
    } else {
      setWrongHint(true);
      setTimeout(() => setWrongHint(false), 1800);
    }
  }

  function restart() { setCi(0); setTries(0); setBeaten(0); setInput(""); setStage("input"); }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ fontSize: "0.65rem", color: "#475569", letterSpacing: "0.15em" }}>
        Challenge {ci + 1} of {FP_CHALLENGES.length} · Attempts: {tries}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "clamp(1.4rem,4vw,2.2rem)", fontWeight: 700, color: "#e2e8f0", letterSpacing: "0.06em" }}>{c.expr}</div>
      <p style={{ fontSize: "0.7rem", color: "#475569", letterSpacing: "0.15em" }}>What do you expect this to equal?</p>

      {(stage === "input" || wrongHint) && (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder={c.expected}
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: "1rem", color: "#e2e8f0", width: 160, textAlign: "center", outline: "none" }}
          />
          <button onClick={submit} style={{ padding: "10px 20px", borderRadius: 8, cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", border: "1px solid rgba(248,113,113,0.3)", background: "rgba(248,113,113,0.08)", color: "#f87171" }}>Submit</button>
        </div>
      )}

      {wrongHint && (
        <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "#f59e0b", textAlign: "center" }}>Hint: type exactly {c.expected}</div>
      )}

      {["result", "boss", "lesson", "win"].includes(stage) && (
        <div className={glitching ? "glitch" : ""} style={{ fontFamily: "monospace", fontSize: "clamp(1rem,3vw,1.4rem)", fontWeight: 700, textAlign: "center", padding: "14px 24px", borderRadius: 10, border: "1px solid rgba(248,113,113,0.25)", background: "rgba(248,113,113,0.05)", color: "#f87171" }}>
          You expected {c.expected}. JS says: {c.actual}
        </div>
      )}

      {["boss", "lesson", "win"].includes(stage) && (
        <div className="boss-in" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: 16, background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.15)", borderRadius: 12, width: "100%", maxWidth: 480 }}>
          <div style={{ fontSize: "3rem", lineHeight: 1 }}>👾</div>
          <div style={{ fontFamily: "Georgia,serif", fontSize: "1rem", color: "#f87171", letterSpacing: "0.15em" }}>THE BINARY BOSS</div>
          <div style={{ fontSize: "0.72rem", color: "#dc2626", textAlign: "center", lineHeight: 1.7, maxWidth: 340 }}>
            "0.1 in binary is <strong>0.0001100110011…</strong> forever!<br />I am IEEE 754. I will NEVER be exact."
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center", maxWidth: 360 }}>
            {BITS.map((b, i) => (
              <span key={i} className="bit-float" style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#991b1b", animationDelay: `${i * 0.06}s` }}>{b}</span>
            ))}
          </div>
        </div>
      )}

      {["lesson", "win"].includes(stage) && (
        <div className="lesson-in" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "14px 18px", fontSize: "0.7rem", lineHeight: 1.8, color: "#64748b", textAlign: "center", maxWidth: 440 }}>
          <strong style={{ color: "#94a3b8" }}>Why does this happen?</strong><br />
          Computers store numbers in <strong style={{ color: "#94a3b8" }}>binary (base 2)</strong>.<br />
          {c.expected} cannot be represented exactly — so JS gives <code style={{ color: "#22d3ee", background: "rgba(34,211,238,0.06)", padding: "1px 5px", borderRadius: 4 }}>{c.actual}</code>.<br /><br />
          <strong style={{ color: "#94a3b8" }}>The fix:</strong> <code style={{ color: "#22d3ee", background: "rgba(34,211,238,0.06)", padding: "1px 5px", borderRadius: 4 }}>{c.fix}</code>
        </div>
      )}

      {stage === "win" && (
        <div style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)", borderRadius: 10, padding: "14px 20px", color: "#34d399", fontSize: "0.78rem", textAlign: "center", lineHeight: 1.8 }}>
          🎉 You defeated the Binary Boss on all {FP_CHALLENGES.length} challenges!<br />
          <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>IEEE 754 floats are imprecise because binary can't represent all decimals exactly.</span><br />
          <button onClick={restart} style={{ marginTop: 10, padding: "10px 28px", borderRadius: 8, cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", border: "1px solid rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.08)", color: "#22d3ee" }}>Play Again</button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export default function Game() {
  const [hoveredGame, setHoveredGame] = useState(null);
  const [activeGame, setActiveGame] = useState(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  const activeGameMeta = GAMES_META.find((g) => g.id === activeGame);

  return (
    <div style={{ background: "#020309", color: "#fff", height: "100vh", overflow: "hidden", position: "relative", fontFamily: "Courier New, monospace" }}>
      <StarCanvas />

      {/* HUB */}
      <div style={{ position: "relative", width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", isolation: "isolate" }}>
        <div style={{ position: "absolute", inset: "8% 8% 12%", borderRadius: 40, background: "radial-gradient(circle at 50% 42%, rgba(34,211,238,0.12), transparent 42%)", border: "1px solid rgba(125,211,252,0.06)", boxShadow: "inset 0 0 120px rgba(34,211,238,0.04)", zIndex: 1 }} />
        <p style={{ fontFamily: "Georgia,serif", fontSize: "clamp(1.8rem,4vw,4rem)", fontWeight: 900, letterSpacing: "0.2em", color: "#f8fafc", textAlign: "center", marginBottom: 6, position: "relative", zIndex: 20, textShadow: "0 0 44px rgba(125,211,252,0.18)" }}>JS VERSE</p>
        <p style={{ fontFamily: "sans-serif", fontSize: "0.75rem", letterSpacing: "0.34em", color: "#7dd3fc", textAlign: "center", marginBottom: 10, position: "relative", zIndex: 20, textTransform: "uppercase" }}>
          {hoveredGame ? GAMES_META.find((g) => g.id === hoveredGame)?.title : "choose your game"}
        </p>
        <div style={{ width: "100%", height: 460, perspective: 1200, position: "relative", zIndex: 10 }}>
          {GAMES_META.map((g, i) => (
            <CarouselCard key={g.id} g={g} index={i} onEnter={setActiveGame} onHover={setHoveredGame} />
          ))}
        </div>
        <p style={{ fontSize: "0.58rem", color: "#1e293b", letterSpacing: "0.25em", textTransform: "uppercase", marginTop: 8, position: "relative", zIndex: 10 }}>hover to pause · click to enter</p>
      </div>

      {/* GAME OVERLAY */}
      {activeGame && (
        <div className="game-overlay-anim" style={{ position: "fixed", inset: 0, zIndex: 100, background: "#020309", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
            <div onClick={() => setActiveGame(null)} style={{ cursor: "pointer", fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#475569", display: "flex", alignItems: "center", gap: 6 }}>← back</div>
            <div style={{ fontFamily: "Georgia,serif", fontSize: "1rem", fontWeight: 700, letterSpacing: "0.1em", color: activeGameMeta?.btnColor }}>{activeGameMeta?.title}</div>
            <div style={{ marginLeft: "auto", fontSize: "0.6rem", letterSpacing: "0.2em", color: "#334155" }}>{activeGameMeta?.tag}</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
            {activeGame === 1 && <MemoryPlayground />}
            {activeGame === 2 && <PrimitiveArena />}
            {activeGame === 3 && <FloatingPointNightmare />}
          </div>
        </div>
      )}
    </div>
  );
}
