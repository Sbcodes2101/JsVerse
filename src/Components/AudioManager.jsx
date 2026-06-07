import { useEffect, useRef, useState } from "react";

const STYLES = `
  @keyframes audioRing {
    0%   { transform: scale(1);   opacity: 0.6; }
    100% { transform: scale(1.9); opacity: 0; }
  }
  .audio-ring   { animation: audioRing 2s ease-out infinite; }
  .audio-ring-2 { animation: audioRing 2s ease-out 0.65s infinite; }

  @keyframes barBounce {
    0%, 100% { transform: scaleY(0.25); }
    50%       { transform: scaleY(1); }
  }
  .eq-bar {
    animation: barBounce var(--dur, 0.8s) ease-in-out infinite;
    animation-delay: var(--delay, 0s);
    transform-origin: bottom;
  }

  @keyframes audioFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .audio-appear { animation: audioFadeIn 0.4s ease forwards; }

  @keyframes pulseGlow {
    0%,100% { box-shadow: 0 0 0 0 rgba(247,223,30,0.0), 0 4px 24px rgba(0,0,0,0.5); }
    50%      { box-shadow: 0 0 0 8px rgba(247,223,30,0.07), 0 4px 24px rgba(0,0,0,0.5); }
  }
  .audio-playing-btn { animation: pulseGlow 2.5s ease-in-out infinite; }
`;

const EQ_BARS = [
  { h: 14, dur: "0.55s", delay: "0s"    },
  { h: 20, dur: "0.38s", delay: "0.08s" },
  { h: 10, dur: "0.68s", delay: "0.18s" },
  { h: 17, dur: "0.48s", delay: "0.04s" },
];

export default function AudioManager() {
  const audioRef  = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume,  setVolume]  = useState(0.5);
  const [showVol, setShowVol] = useState(false);
  const [error,   setError]   = useState(null);
  const [ready,   setReady]   = useState(false);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    setReady(true);
    return () => el.remove();
  }, []);

  // Create audio element — NO Web Audio API wrapping
  // Web Audio API + createMediaElementSource causes issues in some setups
  // Plain HTML Audio element is the most reliable
  useEffect(() => {
    const audio = new Audio();
    
    // Try multiple path formats — one of these will work
    // depending on your Vite project structure
    audio.src = "/ambient.mp3";
    
    audio.loop        = true;
    audio.volume      = 0.5;
    audio.preload     = "auto";

    audio.addEventListener("canplaythrough", () => {
      console.log("✅ Audio loaded and ready");
      setError(null);
    });

    audio.addEventListener("error", (e) => {
      console.error("❌ Audio error:", e, audio.error);
      setError(`File error: ${audio.error?.message || "Cannot load /ambient.mp3"}`);
    });

    audio.addEventListener("playing", () => {
      console.log("▶️ Audio is playing");
    });

    audioRef.current = audio;
    
    // Try to load
    audio.load();

    return () => {
      audio.pause();
      audio.src = "";
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      // Set volume before playing
      audio.volume = volume;
      
      try {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          await playPromise;
          setPlaying(true);
          setError(null);
          console.log("✅ Playing successfully");
        }
      } catch (err) {
        console.error("❌ Play failed:", err.name, err.message);
        setError(`Play failed: ${err.message}`);
      }
    }
  }

  function onVolumeChange(e) {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (audioRef.current) {
      audioRef.current.volume = v;
    }
  }

  if (!ready) return null;

  return (
    <div
      className="audio-appear"
      style={{
        position:      "fixed",
        bottom:        "28px",
        right:         "28px",
        zIndex:        9997,
        display:       "flex",
        flexDirection: "column",
        alignItems:    "flex-end",
        gap:           "10px",
        fontFamily:    "'Space Grotesk', sans-serif",
        userSelect:    "none",
      }}
    >
      {/* Error message — shows what's wrong */}
      {error && (
        <div style={{
          background:   "rgba(220,38,38,0.15)",
          border:       "1px solid rgba(220,38,38,0.4)",
          borderRadius: "8px",
          padding:      "8px 12px",
          fontSize:     "0.62rem",
          color:        "#fca5a5",
          maxWidth:     "220px",
          lineHeight:   1.5,
        }}>
          ⚠️ {error}
          <br />
          <span style={{ color: "rgba(252,165,165,0.6)", fontSize: "0.56rem" }}>
            Check: /public/ambient.mp3 exists?
          </span>
        </div>
      )}

      {/* Volume panel */}
      {showVol && (
        <div style={{
          background:     "rgba(2,3,9,0.94)",
          border:         "1px solid rgba(247,223,30,0.18)",
          borderRadius:   "14px",
          padding:        "14px 16px",
          backdropFilter: "blur(16px)",
          display:        "flex",
          flexDirection:  "column",
          alignItems:     "center",
          gap:            "8px",
        }}>
          <span style={{ fontSize: "0.56rem", color: "rgba(247,223,30,0.45)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
            Volume
          </span>
          <input
            type="range"
            min="0" max="1" step="0.01"
            value={volume}
            onChange={onVolumeChange}
            style={{
              writingMode:      "vertical-lr",
              direction:        "rtl",
              height:           "80px",
              width:            "20px",
              accentColor:      "#f7df1e",
              cursor:           "pointer",
              WebkitAppearance: "slider-vertical",
            }}
          />
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(148,163,184,0.5)" }}>
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Now playing label */}
      {playing && (
        <div style={{
          background:     "rgba(2,3,9,0.88)",
          border:         "1px solid rgba(247,223,30,0.12)",
          borderRadius:   "8px",
          padding:        "6px 12px",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ fontSize: "0.56rem", color: "rgba(247,223,30,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "2px" }}>
            Now Playing
          </div>
          <div style={{ fontSize: "0.66rem", color: "rgba(203,213,225,0.85)" }}>
            Hans Zimmer — Time
          </div>
          <div style={{ fontSize: "0.58rem", color: "rgba(100,116,139,0.5)" }}>
            Inception Extended Suite
          </div>
        </div>
      )}

      {/* Main button */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {playing && (
          <>
            <div className="audio-ring" style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "1px solid rgba(247,223,30,0.35)", pointerEvents: "none" }} />
            <div className="audio-ring-2" style={{ position: "absolute", inset: -10, borderRadius: "50%", border: "1px solid rgba(247,223,30,0.18)", pointerEvents: "none" }} />
          </>
        )}

        <button
          onClick={toggle}
          onMouseEnter={() => setShowVol(true)}
          onMouseLeave={() => setShowVol(false)}
          className={playing ? "audio-playing-btn" : ""}
          title={playing ? "Pause music" : "Play — Hans Zimmer: Time"}
          style={{
            width:          "52px",
            height:         "52px",
            borderRadius:   "50%",
            border:         `1px solid ${playing ? "rgba(247,223,30,0.45)" : "rgba(255,255,255,0.1)"}`,
            background:     playing ? "rgba(247,223,30,0.07)" : "rgba(2,3,9,0.85)",
            backdropFilter: "blur(18px)",
            cursor:         "pointer",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            transition:     "border-color 0.3s, background 0.3s",
            outline:        "none",
          }}
        >
          {playing ? (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "3px", height: "20px" }}>
              {EQ_BARS.map((bar, i) => (
                <div key={i} className="eq-bar" style={{
                  width: "3px", height: `${bar.h}px`, borderRadius: "2px",
                  background: "#f7df1e", "--dur": bar.dur, "--delay": bar.delay,
                }} />
              ))}
            </div>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="rgba(148,163,184,0.65)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}