import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const titleBeats = [
  "The Web Existed.",
  "But It Wasn't Alive.",
  "It Could Display.",
  "It Could Not React.",
];

const uiArtifacts = [
  {
    label: "Button",
    className: "left-[8%] top-[34%] sm:left-[15%]",
    element: (
      <button className="cursor-not-allowed rounded-full border border-cyan-100/20 bg-cyan-100/5 px-8 py-4 font-[Inter,system-ui,sans-serif] text-sm font-semibold uppercase tracking-[0.28em] text-cyan-50/50 shadow-[0_0_50px_rgba(34,211,238,0.16)] backdrop-blur-xl">
        Button
      </button>
    ),
  },
  {
    label: "Input Field",
    className: "right-[6%] top-[31%] sm:right-[13%]",
    element: (
      <div className="w-64 rounded-full border border-cyan-100/20 bg-white/[0.035] px-5 py-4 font-[Inter,system-ui,sans-serif] text-sm text-slate-400/55 shadow-[0_0_50px_rgba(34,211,238,0.12)] backdrop-blur-xl">
        Input field
      </div>
    ),
  },
  {
    label: "Image",
    className: "left-[10%] bottom-[22%] sm:left-[19%]",
    element: (
      <div className="grid h-36 w-48 place-items-center rounded-xl border border-cyan-100/20 bg-gradient-to-br from-cyan-100/[0.08] via-slate-900/50 to-black/70 shadow-[0_0_60px_rgba(20,184,166,0.16)] backdrop-blur-xl">
        <div className="h-14 w-20 rounded-md border border-cyan-100/20 bg-cyan-100/5" />
      </div>
    ),
  },
  {
    label: "Form",
    className: "right-[8%] bottom-[18%] sm:right-[18%]",
    element: (
      <div className="w-72 rounded-2xl border border-cyan-100/20 bg-slate-950/45 p-5 shadow-[0_0_70px_rgba(34,211,238,0.14)] backdrop-blur-xl">
        <div className="mb-4 h-10 rounded-full border border-cyan-100/15 bg-white/[0.035]" />
        <div className="h-11 w-28 rounded-full border border-cyan-100/15 bg-cyan-100/[0.05]" />
      </div>
    ),
  },
];

