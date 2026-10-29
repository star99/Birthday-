import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import CelestialLoveLetterDialog from './CelestialLoveLetterDialog.jsx';
import RoyalScrapbookScreen from './RoyalScrapbookScreen.jsx';
import KineticBirthdayFinaleScreen from './KineticBirthdayFinaleScreen.jsx';

/**
 * BabyPinkCelestialScreen Component
 * 
 * Features:
 * - Baby pink celestial dreamscape with 65 twinkling stars & floating crescent moon
 * - 2D Grand-Level Birthday Cake on stationary ornate gold pedestal stand
 * - 5 glowing animated candles:
 *   - Extinguish/blow out WITH sound as soon as the user starts cutting!
 * - Slide-to-Cut Interaction:
 *   - Only the cake tiers cut and separate cleanly to left & right (pedestal remains stationary)
 * - Surprise Gift Box:
 *   - Revealed resting right inside the cake on the golden stand once cut!
 *   - Interactive: tap the gift box for an extra sparkle burst and sweet birthday wish
 * - Spectacular Fireworks:
 *   - Colorful rockets shooting up and exploding across the sky
 *   - Authentic sound effects: rocket launch whistle, deep explosion boom, and crackling pops (Web Audio API)
 * - Confetti celebration burst and "Relight & Cut Again" option
 */
