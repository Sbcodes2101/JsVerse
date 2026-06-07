import { useEffect, useRef } from "react";
import * as THREE from "three";

function LiquidText({ height = 520, className = "", style = {} }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    function buildCanvas(w, h) {
      const c = document.createElement("canvas");
      c.width = w * window.devicePixelRatio;
      c.height = h * window.devicePixelRatio;
      c.style.width = w + "px";
      c.style.height = h + "px";
      const ctx = c.getContext("2d");
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      

      // ── "The Language" — Cinzel 900, clamp(2.8rem,8vw,7rem)
      // We resolve the clamp: use vw-based size capped
      const titleSize = Math.min(Math.max(w * 0.08, 44.8), 112);
      ctx.save();
      ctx.font = "900 " + titleSize + "px 'Cinzel', serif";
      ctx.fillStyle = "#f7df1e";
      ctx.textAlign = "center";
      // glow
      ctx.shadowColor = "#f7df1e";
      ctx.shadowBlur = 32;
      ctx.fillText("The Language", cx, h * 0.22);
      ctx.shadowBlur = 0;
      ctx.restore();

      // ── "Nobody Took Seriously" — Space Grotesk 300, clamp(1rem,2.5vw,1.8rem)
      const sub1Size = Math.min(Math.max(w * 0.025, 16), 28.8);
      ctx.save();
      ctx.font = "300 " + sub1Size + "px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(148,163,184,0.75)";
      ctx.textAlign = "center";
      // letter-spacing 0.3em — canvas doesn't support it natively, simulate with fillText spacing
      drawSpacedText(ctx, "NOBODY TOOK SERIOUSLY", cx, h * 0.22 + titleSize * 1.1, sub1Size * 0.3);
      ctx.restore();

      // ── "Runs Everything." — Space Grotesk 300, clamp(1rem,2vw,1.4rem)
      const sub2Size = Math.min(Math.max(w * 0.02, 16), 22.4);
      ctx.save();
      ctx.font = "300 " + sub2Size + "px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(100,116,139,0.65)";
      ctx.textAlign = "center";
      drawSpacedText(ctx, "RUNS EVERYTHING.", cx, h * 0.22 + titleSize * 1.1 + sub1Size * 1.7, sub2Size * 0.5);
      ctx.restore();

      // ── subtitle paragraph — Space Grotesk 300, clamp(0.85rem,1.5vw,1.05rem)
      const pSize = Math.min(Math.max(w * 0.015, 13.6), 16.8);
      ctx.save();
      ctx.font = "300 " + pSize + "px 'Space Grotesk', sans-serif";
      ctx.fillStyle = "rgba(100,116,139,0.75)";
      ctx.textAlign = "center";
      const pY = h * 0.22 + titleSize * 1.1 + sub1Size * 1.7 + sub2Size * 2.0;
      drawSpacedText(ctx, "BUILT IN 10 DAYS. DEPLOYED FOR 30 YEARS.", cx, pY, pSize * 0.18);
      drawSpacedText(ctx, "NOW IT'S YOUR TURN.", cx, pY + pSize * 1.9, pSize * 0.18);
      ctx.restore();

      return c;
    }

    // helper: simulate letter-spacing by measuring + offsetting each char
    function drawSpacedText(ctx, text, cx, y, extraSpacing) {
      const chars = text.split("");
      const widths = chars.map((ch) => ctx.measureText(ch).width);
      const total  = widths.reduce((a, b) => a + b, 0) + extraSpacing * (chars.length - 1);
      let x = cx - total / 2;
      chars.forEach((ch, i) => {
        ctx.fillText(ch, x + widths[i] / 2, y);
        x += widths[i] + extraSpacing;
      });
    }

    // ── Three.js setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene  = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    let w = mount.clientWidth || 900;
    const h = height;
    renderer.setSize(w, h);

    // wait one frame for fonts to be ready
    let textTexture;
    const initTexture = () => {
      const tc = buildCanvas(w, h);
      textTexture = new THREE.CanvasTexture(tc);
      textTexture.needsUpdate = true;
      material.uniforms.uTexture.value = textTexture;
    };

    const vShader = [
      "varying vec2 vUv;",
      "void main(){",
      "  vUv=uv;",
      "  gl_Position=vec4(position,1.0);",
      "}"
    ].join("\n");

    const fShader = [
      "precision highp float;",
      "uniform sampler2D uTexture;",
      "uniform float uTime;",
      "uniform vec2 uMouse;",
      "uniform vec2 uMouseVel;",
      "uniform float uForce;",
      "uniform vec2 uResolution;",
      "varying vec2 vUv;",

      "vec2 hash2(vec2 p){",
      "  p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));",
      "  return -1.0+2.0*fract(sin(p)*43758.5453);",
      "}",
      "float noise(vec2 p){",
      "  vec2 i=floor(p);vec2 f=fract(p);",
      "  vec2 u=f*f*(3.0-2.0*f);",
      "  return mix(",
      "    mix(dot(hash2(i+vec2(0,0)),f-vec2(0,0)),dot(hash2(i+vec2(1,0)),f-vec2(1,0)),u.x),",
      "    mix(dot(hash2(i+vec2(0,1)),f-vec2(0,1)),dot(hash2(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y);",
      "}",
      "float fbm(vec2 p){",
      "  float v=0.0,a=0.5;",
      "  for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(1.7,9.2);a*=0.5;}",
      "  return v;",
      "}",

      "void main(){",
      "  vec2 uv=vUv;",
      "  float ar=uResolution.x/uResolution.y;",
      // mouse warp
      "  vec2 toMouse=uv-uMouse;",
      "  toMouse.x*=ar;",
      "  float md=length(toMouse);",
      "  float pull=uForce*0.04/(md*9.0+0.15);",
      "  vec2 mw=normalize(toMouse+0.001)*pull*(1.0-smoothstep(0.0,0.4,md));",
      "  mw+=uMouseVel*0.02*uForce*(1.0-smoothstep(0.0,0.25,md));",
      // noise warp
      "  float t=uTime*0.18;",
      "  vec2 np=uv*vec2(3.0,5.0)+vec2(t*0.35,t*0.28);",
      "  float nx=fbm(np);",
      "  float ny=fbm(np+vec2(3.2,1.7));",
      "  vec2 bw=vec2(nx,ny)*(0.007+uForce*0.005);",
      "  vec2 wuv=uv+bw+mw;",
      // chromatic aberration
      "  float ca=0.002+uForce*0.005+length(uMouseVel)*0.007*uForce;",
      "  vec2 sd=normalize(toMouse+vec2(0.001));",
      "  sd=vec2(-sd.y,sd.x);",
      "  sd=normalize(sd*0.65+normalize(vec2(nx,ny)+0.001)*0.35);",
      "  float r=texture2D(uTexture,wuv+sd*ca).r;",
      "  float g=texture2D(uTexture,wuv).g;",
      "  float b=texture2D(uTexture,wuv-sd*ca).b;",
      "  float aR=texture2D(uTexture,wuv+sd*ca).a;",
      "  float aG=texture2D(uTexture,wuv).a;",
      "  float aB=texture2D(uTexture,wuv-sd*ca).a;",
      "  float af=max(max(aR,aG),aB);",
      // scanline + vignette
      "  float scan=sin(uv.y*uResolution.y*1.5)*0.012+1.0;",
      "  float vig=smoothstep(0.0,0.2,uv.x)*smoothstep(1.0,0.8,uv.x)",
      "           *smoothstep(0.0,0.08,uv.y)*smoothstep(1.0,0.92,uv.y);",
      "  vec4 col=vec4(r,g,b,af)*scan;",
      "  col.rgb*=(0.9+vig*0.1);",
      "  gl_FragColor=col;",
      "}"
    ].join("\n");

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture:    { value: null },
        uTime:       { value: 0 },
        uMouse:      { value: new THREE.Vector2(0.5, 0.5) },
        uMouseVel:   { value: new THREE.Vector2(0, 0) },
        uForce:      { value: 0 },
        uResolution: { value: new THREE.Vector2(w, h) },
      },
      vertexShader: vShader,
      fragmentShader: fShader,
      transparent: true,
    });

    const geo = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geo, material));

    // init texture after fonts load
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initTexture);
    } else {
      setTimeout(initTexture, 400);
    }

    // mouse
    const mouse = { x: 0.5, y: 0.5, vx: 0, vy: 0, px: 0.5, py: 0.5 };
    let isInside = false;
    const onMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const cx = (e.clientX - rect.left) / rect.width;
      const cy = 1 - (e.clientY - rect.top) / rect.height;
      mouse.vx = cx - mouse.px; mouse.vy = cy - mouse.py;
      mouse.px = cx; mouse.py = cy;
      mouse.x = cx; mouse.y = cy;
    };
    const onEnter = () => { isInside = true; };
    const onLeave = () => { isInside = false; };
    mount.addEventListener("mousemove", onMove);
    mount.addEventListener("mouseenter", onEnter);
    mount.addEventListener("mouseleave", onLeave);

    // resize
    const ro = new ResizeObserver(() => {
      w = mount.clientWidth || 900;
      renderer.setSize(w, h);
      material.uniforms.uResolution.value.set(w, h);
      if (textTexture) { textTexture.dispose(); }
      const nc = buildCanvas(w, h);
      textTexture = new THREE.CanvasTexture(nc);
      material.uniforms.uTexture.value = textTexture;
    });
    ro.observe(mount);

    let raf, time = 0, force = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      time += 0.016;
      force += ((isInside ? 1 : 0) - force) * 0.06;
      const u = material.uniforms;
      u.uMouse.value.x += (mouse.x - u.uMouse.value.x) * 0.08;
      u.uMouse.value.y += (mouse.y - u.uMouse.value.y) * 0.08;
      mouse.vx *= 0.85; mouse.vy *= 0.85;
      u.uMouseVel.value.set(mouse.vx, mouse.vy);
      u.uTime.value = time;
      u.uForce.value = force;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener("mousemove", onMove);
      mount.removeEventListener("mouseenter", onEnter);
      mount.removeEventListener("mouseleave", onLeave);
      renderer.dispose();
      geo.dispose();
      material.dispose();
      if (textTexture) textTexture.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [height]);

  return (
    <div
      ref={mountRef}
      className={className}
      style={{ width: "100%", height: height + "px", cursor: "crosshair", ...style }}
    />
  );
}

export { LiquidText };
export default LiquidText;