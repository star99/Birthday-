import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';

/**
 * CelestialLoveLetterDialog Component
 * 
 * Features:
 * 1. Deep Midnight Black Screen Dialog:
 *    - Filled with 85+ sparkling, twinkling stars.
 *    - Interactive sparkle bursts on background taps and mouse movements.
 * 2. One Movable & Sparkable Moon with Shining Star:
 *    - Luminous golden crescent moon freely draggable across the screen.
 *    - Emits celestial sparkles and chimes when moved or tapped.
 *    - Embedded 4-point rotating golden shining star in the crescent curve.
 * 3. Letter Box (from https://scrapbook-2jf.pages.dev/):
 *    - Closed envelope with gentle bobbing animation.
 *    - Caption: "For you, my baby." and hint "(tap to open)".
 *    - Interactive opening: morphs to opened envelope with flower & sparkle burst.
 * 4. Pure Clean Love Letters (from https://achuu936.vercel.app/love-letter):
 *    - Headings, tags, and "Letter 1" counters REMOVED as requested.
 *    - Clean, modern, highly readable "normal style" font ('Poppins', 'Quicksand', sans-serif).
 *    - Second letter removed, and remaining letters from link 2 added.
 *    - All signatures clean: "~ Dudu ❤️" (removed "forever your dudu").
 *    - Swipe left / right and navigation buttons.
 * 5. "Not enough? 💖" Option:
 *    - Prominent romantic button redirecting to the Royal Scrapbook page!
 */
