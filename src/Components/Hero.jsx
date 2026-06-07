import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { AdditiveBlending, Color } from "three";
import { gsap } from "gsap";

const headlineWords = ["Before", "JavaScript,", "The", "Web", "Was", "Dead"];

const StarField = ({ pointer }) => {
  const starsRef = useRef(null);
  const dustRef = useRef(null);
  const ringRef = useRef(null);

  const stars = useMemo(() => {
    const count = 2200;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const white = new Color("#e8fbff");
    const cyan = new Color("#38d5ff");
    const gold = new Color("#ffd166");

    for (let i = 0; i < count; i += 1) {
      const radius = 18 + Math.random() * 72;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const color = Math.random() > 0.84 ? gold : Math.random() > 0.42 ? white : cyan;

      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      positions[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      positions[i * 3 + 2] = Math.cos(phi) * radius - 42;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    return { positions, colors };
  }, []);

  const dust = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = -8 - Math.random() * 28;
    }

    return positions;
  }, []);

  useFrame(({ clock, camera }) => {
    const elapsed = clock.getElapsedTime();
    const targetX = pointer.current.x * 0.45;
    const targetY = pointer.current.y * 0.3;

    camera.position.x += (targetX - camera.position.x) * 0.018;
    camera.position.y += (-targetY - camera.position.y) * 0.018;
    camera.lookAt(0, 0, -24);

    if (starsRef.current) {
      starsRef.current.rotation.y = elapsed * 0.012 + pointer.current.x * 0.035;
      starsRef.current.rotation.x = pointer.current.y * 0.02;
      starsRef.current.position.z = Math.sin(elapsed * 0.18) * 0.9;
    }

    if (dustRef.current) {
      dustRef.current.rotation.y = -elapsed * 0.018;
      dustRef.current.position.x = pointer.current.x * 0.16;
      dustRef.current.position.y = -pointer.current.y * 0.12;
    }

    if (ringRef.current) {
      ringRef.current.rotation.z = elapsed * 0.06;
      ringRef.current.position.x = pointer.current.x * 0.35;
      ringRef.current.position.y = -pointer.current.y * 0.25;
    }
  });

  return (
    <>
      <fog attach="fog" args={["#03050b", 16, 82]} />
      <ambientLight intensity={0.35} />
      <pointLight position={[0, 0, 4]} intensity={1.3} color="#67e8f9" />
      <pointLight position={[-7, 4, -8]} intensity={1.8} color="#facc15" />

      <points ref={starsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={stars.positions.length / 3}
            array={stars.positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={stars.colors.length / 3}
            array={stars.colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          vertexColors
          size={0.045}
          sizeAttenuation
          transparent
          opacity={0.86}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={dust.length / 3}
            array={dust}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color="#9eefff"
          size={0.025}
          sizeAttenuation
          transparent
          opacity={0.32}
          blending={AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <mesh ref={ringRef} position={[0, 0, -18]}>
        <torusGeometry args={[7.5, 0.018, 12, 160]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.12} blending={AdditiveBlending} />
      </mesh>
    </>
  );
};

const Hero = () => {
  const sectionRef = useRef(null);
  const headlineRef = useRef(null);
  const subheadingRef = useRef(null);
  const labelRef = useRef(null);
  const indicatorRef = useRef(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const [isHeadlineHovered, setIsHeadlineHovered] = useState(false);
  const [spotlight, setSpotlight] = useState({
    sceneX: "50%",
    sceneY: "45%",
    textX: "50%",
    textY: "50%",
  });

  useEffect(() => {
    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power4.out" } });

      timeline
        .from(labelRef.current, {
          y: 18,
          opacity: 0,
          duration: 0.9,
        })
        .fromTo(
          ".hero-word",
          {
            y: 96,
            z: -420,
            rotateX: 68,
            rotateY: "random(-18, 18)",
            opacity: 0,
            filter: "blur(22px)",
            transformOrigin: "50% 50% -120px",
          },
          {
            y: 0,
            z: 0,
            rotateX: 0,
            rotateY: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 1.35,
            stagger: {
              amount: 0.55,
              from: "center",
            },
          },
          "-=0.38"
        )
        .from(
          subheadingRef.current,
          {
            y: 28,
            opacity: 0,
            filter: "blur(8px)",
            duration: 1,
          },
          "-=0.65"
        )
        .from(
          indicatorRef.current,
          {
            y: -12,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.35"
        );

      gsap.to(indicatorRef.current, {
        y: 10,
        duration: 1.25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handlePointerMove = (event) => {
    if (!sectionRef.current || !headlineRef.current) return;

    const sectionRect = sectionRef.current.getBoundingClientRect();
    const headlineRect = headlineRef.current.getBoundingClientRect();
    const x = ((event.clientX - sectionRect.left) / sectionRect.width) * 100;
    const y = ((event.clientY - sectionRect.top) / sectionRect.height) * 100;
    const textX = ((event.clientX - headlineRect.left) / headlineRect.width) * 100;
    const textY = ((event.clientY - headlineRect.top) / headlineRect.height) * 100;
    const normalizedX = (x / 100 - 0.5) * 2;
    const normalizedY = (y / 100 - 0.5) * 2;

    pointerRef.current.x = normalizedX;
    pointerRef.current.y = normalizedY;
    setSpotlight({
      sceneX: `${x}%`,
      sceneY: `${y}%`,
      textX: `${textX}%`,
      textY: `${textY}%`,
    });

    gsap.to(headlineRef.current, {
      x: normalizedX * 18,
      y: normalizedY * 10,
      rotateY: normalizedX * 3.5,
      rotateX: -normalizedY * 2.5,
      duration: 0.7,
      ease: "power3.out",
    });
  };

  const headlineClass =
    "flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-5xl font-black uppercase leading-[0.84] tracking-normal sm:gap-x-5 sm:text-7xl md:text-8xl lg:text-9xl";

  return (
    <section
      ref={sectionRef}
      onPointerMove={handlePointerMove}
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#020309] px-5 py-20 text-white sm:px-8"
    >
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 7], fov: 62 }} dpr={[1, 1.6]}>
          <StarField pointer={pointerRef} />
        </Canvas>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(20,184,166,0.18),transparent_28%),radial-gradient(circle_at_50%_80%,rgba(250,204,21,0.09),transparent_34%),linear-gradient(180deg,rgba(2,3,9,0.18),rgba(2,3,9,0.72)_68%,rgba(0,0,0,0.96))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.7)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_center,rgba(255,255,255,0.9)_0.6px,transparent_0.8px)] [background-size:6px_6px]" />

      <div
        className="pointer-events-none absolute inset-0 mix-blend-screen transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 190px at ${spotlight.sceneX} ${spotlight.sceneY}, rgba(103,232,249,0.34), rgba(34,211,238,0.12) 28%, transparent 62%)`,
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl text-center">
        <p
          ref={labelRef}
          className="mb-6 font-[Inter,system-ui,sans-serif] text-[10px] font-semibold uppercase tracking-[0.44em] text-cyan-100/75 sm:mb-8 sm:text-xs"
        >
          JSVerse / Origin Transmission
        </p>

        <div
          ref={headlineRef}
          onPointerEnter={() => setIsHeadlineHovered(true)}
          onPointerLeave={() => setIsHeadlineHovered(false)}
          className="relative mx-auto max-w-6xl [perspective:1400px] [transform-style:preserve-3d]"
          style={{
            fontFamily:
              '"Space Grotesk", "Sora", "Clash Display", "Cabinet Grotesk", Inter, system-ui, sans-serif',
          }}
        >
          <h1 className={headlineClass} aria-label="Before JavaScript, The Web Was Dead">
            {headlineWords.map((word, index) => (
              <span key={word} className="hero-word relative inline-block text-slate-600/75 drop-shadow-[0_0_28px_rgba(15,23,42,0.95)]">
                {word}
                {index === 1 && (
                  <span className="absolute -bottom-2 left-1/2 h-px w-[92%] -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
                )}
              </span>
            ))}
          </h1>

          <div
            className={`${headlineClass} pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-cyan-100 to-cyan-300 bg-clip-text text-transparent`}
            style={{
              WebkitMaskImage: `radial-gradient(circle 240px at ${spotlight.textX} ${spotlight.textY}, black 0%, black 32%, transparent 70%)`,
              maskImage: `radial-gradient(circle 240px at ${spotlight.textX} ${spotlight.textY}, black 0%, black 32%, transparent 70%)`,
              opacity: isHeadlineHovered ? 1 : 0,
              filter: "drop-shadow(0 0 28px rgba(34,211,238,0.72))",
            }}
            aria-hidden="true"
          >
            {headlineWords.map((word) => (
              <span key={word} className="inline-block">
                {word}
              </span>
            ))}
          </div>
        </div>

        <p
          ref={subheadingRef}
          className="mx-auto mt-8 max-w-2xl font-[Inter,system-ui,sans-serif] text-base leading-8 text-slate-300/90 sm:mt-10 sm:text-lg md:text-xl"
        >
          Pages could display words and images, but they could not listen,
          react, move, or remember.
        </p>
      </div>

      <div
        ref={indicatorRef}
        className="absolute bottom-7 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-3 text-cyan-100/70"
        aria-hidden="true"
      >
        <span className="font-[Inter,system-ui,sans-serif] text-[10px] font-semibold uppercase tracking-[0.36em]">
          Scroll
        </span>
        <span className="flex h-11 w-6 justify-center rounded-full border border-cyan-100/30 p-1">
          <span className="h-2 w-1 rounded-full bg-cyan-100 shadow-[0_0_14px_rgba(207,250,254,0.9)]" />
        </span>
      </div>
    </section>
  );
};

export default Hero;
