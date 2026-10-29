import React, { useState, useEffect, useMemo } from 'react';

const FLOWER_URLS = [
  '/assets/flower/f2.png',
  '/assets/flower/f3.png',
  '/assets/flower/f4.png',
  '/assets/flower/f5.png',
  '/assets/flower/f6.png',
  '/assets/flower/f7.png',
  '/assets/flower/f8.png',
  '/assets/flower/f9.png',
  '/assets/flower/f10.png',
];

const GOLDEN_ANGLE = 137.507764;
const SPIRAL_DURATION = 12100;
const SPLIT_DURATION = 3580;

export default function PetalSpiral({ splitting }) {
  const [windowSize, setWindowSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth : 1200,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const petals = useMemo(() => {
    // Dynamic optimization: 68 petals on mobile devices to ensure 60fps silky smooth animation
    // 136 petals on desktop for dense majestic swirl
    const isMobile = windowSize.w < 768;
    const petalCount = isMobile ? 68 : 136;
    const maxRadius = Math.hypot(windowSize.w, windowSize.h) / 2 + 40;
    const baseMultiplier = isMobile ? 1.88 : 1.75;
    const baseSize = ((2 * maxRadius) / Math.sqrt(petalCount)) * baseMultiplier;

    return Array.from({ length: petalCount }, (_, index) => {
      const progress = (index + 0.5) / petalCount;
      const radius = maxRadius * Math.sqrt(progress);
      const angle = (index * GOLDEN_ANGLE * Math.PI) / 180;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      return {
        x,
        y,
        size: baseSize * (0.9 + 0.25 * progress),
        url: FLOWER_URLS[index % FLOWER_URLS.length],
        delay: SPIRAL_DURATION * 0.82 * progress,
        spin: 2600,
        side: x >= 0 ? 1 : -1,
      };
    });
  }, [windowSize.w, windowSize.h]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
    >
      {petals.map((petal, index) => {
        const targetX = petal.x + (splitting ? petal.side * (windowSize.w + petal.size) : 0);
        const transition = splitting
          ? `transform ${SPLIT_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1) ${(Math.abs(petal.x) / windowSize.w) * 160}ms`
          : undefined;

        return (
          <div
            key={index}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate3d(${targetX}px, ${petal.y}px, 0)`,
              transition,
              willChange: 'transform',
            }}
          >
            <img
              src={petal.url}
              alt=""
              draggable={false}
              className="animate-petal-bloom block max-w-none select-none"
              style={{
                width: petal.size,
                height: petal.size,
                marginLeft: -petal.size / 2,
                marginTop: -petal.size / 2,
                animationDelay: `${petal.delay}ms, 0ms`,
                animationDuration: `700ms, ${petal.spin}ms`,
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