export default function CelestialLoveLetterDialog({ isOpen, onClose, onNotEnough }) {
  // Modal stage: 'envelope' (tap to open) | 'letters' (reading cards)
  const [stage, setStage] = useState('envelope');
  const [isOpeningEnvelope, setIsOpeningEnvelope] = useState(false);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

  // Swipe / Drag state for cards
  const [cardDragX, setCardDragX] = useState(0);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const cardStartPos = useRef({ x: 0, y: 0 });
  const cardDragXRef = useRef(0);

  // Movable Moon State
  const [moonPos, setMoonPos] = useState({ x: 74, y: 15 }); // Percentage (%)
  const [isDraggingMoon, setIsDraggingMoon] = useState(false);
  const moonDragOffset = useRef({ startX: 0, startY: 0, initialMoonX: 0, initialMoonY: 0 });

  // Dynamic sparkles array
  const [sparkles, setSparkles] = useState([]);
  const sparkleIdCounter = useRef(0);

  // Web Audio Synthesizer
  const playSound = useCallback((type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'sparkle') {
        const freqs = [1046.5, 1318.5, 1567.98, 2093.0];
        freqs.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = ctx.currentTime + idx * 0.05;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.12, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.38);
        });
      } else if (type === 'envelope_open') {
        const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = ctx.currentTime + i * 0.07;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.18, t + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.6);
        });
      } else if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        filter.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.24);
      }
    } catch {
      // Audio fallback
    }
  }, []);

  // Letters from link 2 (second letter removed, remaining letters added, no headings, signed ~ Dudu)
  const letters = useMemo(() => [
    {
      id: 1,
      msg: `You are more than just someone I love. You are someone who makes my heart feel calm, understood, and at home. Having you in my life is something I will always be grateful for. ❤️`,
      signature: '~ Dudu',
      decorEmoji: '🌹',
    },
    {
      id: 3,
      msg: `When life feels heavy and you don’t know what to do, you don’t have to pretend to be okay with me. You can cry, you can be tired, you can feel lost. I’ll be there to listen, understand, and remind you that you’re stronger than you think. 🫂`,
      signature: '~ Dudu',
      decorEmoji: '🤍',
    },
    {
      id: 4,
      msg: `I want to see you achieve everything you dream about. I’ll be the person cheering for you when you succeed, encouraging you when you’re tired, and reminding you to keep going when you feel like giving up. 🌟`,
      signature: '~ Dudu',
      decorEmoji: '🌷',
    },
    {
      id: 5,
      msg: `You deserve a life filled with genuine happiness, peaceful nights, beautiful memories, and people who love you sincerely. I hope you never settle for anything less than the love and happiness your heart deserves. 🌷✨`,
      signature: '~ Dudu',
      decorEmoji: '✨',
    },
    {
      id: 6,
      msg: `Thank you for being a beautiful part of my life. Thank you for every smile, every conversation, every little moment, and every memory. Even the smallest moments with you have become some of my favourite memories. 🤍`,
      signature: '~ Dudu',
      decorEmoji: '🕊️',
    },
    {
      id: 7,
      msg: `I may not always know the perfect thing to say or the perfect way to make everything better, but I promise I will always care. I’ll listen when you need to talk, stay when you need someone, and remind you how precious you are whenever you forget. 🌸`,
      signature: '~ Dudu',
      decorEmoji: '💖',
    },
    {
      id: 8,
      msg: `Today, I don’t just wish you a happy birthday. I wish you a life where your heart feels loved, your mind feels peaceful, and your dreams slowly become reality. I hope you always remember that somewhere in this world, there is a heart that will always care about your happiness. Happy Birthday, my love. ❤️🥹`,
      signature: '~ Dudu',
      decorEmoji: '🎂',
    },
  ], []);

  // Generate 85 background twinkling stars
  const stars = useMemo(() => {
    const starChars = ['✦', '★', '✧', '•', '⋆'];
    return Array.from({ length: 85 }, (_, i) => ({
      id: i,
      x: (Math.random() * 96 + 2).toFixed(1),
      y: (Math.random() * 96 + 2).toFixed(1),
      size: (Math.random() * 9 + 4).toFixed(1),
      char: starChars[Math.floor(Math.random() * starChars.length)],
      twinkleDur: (Math.random() * 3 + 1.8).toFixed(2),
      delay: (Math.random() * 4).toFixed(2),
      opacity: (Math.random() * 0.5 + 0.45).toFixed(2),
      color: Math.random() > 0.4 ? '#ffffff' : Math.random() > 0.5 ? '#ffe8a3' : '#ffd1dc',
    }));
  }, []);

  // Spawn visual sparkle particle
  const spawnSparkle = useCallback((clientX, clientY, count = 3) => {
    const newSparkles = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 35 + 10;
      newSparkles.push({
        id: sparkleIdCounter.current++,
        x: clientX,
        y: clientY,
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        size: Math.random() * 12 + 6,
        color: Math.random() > 0.3 ? '#ffe680' : '#ff9ebb',
      });
    }
    setSparkles((prev) => [...prev.slice(-40), ...newSparkles]);
  }, []);

  // Clean up sparkles
  useEffect(() => {
    if (sparkles.length === 0) return;
    const timer = setTimeout(() => {
      setSparkles((prev) => prev.slice(5));
    }, 600);
    return () => clearTimeout(timer);
  }, [sparkles]);

  // Handle Background Click / Tap
  const handleBackgroundTap = (e) => {
    if (e.target.dataset.bg === 'true') {
      spawnSparkle(e.clientX, e.clientY, 5);
      playSound('sparkle');
    }
  };

  // Movable Moon drag handlers
  const handleMoonPointerDown = (e) => {
    e.stopPropagation();
    setIsDraggingMoon(true);
    moonDragOffset.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialMoonX: moonPos.x,
      initialMoonY: moonPos.y,
    };
    spawnSparkle(e.clientX, e.clientY, 6);
    playSound('sparkle');
  };

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (isDraggingMoon) {
        const deltaX = ((e.clientX - moonDragOffset.current.startX) / window.innerWidth) * 100;
        const deltaY = ((e.clientY - moonDragOffset.current.startY) / window.innerHeight) * 100;
        const nextX = Math.min(92, Math.max(8, moonDragOffset.current.initialMoonX + deltaX));
        const nextY = Math.min(88, Math.max(6, moonDragOffset.current.initialMoonY + deltaY));
        setMoonPos({ x: nextX, y: nextY });

        if (Math.random() > 0.6) {
          spawnSparkle(e.clientX, e.clientY, 2);
        }
      }

      if (isDraggingCard) {
        const deltaX = e.clientX - cardStartPos.current.x;
        cardDragXRef.current = deltaX;
        setCardDragX(deltaX);
      }
    };

    const handlePointerUp = () => {
      if (isDraggingMoon) {
        setIsDraggingMoon(false);
      }
      if (isDraggingCard) {
        setIsDraggingCard(false);
        const finalDragX = cardDragXRef.current;
        if (finalDragX < -55) {
          handleNextLetter();
        } else if (finalDragX > 55) {
          handlePrevLetter();
        }
        cardDragXRef.current = 0;
        setCardDragX(0);
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingMoon, isDraggingCard]);

  // Card Swipe / Pointer Down handlers
  const handleCardPointerDown = (e) => {
    setIsDraggingCard(true);
    cardStartPos.current = { x: e.clientX, y: e.clientY };
  };

  // Card Navigation
  const handleNextLetter = () => {
    if (currentLetterIndex < letters.length - 1) {
      setCurrentLetterIndex((prev) => prev + 1);
      playSound('flip');
    } else {
      // Swiping or clicking Next on the final letter opens the Photo Book!
      if (onNotEnough) {
        onNotEnough();
      }
    }
  };

  const handlePrevLetter = () => {
    if (currentLetterIndex > 0) {
      setCurrentLetterIndex((prev) => prev - 1);
      playSound('flip');
    }
  };

  // Tap to Open Envelope Handler
  const handleOpenEnvelope = () => {
    if (isOpeningEnvelope) return;
    setIsOpeningEnvelope(true);
    playSound('envelope_open');

    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    spawnSparkle(cx, cy, 14);

    setTimeout(() => {
      setStage('letters');
      setIsOpeningEnvelope(false);
      setCurrentLetterIndex(0);
    }, 850);
  };

  if (!isOpen) return null;

  const currentLetter = letters[currentLetterIndex];
  const isLastLetter = currentLetterIndex === letters.length - 1;

  return (
    <div
      data-bg="true"
      onClick={handleBackgroundTap}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: '#040407',
        backgroundImage: 'radial-gradient(ellipse at 50% 30%, #0c0b16 0%, #050509 65%, #000000 100%)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* Dynamic Star & Animation Styles */}
      <style>{`
        @keyframes letterTwinkle {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.25); filter: drop-shadow(0 0 5px rgba(255, 230, 160, 0.9)); }
        }

        @keyframes moonFloat {
          0%, 100% { transform: translate(-50%, -50%) translateY(0) rotate(0deg); }
          50% { transform: translate(-50%, -50%) translateY(-8px) rotate(2deg); }
        }

        @keyframes starSpinPulse {
          0% { transform: scale(0.85) rotate(0deg); opacity: 0.75; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 1; filter: drop-shadow(0 0 10px #ffeaa7); }
          100% { transform: scale(0.85) rotate(360deg); opacity: 0.75; }
        }

        @keyframes envelopeBob {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-10px) scale(1.02); }
        }

        @keyframes envelopeShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          20% { transform: translateX(-8px) rotate(-3deg); }
          40% { transform: translateX(8px) rotate(3deg); }
          60% { transform: translateX(-6px) rotate(-2deg); }
          80% { transform: translateX(6px) rotate(2deg); }
        }

        @keyframes cardPopIn {
          0% { opacity: 0; transform: translateY(35px) scale(0.94); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes sparkleFade {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.2); }
        }

        @keyframes notEnoughPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 15px rgba(255, 180, 200, 0.6), 0 4px 14px rgba(244, 63, 94, 0.4); }
          50% { transform: scale(1.05); box-shadow: 0 0 25px rgba(255, 215, 0, 0.8), 0 6px 20px rgba(244, 63, 94, 0.6); }
        }

        .envelope-interactive {
          cursor: pointer;
          transition: transform 0.3s ease, filter 0.3s ease;
          animation: envelopeBob 3.5s ease-in-out infinite;
        }

        .envelope-interactive:hover {
          transform: translateY(-8px) scale(1.04);
          filter: drop-shadow(0 22px 40px rgba(230, 80, 110, 0.45)) drop-shadow(0 0 25px rgba(255, 215, 0, 0.5));
        }

        .envelope-interactive:active {
          transform: scale(0.96);
        }

        .envelope-interactive.opening {
          animation: envelopeShake 0.65s ease-in-out forwards !important;
        }

        /* Clean, Elegant Normal Style Typography */
        .normal-letter-text {
          font-family: 'Poppins', 'Quicksand', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          letter-spacing: 0.015em;
        }

        .letter-scroll-area::-webkit-scrollbar {
          width: 4px;
        }
        .letter-scroll-area::-webkit-scrollbar-thumb {
          background: rgba(180, 100, 100, 0.25);
          border-radius: 999px;
        }
      `}</style>

      {/* 85+ Black Screen Celestial Stars */}
      {stars.map((s) => (
        <span
          key={s.id}
          style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            fontSize: `${s.size}px`,
            color: s.color,
            opacity: s.opacity,
            pointerEvents: 'none',
            animation: `letterTwinkle ${s.twinkleDur}s ease-in-out ${s.delay}s infinite`,
          }}
        >
          {s.char}
        </span>
      ))}

      {/* Sparkle Particles on drag / tap */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          style={{
            position: 'fixed',
            left: sp.x,
            top: sp.y,
            width: sp.size,
            height: sp.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, #fff 20%, ${sp.color} 80%)`,
            boxShadow: `0 0 8px ${sp.color}`,
            pointerEvents: 'none',
            zIndex: 100000,
            '--tx': `${sp.tx}px`,
            '--ty': `${sp.ty}px`,
            animation: 'sparkleFade 0.6s ease-out forwards',
          }}
        />
      ))}

      {/* ONE MOVABLE AND SPARKABLE MOON WITH SHINING STAR IN IT */}
      <div
        onPointerDown={handleMoonPointerDown}
        style={{
          position: 'absolute',
          left: `${moonPos.x}%`,
          top: `${moonPos.y}%`,
          transform: 'translate(-50%, -50%)',
          zIndex: 40,
          cursor: isDraggingMoon ? 'grabbing' : 'grab',
          touchAction: 'none',
          animation: isDraggingMoon ? 'none' : 'moonFloat 5s ease-in-out infinite',
          filter: isDraggingMoon
            ? 'drop-shadow(0 0 35px rgba(255, 230, 130, 0.95)) drop-shadow(0 0 60px rgba(255, 180, 70, 0.6))'
            : 'drop-shadow(0 0 25px rgba(255, 235, 170, 0.8)) drop-shadow(0 0 45px rgba(255, 200, 90, 0.4))',
          transition: isDraggingMoon ? 'none' : 'filter 0.3s ease',
        }}
        title="Draggable & Sparkable Moon"
      >
        <div
          style={{
            position: 'absolute',
            inset: '-20px',
            background: 'radial-gradient(circle, rgba(255, 230, 160, 0.35) 0%, transparent 70%)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        <svg
          width="86"
          height="86"
          viewBox="0 0 100 100"
          style={{ display: 'block', overflow: 'visible' }}
        >
          <defs>
            <linearGradient id="celestialMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffdf0" />
              <stop offset="45%" stopColor="#ffebb5" />
              <stop offset="85%" stopColor="#f5c97a" />
              <stop offset="100%" stopColor="#dfa74d" />
            </linearGradient>
            <radialGradient id="craterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(210, 150, 70, 0.45)" />
              <stop offset="100%" stopColor="rgba(210, 150, 70, 0)" />
            </radialGradient>
          </defs>

          <path
            d="M 50 10 A 40 40 0 1 0 90 50 A 32 32 0 1 1 50 10 Z"
            fill="url(#celestialMoonGrad)"
            stroke="rgba(255, 245, 220, 0.8)"
            strokeWidth="1.2"
          />

          <circle cx="34" cy="38" r="5" fill="url(#craterGlow)" />
          <circle cx="28" cy="54" r="7" fill="url(#craterGlow)" />
          <circle cx="44" cy="68" r="4.5" fill="url(#craterGlow)" />
          <circle cx="58" cy="76" r="3" fill="url(#craterGlow)" />
        </svg>

        <div
          style={{
            position: 'absolute',
            top: '32px',
            right: '18px',
            transformOrigin: 'center',
            animation: 'starSpinPulse 3.5s ease-in-out infinite',
            pointerEvents: 'none',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 40 40">
            <defs>
              <radialGradient id="starShineGrad">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#ffe885" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <path
              d="M 20 2 Q 20 20 38 20 Q 20 20 20 38 Q 20 20 2 20 Q 20 20 20 2 Z"
              fill="url(#starShineGrad)"
            />
            <circle cx="20" cy="20" r="3" fill="#ffffff" />
          </svg>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '-22px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '9px',
            fontWeight: 600,
            color: 'rgba(255, 235, 170, 0.85)',
            letterSpacing: '0.08em',
            whiteSpace: 'nowrap',
            textShadow: '0 0 8px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
          }}
        >
          ✦ drag moon ✦
        </div>
      </div>

      {/* Top Header Controls: Back / Close Button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          fontSize: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          zIndex: 60,
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 100, 130, 0.4)';
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
        title="Close & Return to Cake"
        aria-label="Close"
      >
        ✕
      </button>

      {/* ========================================================
          STAGE 1: THE LETTER BOX (FROM https://scrapbook-2jf.pages.dev/)
          ======================================================== */}
      {stage === 'envelope' && (
        <div
          style={{
            position: 'relative',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.2rem',
            animation: 'cardPopIn 0.7s cubic-bezier(0.18, 0.9, 0.32, 1.1) forwards',
          }}
        >
          {/* Envelope Button with Closed / Opened toggle */}
          <div
            onClick={handleOpenEnvelope}
            className={`envelope-interactive ${isOpeningEnvelope ? 'opening' : ''}`}
            role="button"
            tabIndex={0}
            style={{
              position: 'relative',
              width: 'min(72vw, 310px)',
              aspectRatio: '2987 / 3431',
              filter: 'drop-shadow(0 20px 36px rgba(160, 20, 45, 0.48)) drop-shadow(0 0 20px rgba(255, 215, 100, 0.3))',
            }}
          >
            <img
              src="/assets/letter/envelope-closed.png"
              alt="Closed Love Letter"
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: isOpeningEnvelope ? 0 : 1,
                transition: 'opacity 0.5s ease',
              }}
            />

            <img
              src="/assets/letter/envelope-opened.png"
              alt="Opened Love Letter"
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: isOpeningEnvelope ? 1 : 0,
                transition: 'opacity 0.5s ease',
              }}
            />
          </div>

          {/* Caption & Hint from Link 1 */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p
              className="normal-letter-text"
              style={{
                margin: 0,
                fontSize: 'clamp(20px, 4.8vw, 26px)',
                fontWeight: 600,
                color: '#fff3ee',
                letterSpacing: '0.02em',
                textShadow: '0 2px 14px rgba(255, 120, 150, 0.6), 0 0 30px rgba(255, 200, 120, 0.4)',
              }}
            >
              For you, my baby.
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 'clamp(13px, 3.2vw, 15px)',
                fontWeight: 500,
                color: '#ffcad4',
                letterSpacing: '0.04em',
                opacity: 0.9,
                animation: 'envelopeBob 2s ease-in-out infinite',
              }}
            >
              (tap to open)
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          STAGE 2: LOVE LETTERS (CLEAN NORMAL STYLE, NO HEADINGS)
          ======================================================== */}
      {stage === 'letters' && (
        <div
          style={{
            position: 'relative',
            zIndex: 35,
            width: '100%',
            maxWidth: '500px',
            padding: '0 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            animation: 'cardPopIn 0.6s cubic-bezier(0.18, 0.9, 0.32, 1.1) forwards',
          }}
        >
          {/* Card Stack Container */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '340px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              perspective: '1200px',
            }}
          >
            {/* Background stacked card deck preview */}
            {currentLetterIndex < letters.length - 1 && (
              <div
                style={{
                  position: 'absolute',
                  width: '94%',
                  height: '95%',
                  background: 'linear-gradient(145deg, #f7ece2 0%, #ecd9cc 100%)',
                  borderRadius: '20px',
                  border: '1px solid rgba(210, 170, 150, 0.4)',
                  transform: 'translateY(12px) scale(0.96) rotate(1.5deg)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                  pointerEvents: 'none',
                  opacity: 0.7,
                }}
              />
            )}

            {/* Active Foreground Letter Card */}
            <div
              onPointerDown={handleCardPointerDown}
              style={{
                position: 'relative',
                width: '100%',
                background: 'linear-gradient(140deg, #fffaf6 0%, #faeee5 55%, #f7e6d8 100%)',
                color: '#2c1810',
                borderRadius: '22px',
                padding: '30px 26px 22px',
                border: '1.5px solid rgba(220, 175, 160, 0.65)',
                boxShadow:
                  'inset 0 0 35px rgba(200, 140, 120, 0.14), 0 20px 45px rgba(0, 0, 0, 0.65), 0 0 25px rgba(255, 180, 190, 0.25)',
                cursor: isDraggingCard ? 'grabbing' : 'grab',
                transform: `translateX(${cardDragX}px) rotate(${cardDragX * 0.04}deg)`,
                transition: isDraggingCard ? 'none' : 'transform 0.35s cubic-bezier(0.2, 0.8, 0.25, 1)',
                touchAction: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {/* Delicate Corner Accents */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '14px',
                  fontSize: '13px',
                  color: '#b05d6a',
                  opacity: 0.5,
                }}
              >
                ❦
              </div>
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '14px',
                  fontSize: '13px',
                  color: '#b05d6a',
                  opacity: 0.5,
                }}
              >
                ❦
              </div>

              {/* CLEAN LETTER BODY TEXT (NORMAL, BEAUTIFUL, HIGHLY READABLE STYLE) */}
              <div
                className="letter-scroll-area normal-letter-text"
                style={{
                  minHeight: '160px',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  margin: '8px 0 16px',
                  paddingRight: '6px',
                  fontSize: 'clamp(15px, 4vw, 17px)',
                  lineHeight: '1.7',
                  fontWeight: 500,
                  color: '#2c1810',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <p style={{ margin: 0, whiteSpace: 'pre-line' }}>{currentLetter.msg}</p>
              </div>

              {/* SIGNATURE (~ Dudu) & HEART ACCENT */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px dashed rgba(180, 120, 110, 0.35)',
                  paddingTop: '12px',
                  marginTop: 'auto',
                }}
              >
                <cite
                  className="normal-letter-text"
                  style={{
                    fontStyle: 'normal',
                    fontSize: '17px',
                    fontWeight: 700,
                    color: '#8b0000',
                    letterSpacing: '0.02em',
                  }}
                >
                  {currentLetter.signature}
                </cite>

                <span
                  style={{
                    fontSize: '20px',
                    filter: 'drop-shadow(0 2px 6px rgba(220, 50, 70, 0.35))',
                  }}
                >
                  {currentLetter.decorEmoji}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Controls & "NOT ENOUGH?" OPTION */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '16px',
              gap: '12px',
            }}
          >
            {/* Interactive Navigation Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0 4px',
              }}
            >
              {/* Previous Button */}
              <button
                onClick={handlePrevLetter}
                disabled={currentLetterIndex === 0}
                style={{
                  background: currentLetterIndex === 0 ? 'rgba(255,255,255,0.05)' : 'rgba(255, 255, 255, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: currentLetterIndex === 0 ? 'rgba(255,255,255,0.25)' : '#ffffff',
                  borderRadius: '999px',
                  padding: '6px 16px',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: currentLetterIndex === 0 ? 'not-allowed' : 'pointer',
                  backdropFilter: 'blur(6px)',
                  transition: 'all 0.2s ease',
                }}
              >
                ← Prev
              </button>

              {/* Dots Pagination */}
              <div style={{ display: 'flex', gap: '7px', alignItems: 'center' }}>
                {letters.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentLetterIndex(idx);
                      playSound('flip');
                    }}
                    style={{
                      width: currentLetterIndex === idx ? '20px' : '7px',
                      height: '7px',
                      borderRadius: '999px',
                      background: currentLetterIndex === idx ? '#ffd166' : 'rgba(255, 255, 255, 0.3)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      boxShadow: currentLetterIndex === idx ? '0 0 8px #ffd166' : 'none',
                    }}
                    aria-label={`Go to letter ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Next Button / Photo Book button */}
              {currentLetterIndex < letters.length - 1 ? (
                <button
                  onClick={handleNextLetter}
                  style={{
                    background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    color: '#ffffff',
                    borderRadius: '999px',
                    padding: '6px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(244, 63, 94, 0.45)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Next ➔
                </button>
              ) : (
                <button
                  onClick={onNotEnough}
                  style={{
                    background: 'linear-gradient(135deg, #ffd166 0%, #f43f5e 60%, #e11d48 100%)',
                    border: '1.5px solid rgba(255, 255, 255, 0.7)',
                    color: '#ffffff',
                    borderRadius: '999px',
                    padding: '6px 18px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(244, 63, 94, 0.55)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    animation: 'notEnoughPulse 2s ease-in-out infinite',
                  }}
                >
                  <span>Photo Book ➔ 📖</span>
                </button>
              )}
            </div>

            {/* PROMINENT "NOT ENOUGH?" REDIRECTION OPTION */}
            <div style={{ marginTop: '4px', textAlign: 'center' }}>
              <button
                onClick={onNotEnough}
                style={{
                  background: 'linear-gradient(135deg, #ffd166 0%, #f43f5e 60%, #e11d48 100%)',
                  border: '1.5px solid rgba(255, 255, 255, 0.7)',
                  color: '#ffffff',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'notEnoughPulse 2.4s ease-in-out infinite',
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <span>Not enough? 💖</span>
                <span style={{ fontSize: '16px' }}>📖✨</span>
              </button>
            </div>

            {/* Gesture Hint */}
            <p
              style={{
                margin: 0,
                fontSize: '11px',
                color: 'rgba(255, 230, 230, 0.65)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                letterSpacing: '0.03em',
              }}
            >
              <span>👈</span>
              <span>Swipe left to read next letter</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
