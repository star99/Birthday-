import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';

export default function CakeScreen({ onNext, onBack }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const points = useRef([]);
  const startPoint = useRef(null);
  const [cut, setCut] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const MIN_SWIPE_DISTANCE = 80;

  const [isBurning, setIsBurning] = useState(false);
  const [isBurnt, setIsBurnt] = useState(false);
  const emberLayerRef = useRef(null);
  const flashRef = useRef(null);
  const burnCanvasRef = useRef(null);

  // Setup drawing canvas for glowing cut blade
  useEffect(() => {
    if (!isBurnt) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    let raf;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (points.current.length > 1) {
        const start = points.current[0];
        const end = points.current[points.current.length - 1];

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < points.current.length; i++) {
          ctx.lineTo(points.current[i].x, points.current[i].y);
        }

        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, 'rgba(219, 144, 150, 1)');
        gradient.addColorStop(1, 'rgba(219, 144, 150, 0.1)');

        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = gradient;
        ctx.shadowColor = '#db9096';
        ctx.shadowBlur = 12;
        ctx.stroke();
      }

      if (points.current.length > 30) points.current.shift();
      raf = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [isBurnt]);

  const getRelativeCoords = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const calculateDistance = (p1, p2) =>
    Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

  const startDraw = (e) => {
    if (cut) return;
    drawing.current = true;
    points.current = [];
    e.currentTarget.setPointerCapture(e.pointerId);
    const coords = getRelativeCoords(e);
    startPoint.current = coords;
    setSwipeProgress(0);
  };

  const draw = (e) => {
    if (!drawing.current || cut) return;
    const currentPoint = getRelativeCoords(e);
    points.current.push(currentPoint);
    if (startPoint.current) {
      const distance = calculateDistance(startPoint.current, currentPoint);
      setSwipeProgress(Math.min((distance / MIN_SWIPE_DISTANCE) * 100, 100));
    }
  };

  const stopDraw = (e) => {
    if (!drawing.current) return;
    drawing.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    const coords = getRelativeCoords(e);
    const distance = startPoint.current ? calculateDistance(startPoint.current, coords) : 0;
    if (distance >= MIN_SWIPE_DISTANCE && !cut) {
      setCut(true);
      burst();
      setTimeout(() => {
        points.current = [];
      }, 400);
    } else {
      setSwipeProgress(0);
      points.current = [];
    }
  };

  const burst = () => {
    const confettiColors = ['#ffabcd', '#ffd3a7', '#d8acff', '#fde4f0', '#fcd07e'];
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: confettiColors,
      gravity: 0.9,
      ticks: 250,
      scalar: 0.9,
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 45,
        origin: { x: 0.1, y: 0.7 },
        colors: confettiColors,
      });
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 45,
        origin: { x: 0.9, y: 0.7 },
        colors: confettiColors,
      });
    }, 150);
  };

  const handleIgnite = () => {
    if (isBurning) return;
    setIsBurning(true);

    const emberLayer = emberLayerRef.current;
    const revealFlash = flashRef.current;
    const canvas = burnCanvasRef.current;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '60';
    canvas.style.pointerEvents = 'none';

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255, 242, 236, 0.94)';
    ctx.fillRect(0, 0, W, H);

    for (let i = 0; i < 3000; i++) {
      const x = Math.random() * W;
      const y = Math.random() * H;
      const opacity = Math.random() * 0.05;
      ctx.fillStyle = `rgba(200, 150, 160, ${opacity})`;
      ctx.fillRect(x, y, 2, 2);
    }

    const src = ctx.getImageData(0, 0, W, H);
    const srcData = src.data;

    const threshold = new Float32Array(W * H);
    const cx = W / 2;
    const cy = H / 2;
    const maxR = Math.sqrt(cx * cx + cy * cy);

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const idx = y * W + x;
        if (srcData[idx * 4 + 3] < 10) {
          threshold[idx] = 99;
          continue;
        }

        const dx = x - cx;
        const dy = y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        let t = dist / maxR;

        const noise =
          (Math.sin(x * 0.05 + y * 0.05) +
            Math.sin(x * 0.02 - y * 0.04 + 2.1) +
            Math.sin((x + y) * 0.015 + 4.4) +
            Math.sin(x * 0.08 - y * 0.02 + 1.3) * 0.8) /
          3.8;

        threshold[idx] = t + noise * 0.15;
      }
    }

    const out = ctx.createImageData(W, H);
    const outData = out.data;
    const EDGE = 0.12;
    const DECAY = 0.35;
    const state = { p: -0.4 };
    let lastEmberTime = 0,
      lastSmokeTime = 0,
      lastFlameTime = 0;
    const t0 = performance.now();

    const spawnEmber = (x, y, intensity) => {
      const e = document.createElement('div');
      e.style.position = 'fixed';
      e.style.borderRadius = '50%';
      e.style.pointerEvents = 'none';
      const sz = (3 + Math.random() * 7) * (0.7 + intensity * 0.6);
      const hue = 22 + Math.random() * 32;
      e.style.background = `radial-gradient(circle, hsla(${hue + 18},100%,88%,1) 0%, hsla(${hue},100%,58%,1) 55%, transparent 80%)`;
      e.style.boxShadow = `0 0 ${sz * 2.2}px hsla(${hue},100%,60%,${0.55 * intensity})`;
      e.style.left = x + 'px';
      e.style.top = y + 'px';
      e.style.width = sz + 'px';
      e.style.height = sz + 'px';
      e.style.opacity = '0.95';
      emberLayer?.appendChild(e);

      const dur = 0.85 + Math.random() * 0.7;
      const riseDist = 50 + Math.random() * 95;
      const swayAmp = 10 + Math.random() * 20;
      const swayFreq = 2.2 + Math.random() * 3.2;
      const phase = Math.random() * Math.PI * 2;
      const spin = (Math.random() - 0.5) * 180;
      const st = { t: 0 };
      gsap.to(st, {
        t: 1,
        duration: dur,
        ease: 'power1.out',
        onUpdate: () => {
          const p = st.t;
          const yOff = -riseDist * p;
          const wobble =
            Math.sin(p * swayFreq * Math.PI + phase) *
            swayAmp *
            Math.min(1, p * 2.2) *
            (1 - p * 0.4);
          gsap.set(e, {
            x: wobble,
            y: yOff,
            rotation: spin * p,
            opacity: Math.max(0, 1 - p * p * 1.05),
            scale: 1 - p * 0.7,
          });
        },
        onComplete: () => e.remove(),
      });
    };

    const spawnSmoke = (x, y) => {
      const s = document.createElement('div');
      s.style.position = 'fixed';
      s.style.borderRadius = '50%';
      s.style.pointerEvents = 'none';
      s.style.filter = 'blur(2px)';
      const sz = 16 + Math.random() * 22;
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.width = sz + 'px';
      s.style.height = sz + 'px';
      s.style.opacity = '0.5';
      s.style.background =
        'radial-gradient(circle, rgba(180,180,180,0.55) 0%, rgba(90,90,90,0.28) 45%, transparent 75%)';
      emberLayer?.appendChild(s);
      const drift = (Math.random() - 0.5) * 40;
      const drift2 = drift + (Math.random() - 0.5) * 60;
      gsap.to(s, {
        y: '-=' + (70 + Math.random() * 90),
        x: '+=' + drift,
        scale: 1.5 + Math.random() * 0.8,
        duration: 0.9 + Math.random() * 0.5,
        ease: 'sine.out',
      });
      gsap.to(s, {
        x: '+=' + (drift2 - drift),
        scale: 2.6 + Math.random() * 1.6,
        opacity: 0,
        duration: 1.1 + Math.random() * 0.9,
        delay: 0.7,
        ease: 'sine.in',
        onComplete: () => s.remove(),
      });
    };

    const spawnFlame = (x, y, intensity) => {
      const f = document.createElement('div');
      f.style.position = 'fixed';
      f.style.borderRadius = '50% 50% 50% 50% / 68% 68% 32% 32%';
      f.style.pointerEvents = 'none';
      f.style.filter = 'blur(1.5px)';
      f.style.mixBlendMode = 'screen';
      const w = (10 + Math.random() * 10) * (0.6 + intensity * 0.7);
      const h = w * (1.6 + Math.random() * 0.7);
      f.style.left = x - w / 2 + 'px';
      f.style.top = y - h * 0.85 + 'px';
      f.style.width = w + 'px';
      f.style.height = h + 'px';
      f.style.opacity = '0';
      f.style.background =
        'radial-gradient(ellipse at 50% 70%, rgba(255,244,214,0.95) 0%, rgba(255,170,60,0.85) 32%, rgba(255,90,20,0.5) 58%, transparent 78%)';
      emberLayer?.appendChild(f);

      const dur = 0.28 + Math.random() * 0.22;
      const lean = (Math.random() - 0.5) * 22;
      const tl = gsap.timeline({ onComplete: () => f.remove() });
      tl.fromTo(
        f,
        { opacity: 0, scaleY: 0.4, scaleX: 0.7, y: 4, skewX: lean * 0.3 },
        {
          opacity: 0.85,
          scaleY: 1.15,
          scaleX: 1,
          y: -6,
          skewX: lean,
          duration: dur * 0.4,
          ease: 'power2.out',
        }
      )
        .to(f, {
          scaleY: 0.85,
          scaleX: 0.75,
          skewX: -lean * 0.4,
          duration: dur * 0.35,
          ease: 'sine.inOut',
        })
        .to(f, {
          opacity: 0,
          y: -16,
          scaleY: 1.3,
          scaleX: 0.4,
          duration: dur * 0.6,
          ease: 'power1.in',
        });
    };

    const tl = gsap.timeline({
      onComplete: () => {
        canvas?.remove();
        setIsBurnt(true);
      },
    });

    tl.to(
      state,
      {
        p: 1.2,
        duration: 4.0,
        ease: 'sine.inOut',
        onUpdate: () => {
          const tRaw = (performance.now() - t0) * 0.001;
          const t = tRaw * 6;
          const pDisplay =
            state.p + Math.sin(tRaw * 2.6) * 0.012 + Math.sin(tRaw * 5.3 + 1) * 0.006;

          for (let y = 0; y < H; y++) {
            const flicker =
              Math.sin(t * 5 + y * 0.22) * 0.03 + Math.sin(t * 11 + y * 0.5) * 0.012;

            for (let x = 0; x < W; x++) {
              const o = (y * W + x) * 4;
              const a0 = srcData[o + 3];
              if (a0 < 10) {
                outData[o + 3] = 0;
                continue;
              }

              const idx = y * W + x;
              const d = threshold[idx] - pDisplay + flicker;

              if (d < -EDGE - DECAY) {
                outData[o + 3] = 0;
              } else if (d < -EDGE) {
                const k = (-EDGE - d) / DECAY;
                if (k < 0.45) {
                  const k2 = k / 0.45;
                  outData[o] = Math.round(255 * (1 - k2) + 100 * k2);
                  outData[o + 1] = Math.round(120 * (1 - k2) + 24 * k2);
                  outData[o + 2] = Math.round(35 * (1 - k2) + 10 * k2);
                  outData[o + 3] = 255;
                } else {
                  const k2 = (k - 0.45) / 0.55;
                  outData[o] = Math.round(100 * (1 - k2));
                  outData[o + 1] = Math.round(24 * (1 - k2));
                  outData[o + 2] = Math.round(10 * (1 - k2));
                  outData[o + 3] = Math.round(255 * (1 - k2));
                }
              } else if (d < EDGE) {
                const k2 = (d + EDGE) / (2 * EDGE);
                if (k2 < 0.45) {
                  const k = k2 / 0.45;
                  outData[o] = Math.round(12 + k * (255 - 12));
                  outData[o + 1] = Math.round(5 + k * (110 - 5));
                  outData[o + 2] = Math.round(2 + k * (30 - 2));
                  outData[o + 3] = Math.round(255 * (0.2 + k * 0.8));
                } else {
                  const k = (k2 - 0.45) / 0.55;
                  outData[o] = 255;
                  outData[o + 1] = Math.round(110 * (1 - k) + 255 * k);
                  outData[o + 2] = Math.round(30 * (1 - k) + 250 * k);
                  outData[o + 3] = 255;
                }
              } else {
                outData[o] = srcData[o];
                outData[o + 1] = srcData[o + 1];
                outData[o + 2] = srcData[o + 2];
                outData[o + 3] = a0;
              }
            }
          }
          ctx.putImageData(out, 0, 0);

          const p = pDisplay;
          if (p > -0.15 && p < 1.0) {
            const jitter = (1 - Math.min(1, Math.abs(p - 0.4) * 1.3)) * 1.5;
            canvas.style.transform = `translate(${(Math.random() - 0.5) * jitter}px, ${(Math.random() - 0.5) * jitter}px)`;
          }

          const now = performance.now();
          const currentRadius = Math.max(0, p * maxR);
          const intensity = Math.max(0, 1 - Math.abs(p - 0.4) * 1.1);

          if (now - lastEmberTime > 32 && p < 1.1) {
            lastEmberTime = now;
            const count = 3 + Math.round(intensity * 4);
            for (let k = 0; k < count; k++) {
              const angle = Math.random() * Math.PI * 2;
              const rr = currentRadius * (0.8 + Math.random() * 0.4);
              spawnEmber(
                cx + Math.cos(angle) * rr,
                cy + Math.sin(angle) * rr,
                Math.max(0.3, intensity)
              );
            }
          }
          if (now - lastFlameTime > 55 && p > -0.1 && p < 1.0) {
            lastFlameTime = now;
            const count = 2 + Math.round(intensity * 2);
            for (let k = 0; k < count; k++) {
              const angle = Math.random() * Math.PI * 2;
              const rr = currentRadius * (0.85 + Math.random() * 0.3);
              spawnFlame(
                cx + Math.cos(angle) * rr,
                cy + Math.sin(angle) * rr,
                Math.max(0.3, intensity)
              );
            }
          }
          if (now - lastSmokeTime > 130 && p > -0.05 && p < 1.2) {
            lastSmokeTime = now;
            const angle = Math.random() * Math.PI * 2;
            const rr = currentRadius * 0.9;
            spawnSmoke(cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr);
          }
        },
      },
      0
    ).call(() => {
      gsap.fromTo(
        revealFlash,
        { scale: 0.2, opacity: 0.95 },
        { scale: 8.5, opacity: 0, duration: 1.05, ease: 'power2.out' }
      );
    });
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
        background: '#FFF2EC',
      }}
    >
      <style>{`
        @keyframes kk-pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
        @keyframes kk-fade-in { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .kk-pulse { animation: kk-pulse 2s ease-in-out infinite; }
        .kk-next-btn { transition: transform 150ms ease; animation: kk-fade-in 600ms ease 1000ms forwards; }
        .kk-next-btn:hover { transform: scale(1.08); }
        .kk-next-btn:active { transform: scale(0.95); }
      `}</style>

      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        aria-label="Go back"
        style={{
          position: 'absolute',
          top: 'max(20px, env(safe-area-inset-top))',
          left: '16px',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          zIndex: 70,
        }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 5L8 12L15 19"
            stroke="#1c1c1c"
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Main Cake Interaction Area */}
      <div
        ref={containerRef}
        onPointerDown={isBurnt ? startDraw : undefined}
        onPointerMove={isBurnt ? draw : undefined}
        onPointerUp={isBurnt ? stopDraw : undefined}
        onPointerCancel={isBurnt ? stopDraw : undefined}
        style={{
          width: '100%',
          maxWidth: '540px',
          height: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          touchAction: 'none',
          cursor: isBurnt && !cut ? 'crosshair' : 'default',
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 25,
            width: '100%',
            height: '100%',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {isBurnt && (
            <div
              style={{
                textAlign: 'center',
                animation: 'kk-fade-in 800ms ease forwards',
              }}
            >
              <h2
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(1.5rem, 4.8vw, 2.4rem)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  margin: '0 0 0.5rem',
                  color: 'var(--plum)',
                }}
              >
                Happy Birthday, My Girl!
              </h2>
            </div>
          )}

          <img
            src="/assets/gifs/2.gif"
            alt="Birthday Cake"
            draggable={false}
            style={{
              width: 'min(230px, 60vw)',
              marginTop: '3rem',
              objectFit: 'contain',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 15px 20px rgba(219, 144, 150, 0.35))',
              opacity: isBurnt ? 1 : 0,
              transform: isBurnt ? 'scale(1)' : 'scale(0.9)',
              transition: 'opacity 800ms ease 300ms, transform 800ms ease 300ms',
            }}
          />

          {isBurnt && !cut && swipeProgress > 0 && (
            <div style={{ marginTop: '3rem' }}>
              <div style={{ position: 'relative', width: '4rem', height: '4rem' }}>
                <svg
                  viewBox="0 0 120 120"
                  style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}
                >
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="rgba(219, 144, 150, 0.15)"
                    strokeWidth="8"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="52"
                    fill="none"
                    stroke="#db9096"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52}`}
                    strokeDashoffset={`${2 * Math.PI * 52 * (1 - swipeProgress / 100)}`}
                    style={{ transition: 'stroke-dashoffset 0.1s linear' }}
                  />
                </svg>
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    color: '#db9096',
                  }}
                >
                  {Math.round(swipeProgress)}%
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Burn Initiation Overlay (Flame Button) */}
      {!isBurning && !isBurnt && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 30,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(255, 245, 245, 0.80)',
              backdropFilter: 'blur(3px)',
            }}
          />
          <div
            onClick={handleIgnite}
            role="button"
            tabIndex={0}
            aria-label="Ignite cake"
            style={{
              position: 'relative',
              zIndex: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '8rem',
              height: '8rem',
              borderRadius: '9999px',
              cursor: 'pointer',
              transition: 'all 300ms',
              background: 'linear-gradient(145deg, #e0c6c9, #f5ebec)',
              boxShadow:
                '10px 10px 25px rgba(168, 94, 100, 0.35), -10px -10px 25px rgba(255, 255, 255, 0.9), inset 2px 2px 5px rgba(255, 255, 255, 0.2), inset -2px -2px 5px rgba(168, 94, 100, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.4)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: '0.5rem',
                borderRadius: '9999px',
                background:
                  'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.6), transparent 60%)',
                boxShadow: 'inset 0 0 15px rgba(219, 144, 150, 0.15)',
              }}
            />
            <span
              style={{
                position: 'relative',
                zIndex: 10,
                fontSize: '3rem',
                filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))',
              }}
            >
              🔥
            </span>
          </div>
        </div>
      )}

      {/* Burn canvas and ember container */}
      <canvas
        ref={burnCanvasRef}
        style={{ display: isBurning && !isBurnt ? 'block' : 'none' }}
      />
      <div
        ref={emberLayerRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          display: isBurning && !isBurnt ? 'block' : 'none',
        }}
      />
      <div
        ref={flashRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: '9999px',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: 50,
          transform: 'translate(-50%, -50%)',
          background:
            'radial-gradient(circle, rgba(255,247,225,0.98) 0%, rgba(255,170,80,0.65) 35%, transparent 70%)',
        }}
      />

      {/* Next button */}
      {isBurnt && cut && (
        <button
          type="button"
          className="kk-next-btn"
          onClick={onNext}
          aria-label="Next"
          style={{
            position: 'fixed',
            right: '18px',
            bottom: 'max(20px, env(safe-area-inset-bottom))',
            width: '46px',
            height: '46px',
            borderRadius: '9999px',
            border: '1.5px solid #1c1c1c',
            background: '#FFF2EC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 60,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12H19M19 12L13 6M19 12L13 18"
              stroke="#1c1c1c"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
