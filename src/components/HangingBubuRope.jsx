import React, { useState, useEffect, useRef } from 'react';
import audioManager from '../utils/audioManager.js';

/**
 * HangingBubuRope Component
 * 
 * An interactive, physics-based 2D hanging Bubu on an elaborating / stretchable rope:
 * - Drops down from above the screen with realistic gravity overshoot and spring bounce
 * - Anchored firmly to the top-left ceiling with a brass mount
 * - Physical rope elongation ("elobrate"): pulling down stretches the rope elastically
 * - Sound effects: plays cute Bubu squeak on pull, and cheerful celebration chime on activation
 * - Pull-switch redirect: pulling the rope down firmly (> 70px) and releasing triggers
 *   a cute celebratory burst and redirects to the Birthday Garden story!
 * - Dual damped harmonic recoil on release (vertical spring bounce + angular pendulum sway)
 */
export default function HangingBubuRope({ onDismiss, onRedirect }) {
  const [animState, setAnimState] = useState('entering'); // 'entering' | 'swaying' | 'dragging' | 'rebounding'
  const [dragAngle, setDragAngle] = useState(0);
  const [stretchY, setStretchY] = useState(0);
  const [showHint, setShowHint] = useState(true);
  const [particles, setParticles] = useState([]);
  const [isActivated, setIsActivated] = useState(false);

  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartTimeRef = useRef(0);
  const pointerStartRef = useRef({ x: 0, y: 0, anchorX: 0, anchorY: 0, startDist: 0 });
  const currentAngleRef = useRef(0);
  const currentStretchRef = useRef(0);
  const animFrameRef = useRef(null);
  const hasPlayedSqueakRef = useRef(false);
  const hasTriggeredRedirectRef = useRef(false);
  const isActivatedRef = useRef(false);

  // Transition from drop-in to ambient sway after entrance finishes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimState('swaying');
    }, 1400);
    return () => clearTimeout(timer);
  }, []);

  // Auto-hide hint after 6s if not interacted with
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Shared audio synthesizer for Bubu sounds (uses global audioManager context so background song never pauses)
  const playBubuSound = (type = 'squeak') => {
    playProceduralBubuSound(type);
  };

  const playProceduralBubuSound = (type) => {
    try {
      const ctx = audioManager.getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'activate') {
        // Joyful ascending chime: C6 (1046Hz), E6 (1318Hz), G6 (1567Hz), C7 (2093Hz)
        [1046.5, 1318.5, 1567.9, 2093].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.08);
          gain.gain.setValueAtTime(0.3, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.45);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.5);
        });
      } else {
        // Cute cartoon rubbery squeak
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(620, now);
        osc.frequency.exponentialRampToValueAtTime(1280, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(820, now + 0.22);
        gain.gain.setValueAtTime(0.38, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (_) {}
  };

  // Spawn celebration particles
  const spawnParticles = (isSpecial = false) => {
    const icons = isSpecial
      ? ['🎉', '💖', '✨', '🎈', '⭐', '🎂', '🌸']
      : ['✨', '💖', '⭐', '🎈'];
    const count = isSpecial ? 7 : 3;
    const newItems = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}-${Math.random()}`,
      icon: icons[Math.floor(Math.random() * icons.length)],
      offsetX: (Math.random() - 0.5) * (isSpecial ? 85 : 50),
      delay: i * 0.06,
    }));
    setParticles(prev => [...prev.slice(-8), ...newItems]);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newItems.some(item => item.id === p.id)));
    }, 1400);
  };

  // Pointer Down (mouse or touch)
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    e.preventDefault();

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setShowHint(false);
    hasPlayedSqueakRef.current = false;

    const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
    const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    // Top-left ceiling anchor: rope hangs at 84.35% of container width, at y=0
    const anchorX = rect.left + rect.width * 0.8435;
    const anchorY = rect.top;

    const dx = clientX - anchorX;
    const dy = Math.max(clientY - anchorY, 25);
    const startDist = Math.hypot(dx, dy);

    pointerStartRef.current = {
      x: clientX,
      y: clientY,
      anchorX,
      anchorY,
      startDist,
    };
    dragStartTimeRef.current = performance.now();
    isDraggingRef.current = true;

    setAnimState('dragging');

    // Haptic feedback if supported
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate(10); } catch (_) {}
    }
  };

  const onRedirectRef = useRef(onRedirect);
  useEffect(() => {
    onRedirectRef.current = onRedirect;
  }, [onRedirect]);

  // Spring Recoil Physics: snaps rope back up to 0 like an elastic spring and sways
  const startSpringRecoil = (initStretch, initAngle) => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setAnimState('rebounding');

    const startTime = performance.now();

    // 1. Vertical spring snap-up:
    // High upward velocity pulls rope straight up to 0 in ~120ms with elastic spring bounce
    const v0_stretch = -(initStretch * 28.0);
    const omega_stretch = 18.0;
    const gamma_stretch = 4.8;
    const A_stretch = initStretch;
    const B_stretch = (v0_stretch + gamma_stretch * A_stretch) / omega_stretch;

    // 2. Angular pendulum sway:
    let v0_angle = 0;
    if (Math.abs(initAngle) >= 8) {
      v0_angle = -Math.sign(initAngle) * (200 + Math.min(140, Math.abs(initStretch) * 1.4));
    } else {
      const sign = Math.random() > 0.5 ? 1 : -1;
      v0_angle = sign * (200 + Math.min(140, Math.abs(initStretch) * 1.5));
    }
    const omega_angle = 6.0;
    const gamma_angle = 1.1;
    const A_angle = initAngle;
    const B_angle = (v0_angle + gamma_angle * A_angle) / omega_angle;

    const animateRebound = (now) => {
      const t = (now - startTime) / 1000;

      // Stretch oscillation: snaps up to 0, rebounds slightly, and settles
      const expS = Math.exp(-gamma_stretch * t);
      const curStretch = expS * (A_stretch * Math.cos(omega_stretch * t) + B_stretch * Math.sin(omega_stretch * t));

      // Angle oscillation: exp(-γt) * (A cos(ωt) + B sin(ωt))
      const expA = Math.exp(-gamma_angle * t);
      const curAngle = expA * (A_angle * Math.cos(omega_angle * t) + B_angle * Math.sin(omega_angle * t));

      currentStretchRef.current = curStretch;
      currentAngleRef.current = curAngle;
      setStretchY(curStretch);
      setDragAngle(curAngle);

      if (expA > 0.02 || expS > 0.01) {
        animFrameRef.current = requestAnimationFrame(animateRebound);
      } else {
        setStretchY(0);
        setDragAngle(0);
        currentStretchRef.current = 0;
        currentAngleRef.current = 0;
        setAnimState('swaying');
      }
    };

    animFrameRef.current = requestAnimationFrame(animateRebound);
  };

  // Window pointer move and pointer up listeners
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!isDraggingRef.current) return;
      const clientX = e.clientX ?? (e.touches ? e.touches[0].clientX : 0);
      const clientY = e.clientY ?? (e.touches ? e.touches[0].clientY : 0);

      const { anchorX, anchorY, startDist } = pointerStartRef.current;
      const dx = clientX - anchorX;
      const dy = Math.max(clientY - anchorY, 25);

      // 1. Calculate pendulum angle towards pointer
      const rad = Math.atan2(dx, dy);
      let deg = (rad * 180) / Math.PI;
      deg = Math.max(-42, Math.min(42, deg)); // clamp angle

      // 2. Calculate rope elongation (stretch)
      const currentDist = Math.hypot(dx, dy);
      const deltaDist = currentDist - startDist;

      let stretch = 0;
      if (deltaDist > 0) {
        // Rubber-band elastic resistance: elongates smoothly with increasing tension
        const maxStretch = 185;
        stretch = (deltaDist * maxStretch) / (deltaDist + 210) * 1.6;
      } else {
        stretch = Math.max(-16, deltaDist * 0.22);
      }

      // Play cute Bubu squeak once when pulled past 26px
      if (stretch > 26 && !hasPlayedSqueakRef.current) {
        hasPlayedSqueakRef.current = true;
        playBubuSound('squeak');
      }

      // Check if firm pull threshold reached (>= 58px)
      // When pulled, it immediately triggers and springs back up like an elastic cord
      if (stretch >= 58) {
        isDraggingRef.current = false;
        setIsActivated(false);

        if (!hasTriggeredRedirectRef.current) {
          hasTriggeredRedirectRef.current = true;
          playBubuSound('activate');
          spawnParticles(true);
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate([30, 40, 60]); } catch (_) {}
          }

          if (onRedirectRef.current) {
            setTimeout(() => {
              onRedirectRef.current?.();
            }, 1200);
          }
        }

        // Snap straight back up like a spring!
        startSpringRecoil(stretch, deg);
        return;
      }

      currentAngleRef.current = deg;
      currentStretchRef.current = stretch;
      setDragAngle(deg);
      setStretchY(stretch);
    };

    const handlePointerUp = (e) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsActivated(false);

      const clientX = e.clientX ?? (e.changedTouches ? e.changedTouches[0].clientX : pointerStartRef.current.x);
      const clientY = e.clientY ?? (e.changedTouches ? e.changedTouches[0].clientY : pointerStartRef.current.y);

      const dragDuration = performance.now() - dragStartTimeRef.current;
      const moveDist = Math.hypot(clientX - pointerStartRef.current.x, clientY - pointerStartRef.current.y);

      let initStretch = currentStretchRef.current;
      let initAngle = currentAngleRef.current;

      // Quick tap fallback: playful little tug & soft squeak
      if (dragDuration < 280 && moveDist < 12 && initStretch < 20) {
        initStretch = 46;
        initAngle = (Math.random() > 0.5 ? 1 : -1) * (14 + Math.random() * 8);
        playBubuSound('squeak');
        spawnParticles(false);
      } else if (initStretch > 25 || Math.abs(initAngle) > 12) {
        if (!hasPlayedSqueakRef.current) playBubuSound('squeak');
        spawnParticles(false);
      }

      // Snap straight back up like a spring
      startSpringRecoil(initStretch, initAngle);
    };

    const handlePointerCancel = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setIsActivated(false);
      startSpringRecoil(currentStretchRef.current, currentAngleRef.current);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('touchend', handlePointerUp);
    window.addEventListener('touchcancel', handlePointerCancel);
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      window.removeEventListener('touchcancel', handlePointerCancel);
      window.removeEventListener('pointercancel', handlePointerCancel);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div
      className="bubu-rope-root fixed inset-0 pointer-events-none select-none overflow-hidden"
      style={{ zIndex: 60 }}
    >
      <style>{`
        /* Root dimensions - slightly enlarged as requested */
        :root {
          --bubu-w: clamp(118px, 28vw, 155px);
          --bubu-left: clamp(12px, 3.2vw, 24px);
          --base-rope-h: calc(var(--bubu-w) * (330 / 524));
          --bubu-char-h: calc(var(--bubu-w) * (648 / 524));
          --anchor-pct: 84.35%;
        }

        /* Realistic entrance drop-in with gravity overshoot & spring bounce */
        @keyframes bubuRopeDropIn {
          0% {
            transform: translateY(-118%) rotate(0deg);
          }
          48% {
            transform: translateY(5.2%) rotate(-14deg);
          }
          66% {
            transform: translateY(-2.2%) rotate(10deg);
          }
          82% {
            transform: translateY(1.1%) rotate(-5.5deg);
          }
          93% {
            transform: translateY(-0.3%) rotate(2.8deg);
          }
          100% {
            transform: translateY(0%) rotate(0deg);
          }
        }

        /* Natural physical pendulum sway */
        @keyframes bubuRopeAmbientSway {
          0%, 100% {
            transform: rotate(-3.8deg);
          }
          50% {
            transform: rotate(3.8deg);
          }
        }

        /* Gentle pulse for hint badge */
        @keyframes hintPulse {
          0%, 100% {
            transform: translate(-50%, 0) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-50%, 4px) scale(1.04);
            opacity: 1;
          }
        }

        /* Float upward and fade out for celebration particles */
        @keyframes floatParticle {
          0% {
            transform: translate(-50%, 0) scale(0.6);
            opacity: 0;
          }
          20% {
            transform: translate(calc(-50% + var(--ox, 0px)), -18px) scale(1.25);
            opacity: 1;
          }
          100% {
            transform: translate(calc(-50% + var(--ox, 0px)), -90px) scale(0.9);
            opacity: 0;
          }
        }

        /* Main swinging assembly container fixed at top-left */
        .bubu-rope-assembly {
          position: absolute;
          top: 0;
          left: var(--bubu-left);
          width: var(--bubu-w);
          height: calc(var(--base-rope-h) + var(--bubu-char-h));
          transform-origin: var(--anchor-pct) 0px;
          cursor: grab;
          touch-action: none;
          pointer-events: auto;
          will-change: transform;
        }

        .bubu-rope-assembly:active {
          cursor: grabbing;
        }

        .bubu-rope-assembly.is-entering {
          animation: bubuRopeDropIn 1.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .bubu-rope-assembly.is-swaying {
          animation: bubuRopeAmbientSway 3.4s ease-in-out infinite;
        }

        /* Ceiling brass anchor mount at top-left anchor point */
        .ceiling-anchor-pin {
          position: absolute;
          top: 0;
          left: calc(var(--bubu-left) + (var(--bubu-w) * 0.8435));
          transform: translate(-50%, -1px);
          width: 12px;
          height: 6px;
          background: linear-gradient(180deg, #f0d77d 0%, #c49d28 45%, #8c6a08 100%);
          border-radius: 0 0 3px 3px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
          z-index: 65;
          pointer-events: none;
        }

        /* The vertical rope stem that stretches / elongates physically */
        .bubu-rope-stem {
          position: absolute;
          top: 0;
          left: var(--anchor-pct);
          transform: translateX(-50%);
          width: clamp(3.8px, 1.0vw, 5.2px);
          background-image: url('/assets/bubu_rope_seamless.png');
          background-size: 100% auto;
          background-repeat: repeat-y;
          background-position: bottom center;
          filter: drop-shadow(1px 2px 3px rgba(0, 0, 0, 0.22));
          will-change: height;
        }

        /* Hit-box expansion so touching the thin rope is effortless on touchscreens */
        .bubu-rope-stem::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: -24px;
          right: -24px;
          cursor: grab;
        }

        /* Bubu character container attached to the bottom knot of the rope stem */
        .bubu-character-wrap {
          position: absolute;
          left: 0;
          width: 100%;
          transform-origin: var(--anchor-pct) 0px;
          will-change: transform, top;
        }

        /* 2.5D Drop shadow and crisp rendering for Bubu */
        .bubu-character-img {
          width: 100%;
          height: auto;
          display: block;
          filter:
            drop-shadow(2px 10px 14px rgba(0, 0, 0, 0.20))
            drop-shadow(1px 3px 5px rgba(0, 0, 0, 0.10));
          transition: filter 0.18s ease;
          user-select: none;
          -webkit-user-drag: none;
        }

        .bubu-rope-assembly:active .bubu-character-img {
          filter:
            drop-shadow(4px 18px 22px rgba(0, 0, 0, 0.28))
            drop-shadow(2px 6px 8px rgba(0, 0, 0, 0.15));
        }

        /* Interactive discovery & trigger badge */
        .bubu-pull-hint {
          position: absolute;
          bottom: -32px;
          left: 50%;
          transform: translate(-50%, 0);
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #7a1d33;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          padding: 3px 10px;
          border-radius: 999px;
          border: 1px solid rgba(138, 28, 52, 0.22);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.10);
          pointer-events: none;
          white-space: nowrap;
          animation: hintPulse 2s ease-in-out infinite;
          transition: all 0.25s ease;
        }

        .bubu-pull-hint.is-ready {
          background: #8A1C34;
          color: #ffffff;
          border-color: #8A1C34;
          box-shadow: 0 4px 16px rgba(138, 28, 52, 0.45);
          transform: translate(-50%, 2px) scale(1.08);
        }

        /* Floating celebration particles */
        .bubu-particle {
          position: absolute;
          top: calc(var(--base-rope-h) + 40px);
          left: 50%;
          font-size: 20px;
          pointer-events: none;
          animation: floatParticle 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
          z-index: 70;
        }
      `}</style>

      {/* Ceiling brass mounting pin */}
      <div className="ceiling-anchor-pin" />

      {/* Main swingable & pullable assembly */}
      <div
        ref={containerRef}
        className={`bubu-rope-assembly ${
          animState === 'entering'
            ? 'is-entering'
            : animState === 'swaying'
            ? 'is-swaying'
            : ''
        }`}
        style={{
          transform:
            animState === 'dragging' || animState === 'rebounding'
              ? `rotate(${dragAngle}deg)`
              : undefined,
        }}
        onMouseDown={handlePointerDown}
        onTouchStart={handlePointerDown}
        title="Pull my rope to open the surprise!"
        aria-label="Interactive Hanging Bubu"
      >
        {/* Physical stretchable rope stem (elongates dynamically as pulled) */}
        <div
          className="bubu-rope-stem"
          style={{
            height: `calc(var(--base-rope-h) + ${stretchY}px)`,
          }}
        />

        {/* Bubu Character attached seamlessly at the bottom of the elongated rope */}
        <div
          className="bubu-character-wrap"
          style={{
            top: `calc(var(--base-rope-h) + ${stretchY}px)`,
            transform:
              Math.abs(dragAngle) > 0.5 || stretchY !== 0
                ? `rotate(${-dragAngle * 0.16}deg) scaleY(${1 + Math.max(-0.06, Math.min(0.06, stretchY * 0.0004))})`
                : undefined,
          }}
        >
          <img
            src="/assets/bubu_character.png"
            alt="Hanging Bubu on rope"
            className="bubu-character-img"
            draggable="false"
          />

          {/* Interactive hint badge */}
          {(showHint || animState === 'dragging') && animState !== 'rebounding' && (
            <div className={`bubu-pull-hint ${isActivated ? 'is-ready' : ''}`}>
              {isActivated
                ? 'Release to enter! ✨🌙'
                : animState === 'dragging'
                ? 'Pull down! ⇣'
                : 'Pull rope ⇣'}
            </div>
          )}
        </div>

        {/* Floating celebration particles */}
        {particles.map(p => (
          <span
            key={p.id}
            className="bubu-particle"
            style={{
              '--ox': `${p.offsetX}px`,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.icon}
          </span>
        ))}
      </div>
    </div>
  );
}
