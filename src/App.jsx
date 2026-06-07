import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "./Components/Hero";
import HeroJourney from "./Components/HeroJourney";
import Games from "./Components/Games";
import "./App.css";
import Ending from "./Components/Ending";
import AudioManager from "./Components/AudioManager";

gsap.registerPlugin(ScrollTrigger);

// ── Persistent fixed background that morphs color across scroll ──
function PersistentBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    // Wait for all scenes to mount so scroll height is accurate
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Hero → Dead Web: space black → dark blood red
        gsap.to(bgRef.current, {
          backgroundColor: "#0c0101",
          ease: "none",
          scrollTrigger: {
            start: "15% top",
            end: "42% top",
            scrub: 2.5,
          },
        });
        // Dead Web → 10-Day War: blood red → dark amber
        gsap.to(bgRef.current, {
          backgroundColor: "#0d0900",
          ease: "none",
          scrollTrigger: {
            start: "42% top",
            end: "68% top",
            scrub: 2.5,
          },
        });
        // 10-Day War → Game Hub: dark amber → space black
        gsap.to(bgRef.current, {
          backgroundColor: "#020309",
          ease: "none",
          scrollTrigger: {
            start: "68% top",
            end: "88% top",
            scrub: 2.5,
          },
        });
      });
      return () => ctx.revert();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={bgRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        backgroundColor: "#020309",
        pointerEvents: "none",
      }}
    />
  );
}

// ── Single persistent star canvas, never unmounts ──
function PersistentStars() {
  useEffect(() => {
    const canvas = document.getElementById("global-stars");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const stars = Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 1.3 + 0.15,
      a: Math.random() * 0.5 + 0.06,
      da: (Math.random() - 0.5) * 0.002,
    }));

    let raf;
    function tick() {
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.a = Math.max(0.03, Math.min(0.65, s.a + s.da));
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(148,163,184,${s.a.toFixed(2)})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(tick);
    }
    tick();

    // Dim stars during intense scroll zones
    const onScroll = () => {
      const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      canvas.style.opacity = p > 0.18 && p < 0.72 ? "0.25" : "0.65";
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      id="global-stars"
      style={{
        position: "fixed", inset: 0,
        pointerEvents: "none", zIndex: 1,
        opacity: 0.65,
        transition: "opacity 1.2s ease",
      }}
    />
  );
}

// ── Gradient bridge between two scenes — kills hard edges ──
function Bridge({ from = "transparent", to = "transparent", height = 280 }) {
  return (
    <div
      style={{
        position: "relative",
        zIndex: 3,
        height,
        marginTop: -height * 0.55,
        marginBottom: -height * 0.45,
        background: `linear-gradient(to bottom, ${from}, transparent 45%, transparent 55%, ${to})`,
        pointerEvents: "none",
      }}
    />
  );
}

function App() {
  return (
    <div style={{ position: "relative", background: "transparent" }}>
      <PersistentBackground />
      <PersistentStars />
      <div style={{ position: "relative", zIndex: 2 }}>
        <Hero />
        <HeroJourney />
        <Games />
        <Ending />
      </div>

      {/* Fixed — floats above everything */}
      <AudioManager />
    </div>
  );
}

export default App;