export default function BabyPinkCelestialScreen({ onBack }) {
  const [isCut, setIsCut] = useState(false);
  const [areCandlesBlown, setAreCandlesBlown] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [showSlashFlash, setShowSlashFlash] = useState(false);
  const [knifePos, setKnifePos] = useState({ x: 0, y: 0, visible: false });
  const [showGiftMessage, setShowGiftMessage] = useState(false);
  const [isGiftBouncing, setIsGiftBouncing] = useState(false);
  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [showScrapbook, setShowScrapbook] = useState(false);
  const [showFinale, setShowFinale] = useState(false);

  const containerRef = useRef(null);
  const bladeCanvasRef = useRef(null);
  const fireworksCanvasRef = useRef(null);
  const isDraggingCake = useRef(false);
  const cakeStartPoint = useRef(null);
  const bladePoints = useRef([]);
  const hasCutTriggered = useRef(false);
  const hasBlowTriggered = useRef(false);

  // Slider bar refs
  const sliderTrackRef = useRef(null);
  const isDraggingSlider = useRef(false);
  const [sliderPercent, setSliderPercent] = useState(0);

  // Fireworks engine state ref
  const fireworksEngineRef = useRef({
    rockets: [],
    particles: [],
    isActive: false,
    animId: null,
  });

  // Generate random twinkling stars (optimized count on mobile for smooth performance)
  const stars = useMemo(() => {
    const starTypes = ['✦', '★', '✧', '•', '⋆'];
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 36 : 65;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: (Math.random() * 96 + 2).toFixed(1), // %
      y: (Math.random() * 94 + 3).toFixed(1), // %
      size: (Math.random() * 11 + 6).toFixed(1), // px
      char: starTypes[Math.floor(Math.random() * starTypes.length)],
      twinkleDur: (Math.random() * 3 + 2).toFixed(2), // s
      delay: (Math.random() * 5).toFixed(2), // s
      opacity: (Math.random() * 0.45 + 0.55).toFixed(2),
    }));
  }, []);

  // Web Audio Synthesizer: Slice, Candle Blow, and Realistic Fireworks (Launch Whistle, Boom, Crackle)
  const playSound = useCallback((type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === 'slice') {
        // Metallic blade swoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2800, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.16);
        filter.Q.value = 3.5;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.16);

        gain.gain.setValueAtTime(0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === 'blow') {
        // Candle blow puff
        const bufferSize = Math.floor(ctx.sampleRate * 0.35);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, ctx.currentTime);
        filter.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.35);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        noise.start();
      } else if (type === 'firework_launch') {
        // High-pitched ascending whistle
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1650, ctx.currentTime + 0.28);

        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.32);
      } else if (type === 'firework_boom') {
        // Deep resonant explosion boom
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 0.45);

        gain.gain.setValueAtTime(0.55, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.48);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);

        // Noise rumble
        const bufLen = Math.floor(ctx.sampleRate * 0.45);
        const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
        const bData = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) {
          bData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufLen * 0.22));
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buf;
        const bFilter = ctx.createBiquadFilter();
        bFilter.type = 'lowpass';
        bFilter.frequency.setValueAtTime(800, ctx.currentTime);
        bFilter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.45);

        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(0.38, ctx.currentTime);
        nGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

        noise.connect(bFilter);
        bFilter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start();

        // Sparkle crackles
        for (let k = 0; k < 6; k++) {
          const popTime = ctx.currentTime + 0.12 + Math.random() * 0.32;
          const popOsc = ctx.createOscillator();
          const popGain = ctx.createGain();
          popOsc.type = 'triangle';
          popOsc.frequency.setValueAtTime(1300 + Math.random() * 700, popTime);
          popGain.gain.setValueAtTime(0.07, popTime);
          popGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.035);
          popOsc.connect(popGain);
          popGain.connect(ctx.destination);
          popOsc.start(popTime);
          popOsc.stop(popTime + 0.04);
        }
      } else if (type === 'gift_sparkle') {
        // Magical bell chime
        const notes = [659.25, 783.99, 987.77, 1318.51];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          const t = ctx.currentTime + idx * 0.06;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.75);
        });
      }
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }, []);

  // Fireworks Animation Engine on Fullscreen Canvas
  const ensureFireworksLoop = useCallback(() => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const engine = fireworksEngineRef.current;

    if (engine.animId) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & Draw Rockets
      for (let i = engine.rockets.length - 1; i >= 0; i--) {
        const r = engine.rockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 5) r.trail.shift();

        r.x += r.vx;
        r.y += r.vy;
        r.distanceTraveled += r.speed;

        // Draw rocket trail
        ctx.beginPath();
        ctx.moveTo(r.x, r.y);
        for (let pt of r.trail) {
          ctx.lineTo(pt.x, pt.y);
        }
        ctx.strokeStyle = 'rgba(255, 235, 170, 0.75)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = r.color;
        ctx.fill();

        if (r.distanceTraveled >= r.distanceTotal) {
          explodeRocket(r.targetX, r.targetY, r.color);
          engine.rockets.splice(i, 1);
        }
      }

      // Update & Draw Particles (optimized for 60fps on mobile)
      for (let i = engine.particles.length - 1; i >= 0; i--) {
        const p = engine.particles[i];
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          engine.particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Keep animating only while active
      if (engine.rockets.length > 0 || engine.particles.length > 0) {
        engine.animId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        engine.animId = null;
      }
    };

    engine.animId = requestAnimationFrame(render);
  }, []);

  const spawnFirework = useCallback((targetXRatio, targetYRatio, color) => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    const startX = w * (0.3 + Math.random() * 0.4);
    const startY = h;
    const targetX = w * targetXRatio;
    const targetY = h * targetYRatio;

    // Play whistle launch sound
    playSound('firework_launch');

    const rocket = {
      x: startX,
      y: startY,
      targetX,
      targetY,
      color,
      speed: 13,
      trail: [],
      distanceTotal: Math.hypot(targetX - startX, targetY - startY),
      distanceTraveled: 0,
      vx: 0,
      vy: 0,
    };
    const angle = Math.atan2(targetY - startY, targetX - startX);
    rocket.vx = Math.cos(angle) * rocket.speed;
    rocket.vy = Math.sin(angle) * rocket.speed;

    fireworksEngineRef.current.rockets.push(rocket);
    ensureFireworksLoop();
  }, [playSound, ensureFireworksLoop]);

  // Explode rocket into colorful spark particles
  const explodeRocket = useCallback((x, y, color) => {
    playSound('firework_boom');

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const count = isMobile ? 32 : 52;
    const colors = [color, '#ffd166', '#ffffff', '#ff85a1', '#ffe4e6'];
    const particles = [];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6.5 + 2.0;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1,
        decay: Math.random() * 0.016 + 0.012,
        gravity: 0.11,
        size: Math.random() * 2.8 + 1.8,
      });
    }

    fireworksEngineRef.current.particles.push(...particles);
    ensureFireworksLoop();
  }, [playSound, ensureFireworksLoop]);

  // Run the fireworks show sequence when cake is cut
  const launchFireworksShow = useCallback(() => {
    // 5 glorious bursts across the celestial sky
    const showTimeline = [
      { delay: 60, x: 0.28, y: 0.22, color: '#ffd166' },
      { delay: 350, x: 0.72, y: 0.20, color: '#ff85a1' },
      { delay: 720, x: 0.50, y: 0.16, color: '#48cae4' },
      { delay: 1100, x: 0.22, y: 0.28, color: '#c77dff' },
      { delay: 1550, x: 0.78, y: 0.25, color: '#f77f00' },
      { delay: 2000, x: 0.50, y: 0.20, color: '#ffffff' },
    ];

    showTimeline.forEach(shot => {
      setTimeout(() => {
        spawnFirework(shot.x, shot.y, shot.color);
      }, shot.delay);
    });
  }, [spawnFirework]);

  // Setup Fireworks Canvas Resize
  useEffect(() => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      if (fireworksEngineRef.current.animId) {
        cancelAnimationFrame(fireworksEngineRef.current.animId);
        fireworksEngineRef.current.animId = null;
      }
    };
  }, []);

  // Confetti burst on cake cut
  const triggerConfetti = useCallback(() => {
    const confettiColors = ['#ff85a1', '#fbb1bd', '#ffd166', '#a8dadc', '#ffffff', '#f4a261'];
    confetti({
      particleCount: 160,
      spread: 95,
      origin: { y: 0.6 },
      colors: confettiColors,
      gravity: 0.85,
      ticks: 280,
      scalar: 1.05,
    });
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 55,
        spread: 50,
        origin: { x: 0.12, y: 0.65 },
        colors: confettiColors,
      });
      confetti({
        particleCount: 80,
        angle: 125,
        spread: 50,
        origin: { x: 0.88, y: 0.65 },
        colors: confettiColors,
      });
    }, 200);
  }, []);

  // Action: Blow out the candles with audio & visual smoke
  const blowCandles = useCallback(() => {
    if (hasBlowTriggered.current) return;
    hasBlowTriggered.current = true;
    setAreCandlesBlown(true);
    playSound('blow');
  }, [playSound]);

  // Master Cake Cut Handler: Cut ONLY the cake tiers, reveal gift box, shoot fireworks & sound
  const triggerCut = useCallback(() => {
    if (hasCutTriggered.current || isCut) return;
    hasCutTriggered.current = true;

    // Ensure candles are blown out as part of cutting
    blowCandles();

    setIsCut(true);
    setShowSlashFlash(true);
    setSwipeProgress(100);
    setSliderPercent(100);

    // Audio sequence: blade slice
    playSound('slice');

    // Visual celebrations: Confetti and real Fireworks with launch/boom sounds!
    triggerConfetti();
    launchFireworksShow();

    setTimeout(() => {
      setShowSlashFlash(false);
      bladePoints.current = [];
    }, 450);
  }, [isCut, blowCandles, playSound, triggerConfetti, launchFireworksShow]);

  // Reset to relight cake
  const handleRelight = () => {
    setIsCut(false);
    setAreCandlesBlown(false);
    hasCutTriggered.current = false;
    hasBlowTriggered.current = false;
    setSwipeProgress(0);
    setSliderPercent(0);
    bladePoints.current = [];
    setKnifePos(prev => ({ ...prev, visible: false }));
    setShowGiftMessage(false);
  };

  // Gift box tap interaction: trigger bounce, confetti, and reveal black celestial letter dialog
  const handleGiftBoxClick = () => {
    setIsGiftBouncing(true);
    playSound('gift_sparkle');
    setShowGiftMessage(true);

    confetti({
      particleCount: 50,
      spread: 65,
      origin: { y: 0.55 },
      colors: ['#ffd166', '#ff85a1', '#ffffff'],
      scalar: 0.9,
    });

    setTimeout(() => {
      setIsGiftBouncing(false);
      setIsLetterModalOpen(true);
    }, 450);
  };

  const renderBladeRef = useRef(null);

  // Setup Blade Trail Canvas
  useEffect(() => {
    const canvas = bladeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      if (!canvas || !containerRef.current) return;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bladePoints.current.length > 1) {
        const pts = bladePoints.current;
        const start = pts[0];
        const end = pts[pts.length - 1];

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }

        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, 'rgba(255, 235, 170, 0.95)');
        gradient.addColorStop(0.5, 'rgba(255, 130, 160, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      if (bladePoints.current.length > 20) {
        bladePoints.current.shift();
      } else if (bladePoints.current.length > 0) {
        bladePoints.current.shift();
      }

      if (bladePoints.current.length > 0) {
        renderBladeRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderBladeRef.current = null;
      }
    };

    renderBladeRef.current = null;

    return () => {
      window.removeEventListener('resize', resize);
      if (renderBladeRef.current) {
        cancelAnimationFrame(renderBladeRef.current);
        renderBladeRef.current = null;
      }
    };
  }, []);

  const ensureBladeLoop = () => {
    if (renderBladeRef.current) return;
    const canvas = bladeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (bladePoints.current.length > 1) {
        const pts = bladePoints.current;
        const start = pts[0];
        const end = pts[pts.length - 1];

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }

        const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
        gradient.addColorStop(0, 'rgba(255, 235, 170, 0.95)');
        gradient.addColorStop(0.5, 'rgba(255, 130, 160, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');

        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      if (bladePoints.current.length > 20) {
        bladePoints.current.shift();
      } else if (bladePoints.current.length > 0) {
        bladePoints.current.shift();
      }

      if (bladePoints.current.length > 0) {
        renderBladeRef.current = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderBladeRef.current = null;
      }
    };

    renderBladeRef.current = requestAnimationFrame(render);
  };

  // Cake Swipe Pointer Handlers
  const getRelativeCoords = (e) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const handleCakePointerDown = (e) => {
    if (isCut) return;
    isDraggingCake.current = true;
    bladePoints.current = [];
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    const coords = getRelativeCoords(e);
    cakeStartPoint.current = coords;
    setKnifePos({ x: coords.x, y: coords.y, visible: true });
    setSwipeProgress(0);
  };

  const handleCakePointerMove = (e) => {
    if (!isDraggingCake.current || isCut) return;
    const coords = getRelativeCoords(e);
    bladePoints.current.push(coords);
    ensureBladeLoop();
    setKnifePos({ x: coords.x, y: coords.y, visible: true });

    if (cakeStartPoint.current) {
      const dx = coords.x - cakeStartPoint.current.x;
      const dy = coords.y - cakeStartPoint.current.y;
      const dist = Math.hypot(dx, dy);
      const prog = Math.min((dist / 75) * 100, 100);
      setSwipeProgress(prog);

      // As soon as user starts sliding/cutting (dist > 18px), blow out the candles!
      if (dist >= 18 && !areCandlesBlown) {
        blowCandles();
      }

      // Complete cut when threshold crossed
      if (prog >= 100) {
        triggerCut();
        isDraggingCake.current = false;
        try {
          e.currentTarget.releasePointerCapture(e.pointerId);
        } catch {}
      }
    }
  };

  const handleCakePointerUp = (e) => {
    if (!isDraggingCake.current) return;
    isDraggingCake.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    setKnifePos(prev => ({ ...prev, visible: false }));
    bladePoints.current = [];
    if (!isCut) {
      setSwipeProgress(0);
    }
  };

  // Slider Bar Pointer Handlers
  const handleSliderPointerDown = (e) => {
    if (isCut) return;
    isDraggingSlider.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    updateSliderFromEvent(e);
  };

  const handleSliderPointerMove = (e) => {
    if (!isDraggingSlider.current || isCut) return;
    updateSliderFromEvent(e);
  };

  const handleSliderPointerUp = (e) => {
    if (!isDraggingSlider.current) return;
    isDraggingSlider.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
    if (sliderPercent >= 82) {
      triggerCut();
    } else {
      setSliderPercent(0);
    }
  };

  const updateSliderFromEvent = (e) => {
    if (!sliderTrackRef.current) return;
    const rect = sliderTrackRef.current.getBoundingClientRect();
    const clientX = e.clientX;
    const rawPercent = ((clientX - rect.left) / rect.width) * 100;
    const clamped = Math.max(0, Math.min(100, rawPercent));
    setSliderPercent(clamped);

    // As soon as sliding begins (clamped > 15%), blow out the candles!
    if (clamped >= 15 && !areCandlesBlown) {
      blowCandles();
    }

    if (clamped >= 85 && !isCut) {
      triggerCut();
      isDraggingSlider.current = false;
    }
  };

  return (
    <div className="celestial-root fixed inset-0 overflow-hidden select-none">
      <style>{`
        @keyframes celestialFadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }

        .celestial-root {
          width: 100vw;
          height: 100dvh;
          background: radial-gradient(circle at 50% 25%, #ffe6ee 0%, #ffd1dc 45%, #fbcfe8 85%, #f9a8d4 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          animation: celestialFadeIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          touch-action: none;
        }

        /* Fullscreen fireworks canvas layer */
        .fireworks-canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 15;
        }

        /* Ambient soft pastel glow */
        .celestial-glow {
          position: absolute;
          width: 75vw;
          height: 75vw;
          max-width: 650px;
          max-height: 650px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.5) 0%, rgba(255, 209, 220, 0.25) 50%, transparent 75%);
          border-radius: 50%;
          filter: blur(45px);
          pointer-events: none;
        }

        /* Twinkling star animation */
        @keyframes starTwinkle {
          0%, 100% {
            opacity: var(--base-op, 0.7);
            transform: scale(0.85);
            filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.6));
          }
          50% {
            opacity: 1;
            transform: scale(1.25);
            filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 16px rgba(255, 240, 180, 0.7));
          }
        }

        .celestial-star {
          position: absolute;
          color: #ffffff;
          pointer-events: none;
          will-change: transform, opacity;
          animation: starTwinkle var(--dur, 3s) ease-in-out infinite;
          animation-delay: var(--del, 0s);
        }

        /* Floating crescent moon */
        @keyframes moonFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-12px) rotate(2deg); }
        }

        /* Shooting star across the sky */
        @keyframes shootingStar {
          0% { transform: translate(-100px, -50px) rotate(-35deg) scaleX(0); opacity: 0; }
          10% { opacity: 1; }
          30% { transform: translate(350px, 200px) rotate(-35deg) scaleX(1); opacity: 1; }
          40% { transform: translate(500px, 280px) rotate(-35deg) scaleX(0.2); opacity: 0; }
          100% { transform: translate(500px, 280px) rotate(-35deg) scaleX(0); opacity: 0; }
        }

        .shooting-star-1 {
          position: absolute;
          top: 15%;
          left: 12%;
          width: 140px;
          height: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0.95), rgba(255,235,180,0.6), transparent);
          border-radius: 999px;
          filter: drop-shadow(0 0 6px #fff);
          pointer-events: none;
          animation: shootingStar 9s ease-in-out infinite;
        }

        /* Back navigation button */
        .celestial-back-btn {
          position: absolute;
          top: max(20px, env(safe-area-inset-top));
          left: 20px;
          z-index: 50;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          color: #8A1C34;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.04em;
          box-shadow: 0 4px 16px rgba(219, 144, 150, 0.25);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .celestial-back-btn:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateX(-2px);
          box-shadow: 0 6px 20px rgba(219, 144, 150, 0.35);
        }

        /* Candle Flame Flickering Animation */
        @keyframes flameFlicker {
          0%, 100% {
            transform: scale(1) rotate(-1.5deg);
            filter: drop-shadow(0 0 7px #ffb703) drop-shadow(0 0 16px #ff7b00);
          }
          25% {
            transform: scale(1.08, 0.92) rotate(2deg);
            filter: drop-shadow(0 0 10px #ffd000) drop-shadow(0 0 20px #ff5400);
          }
          50% {
            transform: scale(0.94, 1.06) rotate(-2deg);
            filter: drop-shadow(0 0 8px #ffaa00) drop-shadow(0 0 15px #ff7b00);
          }
          75% {
            transform: scale(1.05, 0.96) rotate(1deg);
            filter: drop-shadow(0 0 11px #ffe600) drop-shadow(0 0 22px #ff3c00);
          }
        }

        .flame-element {
          position: absolute;
          transform-origin: 50% 90%;
          animation: flameFlicker var(--flicker-dur, 0.75s) ease-in-out infinite alternate;
          animation-delay: var(--flicker-del, 0s);
          pointer-events: none;
          transition: transform 0.25s ease, opacity 0.25s ease;
        }

        .flame-element.blown-out {
          transform: scale(0) translateY(-8px) !important;
          opacity: 0 !important;
        }

        /* Smoke Wisp Rising Animation */
        @keyframes smokeWisp {
          0% {
            opacity: 0.9;
            transform: translateY(0) scale(0.6) rotate(0deg);
          }
          50% {
            opacity: 0.6;
            transform: translateY(-24px) scale(1.3) rotate(14deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-48px) scale(1.9) rotate(-22deg);
          }
        }

        .smoke-wisp {
          position: absolute;
          width: 8px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(220, 220, 220, 0.78) 0%, rgba(180, 180, 180, 0.35) 60%, transparent 85%);
          filter: blur(1.5px);
          pointer-events: none;
          animation: smokeWisp 1.4s ease-out forwards;
        }

        /* Stationary Golden Pedestal Stand (Never Cut) */
        .cake-stand-base {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          clip-path: polygon(0% 74%, 100% 74%, 100% 100%, 0% 100%);
          pointer-events: none;
          user-select: none;
          filter: drop-shadow(0 14px 22px rgba(219, 144, 150, 0.38));
          z-index: 2;
        }

        /* Cake Tiers Halves Splitting (Only the cake tiers cut) */
        .cake-tiers {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          transition: transform 0.85s cubic-bezier(0.18, 0.9, 0.28, 1.15);
          will-change: transform;
          user-select: none;
          pointer-events: none;
          z-index: 3;
        }

        .cake-tiers.left {
          clip-path: polygon(0% 0%, 50% 0%, 50% 74.8%, 0% 74.8%);
        }

        .cake-tiers.right {
          clip-path: polygon(50% 0%, 100% 0%, 100% 74.8%, 50% 74.8%);
        }

        .cake-tiers.left.is-cut {
          transform: translate3d(-34px, 2px, 0) rotate(-4.5deg);
        }

        .cake-tiers.right.is-cut {
          transform: translate3d(34px, 2px, 0) rotate(4.5deg);
        }

        /* Slash Light Flare */
        @keyframes slashBeam {
          0% {
            opacity: 0;
            transform: scaleY(0);
          }
          40% {
            opacity: 1;
            transform: scaleY(1.2);
          }
          100% {
            opacity: 0;
            transform: scaleY(1.5);
          }
        }

        .slash-flash {
          position: absolute;
          top: 0;
          left: calc(50% - 3px);
          width: 6px;
          height: 74%;
          background: linear-gradient(180deg, #fff, #ffd166, #ff85a1, #fff);
          box-shadow: 0 0 25px 8px rgba(255, 230, 160, 0.95);
          border-radius: 999px;
          z-index: 35;
          pointer-events: none;
          animation: slashBeam 0.5s ease-out forwards;
        }

        /* SURPRISE GIFT BOX INSIDE CAKE */
        @keyframes giftPopIn {
          0% {
            opacity: 0;
            transform: translate(-50%, -40%) scale(0.2) rotate(-10deg);
          }
          65% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.12) rotate(3deg);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1) rotate(0deg);
          }
        }

        @keyframes giftGentleFloat {
          0%, 100% {
            transform: translate(-50%, -50%) translateY(0px);
          }
          50% {
            transform: translate(-50%, -50%) translateY(-6px);
          }
        }

        .gift-box-wrapper {
          position: absolute;
          top: 48%;
          left: 50%;
          width: min(135px, 34vw);
          aspect-ratio: 1;
          z-index: 8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: giftPopIn 0.8s cubic-bezier(0.18, 0.9, 0.28, 1.15) forwards, giftGentleFloat 4s ease-in-out 0.8s infinite;
          filter: drop-shadow(0 8px 20px rgba(255, 133, 161, 0.45)) drop-shadow(0 0 25px rgba(255, 215, 0, 0.65));
        }

        .gift-box-wrapper.bouncing {
          transform: translate(-50%, -50%) scale(1.18) rotate(6deg) !important;
          transition: transform 0.25s ease !important;
        }

        /* Swipe Hint Pulse */
        @keyframes hintPulse {
          0%, 100% {
            transform: translateY(0);
            opacity: 0.92;
          }
          50% {
            transform: translateY(-4px);
            opacity: 1;
          }
        }

        .swipe-hint-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: 999px;
          box-shadow: 0 4px 14px rgba(219, 144, 150, 0.22);
          color: #7a1d36;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.03em;
          animation: hintPulse 2.4s ease-in-out infinite;
          margin-bottom: 8px;
        }

        /* Draggable Slide to Cut Track */
        .slider-track {
          position: relative;
          width: min(290px, 78vw);
          height: 48px;
          background: rgba(255, 255, 255, 0.65);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          border-radius: 999px;
          box-shadow: 0 8px 24px rgba(219, 144, 150, 0.28), inset 0 2px 6px rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          padding: 4px;
          cursor: grab;
          touch-action: none;
          user-select: none;
          margin-top: 14px;
        }

        .slider-track:active {
          cursor: grabbing;
        }

        .slider-fill {
          position: absolute;
          left: 4px;
          top: 4px;
          bottom: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255, 182, 193, 0.7), rgba(255, 133, 161, 0.85));
          pointer-events: none;
          transition: width 0.05s linear;
        }

        .slider-handle {
          position: absolute;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: linear-gradient(135deg, #ffffff, #fff1f2);
          border: 1.5px solid rgba(255, 255, 255, 0.95);
          box-shadow: 0 4px 12px rgba(219, 144, 150, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 19px;
          cursor: grab;
          transition: transform 0.05s linear;
          z-index: 5;
        }

        .slider-text {
          position: absolute;
          width: 100%;
          text-align: center;
          color: #8A1C34;
          font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          pointer-events: none;
          z-index: 2;
        }

        /* Wish celebration banner */
        @keyframes bannerPop {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(15px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .wish-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 12px 24px;
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(219, 144, 150, 0.32);
          animation: bannerPop 0.6s cubic-bezier(0.18, 0.9, 0.28, 1.15) forwards;
          margin-top: 10px;
          z-index: 25;
        }

        .relight-btn {
          margin-top: 4px;
          padding: 6px 14px;
          background: linear-gradient(135deg, #ff85a1, #f43f5e);
          color: #ffffff;
          border: none;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(244, 63, 94, 0.3);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .relight-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(244, 63, 94, 0.4);
        }

        .relight-btn:active {
          transform: scale(0.96);
        }

        /* Gift Message Popup */
        @keyframes giftToastAnim {
          0% {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .gift-toast {
          position: absolute;
          top: -38px;
          left: 50%;
          transform: translate(-50%, 0);
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(8px);
          border: 1px solid #ffd166;
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 11px;
          font-weight: 700;
          color: #b5179e;
          white-space: nowrap;
          box-shadow: 0 4px 16px rgba(255, 209, 102, 0.5);
          animation: giftToastAnim 0.35s ease-out forwards;
          pointer-events: none;
        }
      `}</style>

      {/* Hide celestial cake background when scrapbook or finale is active for pure 60fps performance */}
      {!showScrapbook && !showFinale && (
        <>
          {/* Fullscreen Fireworks Canvas */}
          <canvas ref={fireworksCanvasRef} className="fireworks-canvas" />

      {/* Back button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="celestial-back-btn"
          aria-label="Back to roll screen"
        >
          <span>←</span>
          <span>Back</span>
        </button>
      )}

      {/* Atmospheric center glow */}
      <div className="celestial-glow" />

      {/* Shooting stars */}
      <div className="shooting-star-1" />

      {/* Twinkling tiny stars */}
      {stars.map(star => (
        <span
          key={star.id}
          className="celestial-star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            fontSize: `${star.size}px`,
            '--dur': `${star.twinkleDur}s`,
            '--del': `${star.delay}s`,
            '--base-op': star.opacity,
          }}
        >
          {star.char}
        </span>
      ))}

      {/* Hero glowing celestial crescent moon in the upper sky */}
      <div
        style={{
          position: 'absolute',
          top: '5%',
          right: '9%',
          width: 'clamp(60px, 14vw, 85px)',
          height: 'clamp(60px, 14vw, 85px)',
          animation: 'moonFloat 6.5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 28px rgba(255, 225, 140, 0.7))',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path
            d="M50 5 A45 45 0 1 0 95 50 A35 35 0 1 1 50 5 Z"
            fill="url(#celestialHeroMoonGrad)"
          />
          <circle cx="48" cy="35" r="2" fill="#ffffff" opacity="0.9" />
          <circle cx="38" cy="55" r="2.5" fill="#ffffff" opacity="0.8" />
          <defs>
            <linearGradient id="celestialHeroMoonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="45%" stopColor="#fff8db" />
              <stop offset="85%" stopColor="#ffe699" />
              <stop offset="100%" stopColor="#ffd27f" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Mini distant moon on upper left */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          width: '32px',
          height: '32px',
          filter: 'drop-shadow(0 0 8px rgba(255, 240, 200, 0.7))',
          pointerEvents: 'none',
          opacity: 0.85,
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%">
          <path
            d="M50 5 A45 45 0 1 0 95 50 A35 35 0 1 1 50 5 Z"
            fill="#fff8dc"
          />
        </svg>
      </div>

      {/* MAIN 2D GRAND CAKE INTERACTIVE SECTION */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 20,
          marginTop: '10px',
        }}
      >
        {/* Swipe instruction badge */}
        {!isCut && (
          <div className="swipe-hint-badge">
            <span>✨</span>
            <span>Slide across cake to cut</span>
            <span>🎂</span>
          </div>
        )}

        {/* Cake Container Box */}
        <div
          ref={containerRef}
          onPointerDown={handleCakePointerDown}
          onPointerMove={handleCakePointerMove}
          onPointerUp={handleCakePointerUp}
          onPointerCancel={handleCakePointerUp}
          style={{
            position: 'relative',
            width: 'min(330px, 76vw)',
            height: 'min(460px, 56dvh)',
            aspectRatio: '686 / 959',
            touchAction: 'none',
            cursor: !isCut ? 'crosshair' : 'default',
          }}
        >
          {/* Real-time neon blade drawing canvas */}
          <canvas
            ref={bladeCanvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              pointerEvents: 'none',
              zIndex: 30,
              width: '100%',
              height: '100%',
            }}
          />

          {/* Slicing light flash when cut completes */}
          {showSlashFlash && <div className="slash-flash" />}

          {/* STATIONARY GOLDEN PEDESTAL STAND (NEVER CUT) */}
          <div className="cake-stand-base">
            <img
              src="/assets/flower/grand_cake.png"
              alt="Grand Cake Pedestal Stand"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
              }}
            />
          </div>

          {/* SURPRISE GIFT BOX INSIDE CAKE (Revealed between the parted cake tiers) */}
          {isCut && (
            <div
              className={`gift-box-wrapper ${isGiftBouncing ? 'bouncing' : ''}`}
              onClick={handleGiftBoxClick}
              role="button"
              tabIndex={0}
              aria-label="Surprise Gift Box"
            >
              {/* Floating hint / message */}
              {showGiftMessage ? (
                <div className="gift-toast">
                  <span>🎉 A Special Wish Just For You! 💖</span>
                </div>
              ) : (
                <div className="gift-toast" style={{ color: '#8A1C34' }}>
                  <span>✨ Tap Gift! 🎁</span>
                </div>
              )}

              {/* Radiant background halo */}
              <div
                style={{
                  position: 'absolute',
                  inset: '-18px',
                  background: 'radial-gradient(circle, rgba(255, 230, 150, 0.7) 0%, rgba(255, 182, 193, 0.4) 50%, transparent 75%)',
                  borderRadius: '50%',
                  filter: 'blur(8px)',
                  pointerEvents: 'none',
                }}
              />

              <img
                src="/assets/flower/gift_box.png"
                alt="Surprise Birthday Gift Box"
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}

          {/* LEFT CAKE TIERS HALF (Cuts and separates to the left) */}
          <div className={`cake-tiers left ${isCut ? 'is-cut' : ''}`}>
            <img
              src="/assets/flower/grand_cake.png"
              alt="Grand Birthday Cake Left Tier"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 22px rgba(219, 144, 150, 0.38))',
              }}
            />
          </div>

          {/* RIGHT CAKE TIERS HALF (Cuts and separates to the right) */}
          <div className={`cake-tiers right ${isCut ? 'is-cut' : ''}`}>
            <img
              src="/assets/flower/grand_cake.png"
              alt="Grand Birthday Cake Right Tier"
              draggable={false}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                filter: 'drop-shadow(0 14px 22px rgba(219, 144, 150, 0.38))',
              }}
            />
          </div>

          {/* 5 GLOWING ANIMATED CANDLE FLAMES & SMOKE EFFECTS */}
          {[
            { id: 1, left: 35.1, top: 1.5, dur: '0.7s', del: '0.0s', moveLeft: true },
            { id: 2, left: 42.4, top: 2.2, dur: '0.82s', del: '0.15s', moveLeft: true },
            { id: 3, left: 49.9, top: 0.3, dur: '0.65s', del: '0.08s', moveLeft: false },
            { id: 4, left: 57.3, top: 2.1, dur: '0.78s', del: '0.2s', moveLeft: false },
            { id: 5, left: 64.1, top: 1.4, dur: '0.72s', del: '0.12s', moveLeft: false },
          ].map(flame => {
            const shiftX = isCut ? (flame.moveLeft ? -34 : 34) : 0;
            const shiftY = isCut ? 2 : 0;
            const shiftRot = isCut ? (flame.moveLeft ? -4.5 : 4.5) : 0;

            return (
              <div
                key={flame.id}
                style={{
                  position: 'absolute',
                  left: `${flame.left}%`,
                  top: `${flame.top}%`,
                  width: '16px',
                  height: '24px',
                  transform: `translate(-50%, -50%) translate3d(${shiftX}px, ${shiftY}px, 0) rotate(${shiftRot}deg)`,
                  transition: 'transform 0.85s cubic-bezier(0.18, 0.9, 0.28, 1.15)',
                  pointerEvents: 'none',
                  zIndex: 25,
                }}
              >
                {/* Lit Dancing Flame (Extinguishes as soon as cutting starts) */}
                <div
                  className={`flame-element ${areCandlesBlown ? 'blown-out' : ''}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    '--flicker-dur': flame.dur,
                    '--flicker-del': flame.del,
                  }}
                >
                  <svg viewBox="0 0 20 30" width="100%" height="100%">
                    <defs>
                      <linearGradient id={`flameGrad-${flame.id}`} x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="#ff4500" />
                        <stop offset="35%" stopColor="#ff9f1c" />
                        <stop offset="70%" stopColor="#ffd000" />
                        <stop offset="100%" stopColor="#ffffff" />
                      </linearGradient>
                      <radialGradient id={`coreGlow-${flame.id}`} cx="50%" cy="60%" r="50%">
                        <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                        <stop offset="60%" stopColor="#fff275" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#ff9900" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    {/* Outer flame */}
                    <path
                      d="M10 2 Q16 12 15 22 Q14 28 10 28 Q6 28 5 22 Q4 12 10 2 Z"
                      fill={`url(#flameGrad-${flame.id})`}
                    />
                    {/* Inner hot core */}
                    <ellipse cx="10" cy="20" rx="3" ry="5.5" fill={`url(#coreGlow-${flame.id})`} />
                  </svg>
                </div>

                {/* Soft smoke wisp drifting after blowing out */}
                {areCandlesBlown && (
                  <div
                    className="smoke-wisp"
                    style={{
                      left: '4px',
                      top: '2px',
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Floating Knife Cursor following finger/swipe */}
          {knifePos.visible && !isCut && (
            <div
              style={{
                position: 'absolute',
                left: `${knifePos.x}px`,
                top: `${knifePos.y}px`,
                transform: 'translate(-50%, -50%) rotate(-45deg)',
                fontSize: '26px',
                filter: 'drop-shadow(0 2px 8px rgba(255, 209, 102, 0.9))',
                pointerEvents: 'none',
                zIndex: 40,
                transition: 'transform 0.05s ease',
              }}
            >
              🔪
            </div>
          )}
        </div>

        {/* CUT OPTION: INTERACTIVE SLIDER BAR BELOW THE CAKE */}
        {!isCut ? (
          <div
            ref={sliderTrackRef}
            className="slider-track"
            onPointerDown={handleSliderPointerDown}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerUp}
            onPointerCancel={handleSliderPointerUp}
            role="slider"
            aria-label="Slide to cut the cake"
            aria-valuenow={Math.round(sliderPercent)}
          >
            <div
              className="slider-fill"
              style={{ width: `calc(${sliderPercent}% + 4px)` }}
            />
            <span className="slider-text">
              {sliderPercent > 10 ? `${Math.round(sliderPercent)}% Cut` : 'Slide to cut cake ➔'}
            </span>
            <div
              className="slider-handle"
              style={{
                transform: `translateX(calc(${sliderPercent} * (min(290px, 78vw) - 48px) / 100))`,
              }}
            >
              <span>🔪</span>
            </div>
          </div>
        ) : (
          /* Celebratory Wish Badge upon Cut */
          <div className="wish-badge">
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#8A1C34', letterSpacing: '0.12em' }}>
              ✦ MAKE A WISH! ✦
            </span>
            <span style={{ fontSize: '12px', color: '#a03b54', fontWeight: 500 }}>
              The cake has been cut! Surprise gift revealed! 🎁🎂✨
            </span>
            <button
              type="button"
              className="relight-btn"
              onClick={handleRelight}
            >
              🕯️ Relight & Cut Again
            </button>
          </div>
        )}
      </div>

      {/* Soft pastel ambient clouds at screen bottom */}
      <div
        style={{
          position: 'absolute',
          bottom: '-35px',
          left: '-40px',
          width: '280px',
          height: '130px',
          background: 'rgba(255, 255, 255, 0.65)',
          borderRadius: '50%',
          filter: 'blur(16px)',
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-40px',
          right: '-40px',
          width: '320px',
          height: '150px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '50%',
          filter: 'blur(18px)',
          pointerEvents: 'none',
          opacity: 0.4,
        }}
      />
      </>
      )}

      {/* Black Screen Dialog with Stars, Movable Moon, Shining Star, Letter Box & Love Letters */}
      <CelestialLoveLetterDialog
        isOpen={isLetterModalOpen && !showScrapbook}
        onClose={() => setIsLetterModalOpen(false)}
        onNotEnough={() => {
          setIsLetterModalOpen(false);
          setShowScrapbook(true);
        }}
      />

      {/* Royal Scrapbook Screen (Pristine White Background, Moving Stars, Drifting Moons, 3D Flipping Book) */}
      {showScrapbook && !showFinale && (
        <RoyalScrapbookScreen
          onBack={() => {
            setShowScrapbook(false);
            setIsLetterModalOpen(true);
          }}
          onNext={() => {
            setShowFinale(true);
          }}
        />
      )}

      {/* Kinetic Birthday Finale Screen (Inspired by Dribbble "ooooh myyy goood" kinetic typography) */}
      {showFinale && (
        <KineticBirthdayFinaleScreen
          onBack={() => {
            setShowFinale(false);
          }}
        />
      )}
    </div>
  );
}
