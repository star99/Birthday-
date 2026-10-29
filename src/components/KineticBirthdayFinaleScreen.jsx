import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';

/**
 * KineticBirthdayFinaleScreen
 * 
 * Inspired by the iconic Dribbble kinetic typography motion design ("ooooh myyy goood"):
 * - Technical motion graphic framing: corner viewfinders (┌ ┐ └ ┘), crosshairs (+), grid markers, timecodes.
 * - Digital date counter: "04:11:2026" with animated ticker and pulsing glow.
 * - First line: "HAPPY 21ST BDAY" with staggered kinetic slide-up, letter stretch, and spring easing.
 * - Second line: "PRINCESS" centered prominently with royal crown accent, explosive drop, and continuous hypnotic liquid wave animation.
 * - Celestial Web Audio API chime chord & golden sparkle confetti on reveal.
 * - Smooth replay & return navigation controls.
 */
export default function KineticBirthdayFinaleScreen({ onBack }) {
  const [animationKey, setAnimationKey] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const audioCtxRef = useRef(null);

  // Play harmonious celestial chime chord on entry / replay
  const playChimeChord = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = audioCtxRef.current || new AudioCtx();
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Harmonic frequencies for a magical celebration chord (Eb major 9 / sparkles)
      const freqs = [311.13, 392.00, 466.16, 587.33, 698.46, 932.33];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Staggered arpeggiated sparkle
        const startTime = ctx.currentTime + idx * 0.08;
        gain.gain.setValueAtTime(0.001, startTime);
        gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 1.9);
      });
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Trigger celebration confetti burst
  const triggerCelebration = useCallback(() => {
    try {
      // Rose gold and royal champagne confetti
      confetti({
        particleCount: 70,
        spread: 90,
        origin: { y: 0.55, x: 0.5 },
        colors: ['#f472b6', '#fb7185', '#fbbf24', '#e879f9', '#ffffff', '#ffd166'],
        shapes: ['circle', 'square'],
        scalar: 1.1,
      });

      // Side sparkle blasts
      setTimeout(() => {
        confetti({
          particleCount: 40,
          angle: 60,
          spread: 60,
          origin: { x: 0.15, y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#f59e0b', '#fff'],
        });
        confetti({
          particleCount: 40,
          angle: 120,
          spread: 60,
          origin: { x: 0.85, y: 0.6 },
          colors: ['#f43f5e', '#ec4899', '#f59e0b', '#fff'],
        });
      }, 350);
    } catch {}
  }, []);

  // Run animation sequence on mount and replay
  useEffect(() => {
    const timer = setTimeout(() => {
      playChimeChord();
      triggerCelebration();
    }, 450);

    return () => clearTimeout(timer);
  }, [animationKey, playChimeChord, triggerCelebration]);

  const handleReplay = () => {
    setAnimationKey(prev => prev + 1);
  };

  // Letters array for Line 1: "HAPPY 21ST BDAY"
  const line1Text = "HAPPY 21ST BDAY";
  const line1Words = line1Text.split(" ");

  // Letters array for Line 2: "PRINCESS"
  const line2Letters = "PRINCESS".split("");

  // Floating background sparkles
  const backgroundDust = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 94 + 3,
      top: Math.random() * 90 + 5,
      size: Math.random() * 8 + 4,
      dur: (Math.random() * 6 + 5).toFixed(1),
      delay: (Math.random() * 4).toFixed(1),
      opacity: (Math.random() * 0.5 + 0.3).toFixed(2),
      char: ['✦', '★', '✧', '⋆', '•', '✨', '💖'][Math.floor(Math.random() * 7)],
    }));
  }, []);

  return (
    <div key={animationKey} className="kinetic-finale-wrapper">
      <style>{`
        .kinetic-finale-wrapper {
          position: fixed;
          inset: 0;
          z-index: 99999;
          background: radial-gradient(circle at 50% 45%, #2a0820 0%, #150312 55%, #080108 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          font-family: 'Poppins', -apple-system, sans-serif;
          color: #ffffff;
          user-select: none;
          animation: finaleFadeIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes finaleFadeIn {
          from { opacity: 0; transform: scale(1.04); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Ambient glowing background orbs */
        .ambient-glow-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          opacity: 0.35;
          animation: orbBreathe 8s ease-in-out infinite alternate;
        }
        .orb-1 {
          width: 450px;
          height: 450px;
          background: #ec4899;
          top: 15%;
          left: 15%;
        }
        .orb-2 {
          width: 500px;
          height: 500px;
          background: #f59e0b;
          bottom: 10%;
          right: 15%;
          animation-delay: -3s;
        }
        .orb-3 {
          width: 320px;
          height: 320px;
          background: #a855f7;
          top: 40%;
          right: 25%;
          animation-delay: -5s;
        }

        @keyframes orbBreathe {
          0% { transform: scale(0.9) translate(0, 0); opacity: 0.28; }
          100% { transform: scale(1.15) translate(20px, -20px); opacity: 0.45; }
        }

        /* Technical Viewfinder Frame */
        .viewfinder-outer-frame {
          position: relative;
          width: min(92vw, 1020px);
          height: min(88vh, 680px);
          border: 1px solid rgba(244, 114, 182, 0.25);
          border-radius: 16px;
          box-shadow: 
            0 0 50px rgba(244, 114, 182, 0.12),
            inset 0 0 40px rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px;
          box-sizing: border-box;
          backdrop-filter: blur(12px);
          background: rgba(20, 4, 16, 0.45);
          animation: frameSnap 0.85s cubic-bezier(0.19, 1, 0.22, 1) forwards;
        }

        @keyframes frameSnap {
          0% { transform: scale(0.92); opacity: 0; border-color: rgba(244, 114, 182, 0.8); }
          60% { border-color: rgba(251, 191, 36, 0.7); }
          100% { transform: scale(1); opacity: 1; border-color: rgba(244, 114, 182, 0.25); }
        }

        /* Viewfinder corner brackets (┌ ┐ └ ┘) */
        .corner-bracket {
          position: absolute;
          width: 26px;
          height: 26px;
          border-color: #f472b6;
          border-style: solid;
          pointer-events: none;
          filter: drop-shadow(0 0 6px rgba(244, 114, 182, 0.6));
        }
        .bracket-tl { top: -2px; left: -2px; border-width: 3px 0 0 3px; border-top-left-radius: 12px; }
        .bracket-tr { top: -2px; right: -2px; border-width: 3px 3px 0 0; border-top-right-radius: 12px; }
        .bracket-bl { bottom: -2px; left: -2px; border-width: 0 0 3px 3px; border-bottom-left-radius: 12px; }
        .bracket-br { bottom: -2px; right: -2px; border-width: 0 3px 3px 0; border-bottom-right-radius: 12px; }

        /* Crosshairs & Center alignment ticks */
        .crosshair-center {
          position: absolute;
          width: 22px;
          height: 22px;
          pointer-events: none;
          opacity: 0.4;
        }
        .crosshair-center::before, .crosshair-center::after {
          content: '';
          position: absolute;
          background: #f472b6;
        }
        .crosshair-center::before { top: 10px; left: 0; width: 22px; height: 1.5px; }
        .crosshair-center::after { top: 0; left: 10px; width: 1.5px; height: 22px; }
        .ch-left { top: 50%; left: 12px; transform: translateY(-50%); }
        .ch-right { top: 50%; right: 12px; transform: translateY(-50%); }
        .ch-top { top: 12px; left: 50%; transform: translateX(-50%); }
        .ch-bottom { bottom: 12px; left: 50%; transform: translateX(-50%); }

        /* Technical Frame Header Bar */
        .frame-header-bar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Poppins', monospace;
          font-size: clamp(10px, 1.8vw, 12px);
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.7);
          border-bottom: 1px solid rgba(244, 114, 182, 0.15);
          padding-bottom: 12px;
        }

        .rec-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #fb7185;
          font-weight: 600;
        }
        .rec-dot {
          width: 8px;
          height: 8px;
          background: #f43f5e;
          border-radius: 50%;
          animation: recBlink 1.2s infinite;
          box-shadow: 0 0 8px #f43f5e;
        }
        @keyframes recBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.2; }
        }

        .header-title-badge {
          background: rgba(244, 114, 182, 0.12);
          border: 1px solid rgba(244, 114, 182, 0.3);
          padding: 3px 12px;
          border-radius: 20px;
          color: #fbcfe8;
          font-size: clamp(9px, 1.5vw, 11px);
        }

        /* Center Content Showcase */
        .kinetic-center-showcase {
          width: 100%;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          z-index: 10;
        }

        /* Floating Crown Accent */
        .floating-royal-crown {
          font-size: clamp(34px, 6vw, 54px);
          margin-bottom: 6px;
          filter: drop-shadow(0 0 16px rgba(251, 191, 36, 0.8)) drop-shadow(0 0 30px rgba(244, 114, 182, 0.5));
          animation: crownFloat 3s ease-in-out infinite;
          transform-origin: center bottom;
        }

        @keyframes crownFloat {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-9px) rotate(2deg) scale(1.06); }
        }

        /* FIRST LINE: HAPPY 21ST BDAY */
        .kinetic-line-1 {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: clamp(8px, 2vw, 18px);
          font-family: 'LEMON MILK', 'Cinzel', 'Poppins', sans-serif;
          font-size: clamp(20px, 4.4vw, 42px);
          font-weight: 800;
          letter-spacing: clamp(0.12em, 0.35vw, 0.25em);
          text-transform: uppercase;
          margin-bottom: clamp(6px, 1.5vw, 16px);
          overflow: hidden;
          padding: 6px 12px;
        }

        .line1-word {
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .line1-char {
          display: inline-block;
          background: linear-gradient(135deg, #ffffff 0%, #fed7aa 40%, #f472b6 80%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 8px rgba(244, 114, 182, 0.4));
          animation: line1CharReveal 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          opacity: 0;
          transform: translateY(120%) scaleY(1.4);
          transform-origin: bottom center;
        }

        @keyframes line1CharReveal {
          0% {
            opacity: 0;
            transform: translateY(120%) scaleY(1.5) scaleX(0.85);
          }
          70% {
            opacity: 1;
            transform: translateY(-8%) scaleY(0.95) scaleX(1.08);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scaleY(1) scaleX(1);
          }
        }

        /* SECOND LINE: PRINCESS (Centered, prominent, liquid wave transition) */
        .kinetic-line-2-wrapper {
          position: relative;
          padding: 8px 16px;
          cursor: pointer;
        }

        .kinetic-line-2 {
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Playfair Display', 'Cinzel', serif;
          font-size: clamp(48px, 11.5vw, 118px);
          font-weight: 900;
          font-style: italic;
          letter-spacing: clamp(0.04em, 0.15vw, 0.08em);
          text-transform: uppercase;
          position: relative;
          text-shadow: 0 0 25px rgba(244, 114, 182, 0.45);
        }

        .liquid-wave-char {
          display: inline-block;
          position: relative;
          background: linear-gradient(180deg, #ffffff 15%, #ffd1dc 45%, #ec4899 75%, #f59e0b 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transform-origin: center 70%;
          animation: 
            princessDropIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) forwards,
            liquidWaveLoop 2.8s ease-in-out infinite;
          animation-delay: 
            calc(var(--char-index) * 0.07s + 0.3s),
            calc(var(--char-index) * 0.14s + 1.2s);
          opacity: 0;
        }

        @keyframes princessDropIn {
          0% {
            opacity: 0;
            transform: translateY(-90px) scale(0.6) rotate(calc(var(--char-index) * 4deg - 16deg));
            filter: blur(8px);
          }
          65% {
            opacity: 1;
            transform: translateY(12px) scale(1.15) rotate(calc(var(--char-index) * -1deg));
            filter: blur(0px);
          }
          85% {
            transform: translateY(-4px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }

        /* Signature After Effects "ooooh myyy goood" liquid sinusoidal stretch & bob loop */
        @keyframes liquidWaveLoop {
          0%, 100% {
            transform: translateY(0) scaleY(1) scaleX(1);
          }
          25% {
            transform: translateY(-14px) scaleY(1.18) scaleX(0.92);
          }
          50% {
            transform: translateY(0) scaleY(0.92) scaleX(1.06);
          }
          75% {
            transform: translateY(10px) scaleY(1.08) scaleX(0.96);
          }
        }

        /* Subtle kinetic chromatic aberration glitch shadow */
        .liquid-wave-char::before {
          content: attr(data-letter);
          position: absolute;
          inset: 0;
          color: #06b6d4;
          opacity: 0.3;
          z-index: -1;
          transform: translate(-2px, 0);
          mix-blend-mode: screen;
          pointer-events: none;
        }
        .liquid-wave-char::after {
          content: attr(data-letter);
          position: absolute;
          inset: 0;
          color: #f43f5e;
          opacity: 0.35;
          z-index: -2;
          transform: translate(2px, 0);
          mix-blend-mode: screen;
          pointer-events: none;
        }

        /* DATE CAPSULE BADGE: 04:11:2026 */
        .date-capsule-badge {
          margin-top: clamp(14px, 2.5vw, 24px);
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 8px 24px;
          background: rgba(255, 255, 255, 0.08);
          border: 1.5px solid rgba(251, 191, 36, 0.55);
          border-radius: 9999px;
          backdrop-filter: blur(10px);
          box-shadow: 
            0 0 20px rgba(251, 191, 36, 0.25),
            0 4px 15px rgba(0, 0, 0, 0.3);
          animation: dateBadgeAppear 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.85s both;
        }

        @keyframes dateBadgeAppear {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.85);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .date-star-icon {
          color: #fbbf24;
          font-size: 14px;
          animation: spinStar 8s linear infinite;
        }
        @keyframes spinStar {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .date-digits-text {
          font-family: 'Poppins', monospace;
          font-size: clamp(15px, 2.6vw, 24px);
          font-weight: 700;
          letter-spacing: 0.28em;
          color: #fffbeb;
          text-shadow: 0 0 12px rgba(251, 191, 36, 0.7);
        }

        /* Technical Frame Footer Bar */
        .frame-footer-bar {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: 'Poppins', monospace;
          font-size: clamp(9px, 1.6vw, 11px);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.65);
          border-top: 1px solid rgba(244, 114, 182, 0.15);
          padding-top: 12px;
        }

        /* Sound Equalizer Kinetic Bars */
        .equalizer-wave {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          height: 16px;
        }
        .eq-bar {
          width: 2.5px;
          background: #f472b6;
          border-radius: 2px;
          animation: eqPulse 1s ease-in-out infinite alternate;
        }
        .eq-bar:nth-child(1) { height: 6px; animation-delay: 0.1s; }
        .eq-bar:nth-child(2) { height: 14px; animation-delay: 0.35s; }
        .eq-bar:nth-child(3) { height: 9px; animation-delay: 0.2s; }
        .eq-bar:nth-child(4) { height: 16px; animation-delay: 0.5s; }
        .eq-bar:nth-child(5) { height: 8px; animation-delay: 0.25s; }

        @keyframes eqPulse {
          0% { transform: scaleY(0.4); opacity: 0.5; }
          100% { transform: scaleY(1); opacity: 1; }
        }

        /* Interactive Bottom Controls */
        .action-button-row {
          position: absolute;
          bottom: -70px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 20;
          animation: btnFadeIn 0.7s ease-out 1.2s both;
        }

        @keyframes btnFadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .finale-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border-radius: 9999px;
          font-family: 'Poppins', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          border: none;
        }

        .btn-replay {
          background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%);
          color: #ffffff;
          box-shadow: 0 4px 18px rgba(244, 63, 94, 0.45);
        }
        .btn-replay:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 6px 24px rgba(244, 63, 94, 0.65);
        }

        .btn-back-album {
          background: rgba(255, 255, 255, 0.12);
          color: #fbcfe8;
          border: 1px solid rgba(244, 114, 182, 0.35);
          backdrop-filter: blur(8px);
        }
        .btn-back-album:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
          color: #ffffff;
        }

        .btn-burst {
          background: rgba(251, 191, 36, 0.18);
          color: #fef08a;
          border: 1px solid rgba(251, 191, 36, 0.4);
          backdrop-filter: blur(8px);
        }
        .btn-burst:hover {
          background: rgba(251, 191, 36, 0.3);
          transform: translateY(-2px) scale(1.04);
        }
      `}</style>

      {/* Ambient background glowing orbs */}
      <div className="ambient-glow-orb orb-1" />
      <div className="ambient-glow-orb orb-2" />
      <div className="ambient-glow-orb orb-3" />

      {/* Floating celestial particle dust */}
      {backgroundDust.map((d) => (
        <span
          key={d.id}
          style={{
            position: 'absolute',
            left: `${d.left}%`,
            top: `${d.top}%`,
            fontSize: `${d.size}px`,
            opacity: d.opacity,
            pointerEvents: 'none',
            color: '#fbcfe8',
            animation: `orbBreathe ${d.dur}s ease-in-out ${d.delay}s infinite alternate`,
            filter: 'drop-shadow(0 0 4px rgba(244, 114, 182, 0.6))',
          }}
        >
          {d.char}
        </span>
      ))}

      {/* Technical Motion Graphic Viewfinder Frame */}
      <div className="viewfinder-outer-frame">
        {/* Corner Brackets */}
        <div className="corner-bracket bracket-tl" />
        <div className="corner-bracket bracket-tr" />
        <div className="corner-bracket bracket-bl" />
        <div className="corner-bracket bracket-br" />

        {/* Framing Crosshairs */}
        <div className="crosshair-center ch-left" />
        <div className="crosshair-center ch-right" />
        <div className="crosshair-center ch-top" />
        <div className="crosshair-center ch-bottom" />

        {/* Frame Top Header */}
        <div className="frame-header-bar">
          <div className="rec-indicator">
            <span className="rec-dot" />
            <span>REC ● 00:21:04</span>
          </div>
          <div className="header-title-badge">
            SPECIAL EDITION // CHAPTER 21
          </div>
          <div>FRAME 21 / 21 • 4K 60FPS</div>
        </div>

        {/* Main Center Kinetic Typography Showcase */}
        <div className="kinetic-center-showcase">
          {/* Royal Crown Accent */}
          <div className="floating-royal-crown">
            👑
          </div>

          {/* FIRST LINE: HAPPY 21ST BDAY */}
          <div className="kinetic-line-1" aria-label="HAPPY 21ST BDAY">
            {line1Words.map((word, wIdx) => (
              <span key={wIdx} className="line1-word">
                {word.split("").map((char, cIdx) => {
                  const globalIdx = wIdx * 5 + cIdx;
                  return (
                    <span
                      key={cIdx}
                      className="line1-char"
                      style={{
                        animationDelay: `${globalIdx * 0.045 + 0.15}s`,
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </span>
            ))}
          </div>

          {/* SECOND LINE: PRINCESS (Centered, Prominent, Signature Liquid Wave Loop) */}
          <div
            className="kinetic-line-2-wrapper"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={triggerCelebration}
            title="Tap for celebration sparkles!"
          >
            <div className="kinetic-line-2" aria-label="PRINCESS">
              {line2Letters.map((letter, idx) => (
                <span
                  key={idx}
                  className="liquid-wave-char"
                  data-letter={letter}
                  style={{
                    '--char-index': idx,
                    transform: isHovered ? 'scale(1.08)' : undefined,
                  }}
                >
                  {letter}
                </span>
              ))}
            </div>
          </div>

          {/* DATE CAPSULE BADGE: 04:11:2026 */}
          <div className="date-capsule-badge">
            <span className="date-star-icon">✦</span>
            <span className="date-digits-text">04:11:2026</span>
            <span className="date-star-icon">✦</span>
          </div>
        </div>

        {/* Frame Bottom Footer */}
        <div className="frame-footer-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="equalizer-wave">
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
              <span className="eq-bar" />
            </div>
            <span>AUDIO SYNC • CELESTIAL DREAM</span>
          </div>
          <div>✦ FOR MY PRINCESS ✦</div>
          <div>DATE: 04:11:2026</div>
        </div>

        {/* Action Controls */}
        <div className="action-button-row">
          <button
            type="button"
            className="finale-btn btn-replay"
            onClick={handleReplay}
          >
            <span>🔁</span>
            <span>Replay Motion</span>
          </button>

          <button
            type="button"
            className="finale-btn btn-burst"
            onClick={triggerCelebration}
          >
            <span>💖</span>
            <span>Sparkles</span>
          </button>

          {onBack && (
            <button
              type="button"
              className="finale-btn btn-back-album"
              onClick={onBack}
            >
              <span>📖</span>
              <span>Back to Album</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
