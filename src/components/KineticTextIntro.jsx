import React, { useEffect, useState } from 'react';

const LINE_1 = 'HAPPY';
const LINE_2 = 'BIRTHDAY';

export default function KineticTextIntro({ onComplete }) {
  const [phase, setPhase] = useState('entering'); // 'entering' -> 'floating' -> 'exiting'

  useEffect(() => {
    // 1. Entrance finishes after 1.8s
    const floatTimer = setTimeout(() => {
      setPhase('floating');
    }, 1800);

    // 2. Start exit dissolve after 3.8s
    const exitTimer = setTimeout(() => {
      setPhase('exiting');
    }, 3800);

    // 3. Complete and hand off to sketch drawing after 4.4s
    const completeTimer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 4400);

    return () => {
      clearTimeout(floatTimer);
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  const lettersLine1 = LINE_1.split('');
  const lettersLine2 = LINE_2.split('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-hidden select-none">
      <style>{`
        /* Background Parallax Watermark Words */
        .kinetic-bg-word {
          position: absolute;
          font-family: 'LEMON MILK Pro FTR', 'LEMON MILK', 'Lemon Milk Pro', sans-serif;
          color: rgba(0, 0, 0, 0.045);
          font-weight: 700;
          white-space: nowrap;
          pointer-events: none;
          user-select: none;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          line-height: 1;
        }

        @keyframes bgFloatSlow {
          0% {
            transform: translate3d(0, 0, 0) rotate(var(--rot, 0deg));
          }
          50% {
            transform: translate3d(var(--tx, 15px), var(--ty, -20px), 0) rotate(calc(var(--rot, 0deg) + 2deg));
          }
          100% {
            transform: translate3d(0, 0, 0) rotate(var(--rot, 0deg));
          }
        }

        .animate-bg-drift {
          animation: bgFloatSlow 8s ease-in-out infinite;
        }

        /* 3D Staggered Letter Rolling Entrance */
        @keyframes letterRollIn {
          0% {
            opacity: 0;
            transform: translateY(-130%) rotateX(85deg) scale(0.6);
            filter: blur(8px);
          }
          65% {
            opacity: 1;
            transform: translateY(10%) rotateX(-12deg) scale(1.06);
            filter: blur(0px);
          }
          85% {
            transform: translateY(-4%) rotateX(4deg) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0%) rotateX(0deg) scale(1);
            filter: blur(0px);
          }
        }

        /* Continuous Kinetic Wave Breathing in 3D */
        @keyframes letterWaveLoop {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg) scale(1);
          }
          50% {
            transform: translateY(-9px) rotateX(-9deg) scale(1.03);
          }
        }

        /* Exit Dissolve into Canvas */
        .kinetic-container.is-exiting {
          opacity: 0;
          transform: scale(1.1) translateY(-14px);
          filter: blur(14px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .kinetic-char {
          display: inline-block;
          font-family: 'LEMON MILK Pro FTR', 'LEMON MILK', 'Lemon Milk Pro', sans-serif;
          color: #000000;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: 0.16em;
          /* Monochromatic 3D Extruded Block Shadow like Dribbble template */
          text-shadow:
            1px 1px 0px #1a1a1a,
            2px 2px 0px #333333,
            3px 3px 0px #4d4d4d,
            4px 4px 0px #666666,
            5px 5px 0px #888888,
            6px 6px 0px #aaaaaa,
            7px 7px 0px #cccccc,
            8px 8px 22px rgba(0, 0, 0, 0.22);
          transform-style: preserve-3d;
          perspective: 800px;
          will-change: transform, opacity, filter;
        }
      `}</style>

      {/* Layer 1: Background Repeating Watermarks (Depth Parallax) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 overflow-hidden pointer-events-none"
      >
        <span
          className="kinetic-bg-word animate-bg-drift text-[clamp(2.5rem,8vw,5.5rem)]"
          style={{
            top: '8%',
            left: '-5%',
            '--rot': '-8deg',
            '--tx': '25px',
            '--ty': '-15px',
          }}
        >
          HAPPY BIRTHDAY
        </span>
        <span
          className="kinetic-bg-word animate-bg-drift text-[clamp(2rem,7vw,5rem)]"
          style={{
            top: '25%',
            right: '-10%',
            '--rot': '6deg',
            '--tx': '-20px',
            '--ty': '15px',
          }}
        >
          HAPPY BIRTHDAY
        </span>
        <span
          className="kinetic-bg-word animate-bg-drift text-[clamp(2.5rem,8vw,5.5rem)]"
          style={{
            bottom: '22%',
            left: '-8%',
            '--rot': '4deg',
            '--tx': '20px',
            '--ty': '-18px',
          }}
        >
          HAPPY BIRTHDAY
        </span>
        <span
          className="kinetic-bg-word animate-bg-drift text-[clamp(2rem,7vw,4.5rem)]"
          style={{
            bottom: '8%',
            right: '-6%',
            '--rot': '-5deg',
            '--tx': '-15px',
            '--ty': '12px',
          }}
        >
          HAPPY BIRTHDAY
        </span>
      </div>

      {/* Layer 2: Main Focal Kinetic Word ("HAPPY BIRTHDAY" stacked in Lemon Milk Pro) */}
      <div
        className={`kinetic-container relative z-10 flex flex-col items-center justify-center px-4 transition-all duration-500 ${
          phase === 'exiting' ? 'is-exiting' : ''
        }`}
        style={{
          perspective: '1000px',
        }}
      >
        {/* Line 1: HAPPY */}
        <div
          className="flex items-center justify-center text-[clamp(2.8rem,11vw,5.6rem)]"
          style={{ perspective: '1000px' }}
        >
          {lettersLine1.map((char, index) => {
            const staggerDelay = `${index * 0.065}s`;
            return (
              <span
                key={`l1-${index}`}
                className="kinetic-char"
                style={{
                  animation:
                    phase === 'entering'
                      ? `letterRollIn 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay} both`
                      : `letterWaveLoop 2.4s ease-in-out infinite ${index * 0.08}s`,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>

        {/* Line 2: BIRTHDAY */}
        <div
          className="flex items-center justify-center mt-1 sm:mt-2 text-[clamp(2.4rem,9.6vw,4.8rem)]"
          style={{ perspective: '1000px' }}
        >
          {lettersLine2.map((char, index) => {
            const staggerDelay = `${(lettersLine1.length + index) * 0.065}s`;
            return (
              <span
                key={`l2-${index}`}
                className="kinetic-char"
                style={{
                  animation:
                    phase === 'entering'
                      ? `letterRollIn 0.85s cubic-bezier(0.34, 1.56, 0.64, 1) ${staggerDelay} both`
                      : `letterWaveLoop 2.4s ease-in-out infinite ${(lettersLine1.length + index) * 0.08}s`,
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
