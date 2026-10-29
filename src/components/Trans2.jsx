import React, { useState, useEffect, useMemo, useRef } from 'react';

/**
 * Trans2 Component
 * 
 * Cinematic floral transition extracted from cinematic-birthday.pages.dev:
 * 1. Uses the exact 10 flowers from the reference website (/flowers/1.png to /flowers/10.png).
 * 2. Preloads all flower textures into cache.
 * 3. Flowers swirl inward along a spiral vortex, settling into a dense, overlapping blanket
 *    that 100% covers the screen.
 * 4. onCovered() triggers ONLY AFTER the screen is 100% completely covered by flowers (at 4000ms),
 *    so the screen redirect behind is completely invisible and seamless.
 * 5. At 4600ms, the floral blanket parts like grand stage curtains (split-left: -180vw, split-right: +180vw)
 *    using pure hardware-accelerated CSS cubic-bezier without any JS interference.
 * 6. Smoothly fades out the stage before unmounting at 7300ms, ensuring zero visual pops or abrupt cutoffs.
 */

const FLOWER_IMAGES = Array.from({ length: 10 }, (_, i) => `/flowers/${i + 1}.png`);
const TAU = 2 * Math.PI;

export default function Trans2({ onCovered, onDone }) {
  const [windowDim, setWindowDim] = useState(null);
  const [phase, setPhase] = useState('idle'); // 'idle' | 'in' | 'covered' | 'split' | 'fading'
  const slotRefs = useRef([]);
  const hasCoveredRef = useRef(false);

  const onCoveredRef = useRef(onCovered);
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onCoveredRef.current = onCovered;
    onDoneRef.current = onDone;
  }, [onCovered, onDone]);

  // Preload flower images
  useEffect(() => {
    FLOWER_IMAGES.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useEffect(() => {
    setWindowDim({
      w: typeof window !== 'undefined' ? window.innerWidth : 1200,
      h: typeof window !== 'undefined' ? window.innerHeight : 800,
    });
  }, []);

  // Compute flower grid and spiral polar trajectory
  const grid = useMemo(() => {
    if (!windowDim) return [];
    const { w, h } = windowDim;

    const isMobile = w < 768;
    const n = isMobile ? Math.max(124, Math.min(w, h) / 3.6) : Math.max(90, Math.min(w, h) / 6.5);
    const cols = Math.ceil(w / n) + 2;
    const rows = Math.ceil(h / n) + 2;
    const startX = (w - (cols - 1) * n) / 2;
    const startY = (h - (rows - 1) * n) / 2;
    const centerX = w / 2;
    const centerY = h / 2;
    const maxR = Math.hypot(w, h) / 2 + 2 * n;
    const flowerSize = isMobile ? 2.24 * n : 2.10 * n; // 100% full blanket coverage with zero gaps

    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const jitter = ((31 * r + 17 * c) % 7) - 3;
        const x = startX + c * n + (r % 2 ? n / 2 : 0) + jitter;
        const y = startY + r * n + jitter;
        const side = x < centerX ? -1 : 1;
        cells.push({
          key: `${r}-${c}`,
          x,
          y,
          size: flowerSize,
          spin: 12 + ((5 * r + 3 * c) % 9),
          spinDelay: -((7 * r + 11 * c) % 9),
          src: FLOWER_IMAGES[(r * cols + c) % FLOWER_IMAGES.length],
          side,
        });
      }
    }

    const mapped = cells.map(cell => {
      const dx = cell.x - centerX;
      const dy = cell.y - centerY;
      const r = Math.hypot(dx, dy);
      let theta = Math.atan2(dy, dx);
      if (theta < 0) theta += TAU;
      return {
        cell,
        r,
        theta,
        order: (r / n) * TAU + theta,
      };
    });

    mapped.sort((a, b) => b.order - a.order);
    const total = mapped.length;

    return mapped.map(({ cell, r, theta }, idx) => {
      const startR = 1.35 * maxR + 0.15 * r;
      const startTheta = theta + 2.6;
      return {
        ...cell,
        r,
        theta,
        startR,
        dx: centerX + Math.cos(startTheta) * startR - cell.x,
        dy: centerY + Math.sin(startTheta) * startR - cell.y,
        delay: (idx / Math.max(1, total - 1)) * 1700,
        duration: 2100,
      };
    });
  }, [windowDim]);

  // Phase scheduling
  useEffect(() => {
    if (!grid.length) return;

    // 0ms: Start swirling in immediately
    const startRaf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setPhase('in'));
    });

    // 1. At 4000ms: Flowers have reached final coordinates and solidly blanket 100% of the screen.
    // ONLY NOW does onCovered() trigger to change the underlying screen seamlessly!
    const coverTimer = setTimeout(() => {
      if (!hasCoveredRef.current) {
        hasCoveredRef.current = true;
        setPhase('covered');
        if (onCoveredRef.current) onCoveredRef.current();
      }
    }, 4000);

    // 2. At 4600ms: Flowers begin grand curtain split to left & right
    const splitTimer = setTimeout(() => {
      setPhase('split');
    }, 4600);

    // 3. At 6400ms: Soft fade-out of stage as flowers reach outer perimeter
    const fadeTimer = setTimeout(() => {
      setPhase('fading');
    }, 6400);

    // 4. At 7300ms: Transition completely done, cleanly unmount Trans2
    const doneTimer = setTimeout(() => {
      if (onDoneRef.current) onDoneRef.current();
    }, 7300);

    return () => {
      cancelAnimationFrame(startRaf);
      clearTimeout(coverTimer);
      clearTimeout(splitTimer);
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [grid]);

  // Swirl RAF animation: runs purely during 'in' phase up to 3900ms
  useEffect(() => {
    let animId;
    if (phase !== 'in' && phase !== 'covered') return;
    if (!windowDim || !grid.length) return;

    const { w, h } = windowDim;
    const centerX = w / 2;
    const centerY = h / 2;
    const startTime = performance.now();

    const render = (now) => {
      const elapsed = now - startTime;

      for (let i = 0; i < grid.length; i++) {
        const el = slotRefs.current[i];
        if (!el) continue;

        const item = grid[i];
        const progress = Math.max(0, Math.min(1, (elapsed - item.delay) / item.duration));
        // Smooth sine ease in-out
        const eased = 0.5 - Math.cos(Math.PI * progress) / 2;

        const curR = item.startR + (item.r - item.startR) * eased;
        const curTheta = item.theta + 2.6 * (1 - eased);

        const curX = centerX + Math.cos(curTheta) * curR - item.x;
        const curY = centerY + Math.sin(curTheta) * curR - item.y;
        const scale = 0.7 + 0.3 * eased;

        el.style.transform = `translate3d(${curX}px, ${curY}px, 0) scale(${scale})`;
      }

      // Stop once all flowers have arrived
      if (elapsed < 3900) {
        animId = requestAnimationFrame(render);
      } else {
        // Ensure final exact resting matrix on all flowers
        for (let i = 0; i < grid.length; i++) {
          const el = slotRefs.current[i];
          if (el) el.style.transform = 'translate3d(0px, 0px, 0) scale(1)';
        }
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [phase, grid, windowDim]);

  if (!grid.length) return null;

  return (
    <div
      className={`trans2-flower-stage ${phase === 'fading' ? 'is-fading' : ''}`}
      aria-hidden="true"
    >
      <style>{`
        .trans2-flower-stage {
          position: fixed;
          inset: 0;
          z-index: 99999;
          overflow: hidden;
          pointer-events: none;
          opacity: 1;
          transition: opacity 850ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .trans2-flower-stage.is-fading {
          opacity: 0;
        }

        .trans2-flower-slot {
          position: absolute;
          will-change: transform;
          backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }

        /* Grand floral curtain split transition (hardware-accelerated GPU transition) */
        .trans2-flower-slot.split-left {
          transition: transform 2500ms cubic-bezier(0.16, 1, 0.3, 1) !important;
          transform: translate3d(-180vw, 0, 0) scale(1.02) !important;
        }

        .trans2-flower-slot.split-right {
          transition: transform 2500ms cubic-bezier(0.16, 1, 0.3, 1) !important;
          transform: translate3d(180vw, 0, 0) scale(1.02) !important;
        }

        .trans2-flower-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          will-change: transform;
          animation: trans2Spin linear infinite;
        }

        @keyframes trans2Spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

      {grid.map((item, idx) => {
        let splitClass = '';
        if (phase === 'split' || phase === 'fading') {
          splitClass = item.side < 0 ? 'split-left' : 'split-right';
        }

        return (
          <div
            key={item.key}
            ref={el => (slotRefs.current[idx] = el)}
            className={`trans2-flower-slot ${splitClass}`}
            style={{
              left: `${item.x - item.size / 2}px`,
              top: `${item.y - item.size / 2}px`,
              width: `${item.size}px`,
              height: `${item.size}px`,
            }}
          >
            <img
              src={item.src}
              alt=""
              className="trans2-flower-img"
              style={{
                animationDuration: `${item.spin}s`,
                animationDelay: `${item.spinDelay}s`,
              }}
              draggable="false"
            />
          </div>
        );
      })}
    </div>
  );
}