const BrowserWars = () => {
  const rootRef = useRef(null);
  const sceneRef = useRef(null);
  const universeRef = useRef(null);
  const darknessRef = useRef(null);
  const yearRef = useRef(null);
  const beatRefs = useRef([]);
  const artifactRefs = useRef([]);
  const dustRefs = useRef([]);
  const splitParticleRefs = useRef([]);

  const dustParticles = useMemo(
    () =>
      Array.from({ length: 76 }, (_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: `${Math.random() * 3 + 1}px`,
        opacity: Math.random() * 0.44 + 0.12,
      })),
    []
  );

  const splitParticles = useMemo(
    () =>
      Array.from({ length: 150 }, (_, index) => {
        const group = index % 3;
        const targets = [
          { x: -34, y: 20 },
          { x: 0, y: -18 },
          { x: 34, y: 20 },
        ];

        return {
          id: index,
          size: Math.random() * 4 + 2,
          originX: (Math.random() - 0.5) * 360,
          originY: (Math.random() - 0.5) * 180,
          driftX: (Math.random() - 0.5) * 720,
          driftY: (Math.random() - 0.5) * 420,
          targetX: targets[group].x * 10 + (Math.random() - 0.5) * 130,
          targetY: targets[group].y * 8 + (Math.random() - 0.5) * 95,
        };
      }),
    []
  );

  useEffect(() => {
    const ctx = gsap.context(() => {
      const dustFloat = gsap.to(dustRefs.current, {
        x: "random(-28, 28)",
        y: "random(-36, 36)",
        opacity: "random(0.12, 0.58)",
        duration: "random(5, 9)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: {
          amount: 2.2,
          from: "random",
        },
      });

      gsap.set(beatRefs.current, {
        opacity: 0,
        y: 34,
        filter: "blur(14px)",
      });
      gsap.set(artifactRefs.current, {
        opacity: 0,
        y: 46,
        scale: 0.92,
        filter: "blur(18px)",
      });
      gsap.set(splitParticleRefs.current, {
        opacity: 0,
        x: (index) => splitParticles[index].originX,
        y: (index) => splitParticles[index].originY,
        scale: 0.45,
      });

      const timeline = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        scrollTrigger: {
          trigger: sceneRef.current,
          start: "top top",
          end: "+=4400",
          scrub: 1.2,
          pin: true,
        },
      });

      timeline
        .from(yearRef.current, {
          opacity: 0,
          y: 56,
          scale: 0.82,
          filter: "blur(24px)",
          duration: 1,
        })
        .to(
          universeRef.current,
          {
            scale: 1.1,
            x: -28,
            y: 18,
            duration: 5.2,
          },
          0
        )
        .to(
          darknessRef.current,
          {
            opacity: 0.82,
            duration: 1.1,
          },
          0.35
        )
        .to(
          dustFloat,
          {
            timeScale: 0,
            duration: 1.25,
          },
          0.55
        )
        .to(yearRef.current, {
          scale: 1.08,
          opacity: 0.78,
          duration: 0.8,
        })
        .to(beatRefs.current[0], {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.65,
        })
        .to({}, { duration: 0.32 })
        .to(beatRefs.current[0], {
          opacity: 0,
          y: -26,
          filter: "blur(10px)",
          duration: 0.55,
        })
        .to(beatRefs.current[1], {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.75,
        })
        .to(
          artifactRefs.current,
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            stagger: 0.16,
            duration: 1,
          },
          "-=0.25"
        )
        .to({}, { duration: 0.4 })
        .to(artifactRefs.current, {
          opacity: 0.48,
          filter: "grayscale(1) brightness(0.68)",
          duration: 0.7,
        })
        .to(beatRefs.current[1], {
          opacity: 0,
          y: -26,
          filter: "blur(10px)",
          duration: 0.55,
        })
        .to(beatRefs.current[2], {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.65,
        })
        .to({}, { duration: 0.25 })
        .to(beatRefs.current[2], {
          opacity: 0,
          y: -26,
          filter: "blur(10px)",
          duration: 0.55,
        })
        .to(beatRefs.current[3], {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.75,
        })
        .to(
          splitParticleRefs.current,
          {
            opacity: 1,
            scale: 1,
            stagger: {
              each: 0.006,
              from: "random",
            },
            duration: 0.8,
          },
          "-=0.42"
        )
        .to(
          dustFloat,
          {
            timeScale: 0.5,
            duration: 0.8,
          },
          "-=0.2"
        )
        .to(
          artifactRefs.current,
          {
            opacity: 0,
            scale: 0.9,
            filter: "blur(24px) grayscale(1)",
            stagger: 0.06,
            duration: 0.9,
          },
          "-=0.45"
        )
        .to(
          splitParticleRefs.current,
          {
            x: (index) => splitParticles[index].driftX,
            y: (index) => splitParticles[index].driftY,
            scale: 1.2,
            opacity: 0.92,
            stagger: {
              each: 0.004,
              from: "center",
            },
            duration: 1.1,
          },
          "-=0.55"
        )
        .to(beatRefs.current[3], {
          opacity: 0,
          y: -24,
          filter: "blur(10px)",
          duration: 0.5,
        })
        .to(
          splitParticleRefs.current,
          {
            x: (index) => splitParticles[index].targetX,
            y: (index) => splitParticles[index].targetY,
            scale: 0.9,
            opacity: 0.72,
            stagger: {
              each: 0.005,
              from: "random",
            },
            duration: 1.25,
          },
          "-=0.15"
        )
        .to(
          universeRef.current,
          {
            scale: 1.16,
            x: 26,
            y: -18,
            duration: 1.2,
          },
          "-=1"
        );
    }, rootRef);

    return () => ctx.revert();
  }, [splitParticles]);

  const stopInteraction = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <main ref={rootRef} className="bg-[#020309] text-white">
      <section
        ref={sceneRef}
        className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-16"
      >
        <div ref={universeRef} className="absolute inset-[-8%]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(234,179,8,0.12),transparent_32%),radial-gradient(circle_at_18%_74%,rgba(20,184,166,0.16),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.95),rgba(2,6,23,0.9)_45%,rgba(0,0,0,1))]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:64px_64px] opacity-20" />
          <div className="absolute inset-0 opacity-[0.18] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.92)_0.7px,transparent_0.9px)] [background-size:7px_7px]" />
          {dustParticles.map((particle, index) => (
            <span
              key={particle.id}
              ref={(el) => {
                dustRefs.current[index] = el;
              }}
              className="absolute rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.85)]"
              style={{
                left: particle.left,
                top: particle.top,
                width: particle.size,
                height: particle.size,
                opacity: particle.opacity,
              }}
            />
          ))}
        </div>

        <div ref={darknessRef} className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black via-black/75 to-transparent" />

        <div className="relative z-10 h-[min(780px,88vh)] w-full max-w-7xl">
          <p
            ref={yearRef}
            className="absolute left-1/2 top-[12%] -translate-x-1/2 font-['Cinzel',serif] text-[clamp(8rem,22vw,22rem)] font-black leading-none tracking-[0.08em] text-slate-100/90 drop-shadow-[0_0_60px_rgba(103,232,249,0.12)]"
          >
            1993
          </p>

          <div className="absolute inset-0">
            {uiArtifacts.map((artifact, index) => (
              <div
                key={artifact.label}
                ref={(el) => {
                  artifactRefs.current[index] = el;
                }}
                onClick={stopInteraction}
                onPointerDown={stopInteraction}
                className={`absolute ${artifact.className} pointer-events-auto select-none transition duration-300 hover:opacity-70`}
                aria-label={`${artifact.label} does not respond`}
              >
                {artifact.element}
              </div>
            ))}
          </div>

          <div className="pointer-events-none absolute left-1/2 top-1/2">
            {splitParticles.map((particle, index) => (
              <span
                key={particle.id}
                ref={(el) => {
                  splitParticleRefs.current[index] = el;
                }}
                className="absolute rounded-full bg-cyan-100 shadow-[0_0_18px_rgba(103,232,249,0.95)]"
                style={{
                  width: particle.size,
                  height: particle.size,
                }}
              />
            ))}
          </div>

          <div className="absolute bottom-10 left-1/2 w-[min(92vw,980px)] -translate-x-1/2 text-center">
            {titleBeats.map((beat, index) => (
              <p
                key={beat}
                ref={(el) => {
                  beatRefs.current[index] = el;
                }}
                className="absolute inset-x-0 bottom-0 font-['Cinzel',serif] text-[clamp(2.6rem,7vw,7.2rem)] font-bold leading-none tracking-[0.08em] text-slate-100"
              >
                {beat}
              </p>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default BrowserWars;
