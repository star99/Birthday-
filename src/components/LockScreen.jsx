import React, { useState, useEffect, useRef, useCallback } from 'react';
import PetalSpiral from './PetalSpiral.jsx';
import audioManager from '../utils/audioManager.js';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

export default function LockScreen({ onUnlocked, correctPin = '0411' }) {
  const [pin, setPin] = useState('');
  const [hasError, setHasError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [canOpen, setCanOpen] = useState(false);
  const [flowerY, setFlowerY] = useState(0);
  const [stage, setStage] = useState('idle'); // idle -> spiral -> split -> done
  const [showHint, setShowHint] = useState(false);
  const [showExtraHint, setShowExtraHint] = useState(false);
  const flowerRef = useRef(null);
  const blossomTriggeredRef = useRef(false);

  const handleKey = useCallback(
    (key) => {
      // Warm up Web Audio context on first user gesture
      audioManager.warmup();

      if (isUnlocked) return;
      if (key === 'del') {
        setPin((prev) => prev.slice(0, -1));
        return;
      }
      if (/^[0-9]$/.test(key)) {
        setPin((prev) => (prev.length >= 4 ? prev : prev + key));
      }
    },
    [isUnlocked]
  );

  useEffect(() => {
    if (pin.length !== 4 || isUnlocked) return;

    const timer = setTimeout(() => {
      if (pin === correctPin) {
        setShowHint(false);
        const rect = flowerRef.current?.getBoundingClientRect();
        if (rect) {
          setFlowerY(window.innerHeight / 2 - (rect.top + rect.height / 2));
        }
        setIsUnlocked(true);
        setTimeout(() => setCanOpen(true), 1200);
      } else {
        setHasError(true);
        setPin('');
        setTimeout(() => setHasError(false), 650);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [pin, isUnlocked, correctPin]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Backspace') {
        handleKey('del');
      } else if (/^[0-9]$/.test(e.key)) {
        handleKey(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKey]);

  const handleBlossomClick = () => {
    if (blossomTriggeredRef.current || stage !== 'idle') return;
    blossomTriggeredRef.current = true;

    // Start playing song from 0:48 at medium volume on blossom touch
    audioManager.playFromBlossom();

    // If tapped before PIN or while animating to center, center blossom smoothly
    if (!isUnlocked) {
      setShowHint(false);
      const rect = flowerRef.current?.getBoundingClientRect();
      if (rect) {
        setFlowerY(window.innerHeight / 2 - (rect.top + rect.height / 2));
      }
      setIsUnlocked(true);
    }

    setStage('spiral');

    window.setTimeout(() => {
      setStage('split');
    }, 12100);

    // Exactly 15680ms after 0:48 (48.0s + 15.68s = 63.68s = 1:03.68), Roll Screen opens on the exact downbeat drop!
    window.setTimeout(() => {
      setStage('done');
      onUnlocked();
    }, 15680);
  };

  const isTransitioning = stage === 'spiral' || stage === 'split';

  return (
    <>
      <main
        className={`relative h-[100dvh] w-full overflow-hidden bg-linen ${hasError ? 'animate-shake-x' : ''}`}
      >
        {hasError && (
          <div
            aria-hidden="true"
            className="animate-flash-red pointer-events-none fixed inset-0 z-50 bg-destructive"
          />
        )}

        <div
          id="cursor-glow"
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 h-[60vmin] w-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, color-mix(in oklab, var(--blush) 45%, transparent), transparent 70%)',
          }}
        />

        <div className="relative z-10 flex h-full flex-col items-center justify-center gap-[2vh] px-6 py-[3vh]">
          {/* Main Blossom */}
          <button
            ref={flowerRef}
            type="button"
            onClick={handleBlossomClick}
            onPointerDown={handleBlossomClick}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleBlossomClick();
            }}
            disabled={stage !== 'idle'}
            aria-label="Open the garden"
            className={`relative z-50 shrink-0 transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer hover:scale-105 active:scale-95 ${
              isTransitioning ? 'invisible pointer-events-none' : 'pointer-events-auto'
            }`}
            style={{ transform: `translateY(${flowerY}px)` }}
          >
            <img
              src="/assets/flower/flower.png"
              alt="A hand-painted pink cherry blossom"
              width="220"
              height="220"
              className={`animate-soft-float block select-none drop-shadow-[0_20px_35px_rgba(200,120,140,0.28)] transition-all duration-1000 pointer-events-none ${
                isUnlocked
                  ? 'h-[min(14rem,26vh)] w-[min(14rem,26vh)]'
                  : 'h-[min(9rem,16vh)] w-[min(9rem,16vh)]'
              }`}
              draggable={false}
            />
          </button>

          <section
            aria-hidden={isUnlocked}
            className={`flex min-h-0 flex-col items-center transition-opacity duration-[900ms] ease-out ${
              isUnlocked ? 'pointer-events-none opacity-0' : 'opacity-100'
            }`}
          >
            <h1
              className="text-[clamp(2.8rem,7.2vh,4.6rem)] leading-tight text-center drop-shadow-sm select-none"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: 'italic',
                fontWeight: 600,
                color: '#671226',
                textShadow: '0 2px 16px rgba(103, 18, 38, 0.16)',
                letterSpacing: '0.01em',
              }}
            >
              For you, my bunny
            </h1>

            <div className="mt-[2.2vh] flex gap-4">
              {[0, 1, 2, 3].map((dotIndex) => (
                <span
                  key={dotIndex}
                  className={`h-3 w-3 rounded-full border transition-all duration-300 ${
                    pin.length > dotIndex
                      ? 'scale-110 border-rose bg-rose'
                      : 'border-rose-deep/25 bg-transparent'
                  }`}
                />
              ))}
            </div>

            <div className="mt-[2.5vh] grid grid-cols-3 gap-[min(1.25rem,2.2vh)]">
              {KEYS.map((key, index) =>
                key === '' ? (
                  <span key={index} />
                ) : (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleKey(key)}
                    className="h-[min(4rem,7.5vh)] w-[min(4rem,7.5vh)] rounded-full border border-rose-deep/10 bg-white/70 text-[min(1.125rem,2.4vh)] font-light tracking-wider text-rose-deep shadow-key backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-white active:translate-y-0 active:scale-95"
                  >
                    {key === 'del' ? '←' : key}
                  </button>
                )
              )}
            </div>
          </section>

          {canOpen && !isTransitioning && (
            <p className="fixed bottom-[8vh] left-1/2 -translate-x-1/2 animate-pulse text-xs tracking-[0.3em] text-rose-deep/60 uppercase">
              Touch the blossom
            </p>
          )}
        </div>
      </main>

      {/* Floating Flower from the Floral Garden in the bottom-right corner */}
      {!isUnlocked && !isTransitioning && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end">
          {/* Cloud Structure Dialog */}
          {showHint && (
            <div
              role="dialog"
              aria-label="Keepsake cloud"
              className="relative mb-4 w-[calc(100vw-3.2rem)] sm:w-88 max-w-sm select-none transition-all duration-300 ease-out animate-fade-in"
            >
              {/* Seamless SVG Cloud Silhouette Background - Flipped toward the right */}
              <svg
                viewBox="0 0 380 260"
                className="absolute inset-0 h-full w-full -z-10 drop-shadow-[0_18px_35px_rgba(103,18,38,0.18)] -scale-x-100"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
                    <stop offset="100%" stopColor="#fff2f6" stopOpacity="0.95" />
                  </linearGradient>
                </defs>
                <path
                  d="M 65,225 C 45,225 25,205 18,175 C 8,145 15,110 38,85 C 55,60 85,45 118,45 C 135,22 170,10 205,12 C 242,15 272,32 288,52 C 318,52 348,75 358,108 C 368,138 358,170 335,192 C 315,212 282,222 250,218 C 225,232 185,235 152,225 C 122,230 92,226 65,225 Z"
                  fill="url(#cloudGrad)"
                  stroke="rgba(240, 205, 215, 0.85)"
                  strokeWidth="1.6"
                />
              </svg>

              {/* Trailing cloud bubbles toward the bottom-right flower */}
              <span className="pointer-events-none absolute -bottom-2.5 right-7 h-5 w-5 rounded-full bg-white/95 border border-rose-200/70 shadow-sm" />
              <span className="pointer-events-none absolute -bottom-5 right-3.5 h-3 w-3 rounded-full bg-white/95 border border-rose-200/70 shadow-sm" />

              {/* Cloud Content with Caveat Font */}
              <div className="relative px-7 pt-6 pb-6 text-center">
                {/* Header with close button */}
                <div className="flex items-center justify-between pb-1 border-b border-[#671226]/10">
                  <span
                    style={{
                      fontFamily: "'Caveat', cursive",
                      color: '#671226',
                    }}
                    className="text-lg font-bold tracking-wide opacity-80"
                  >
                    A whisper for you
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHint(false)}
                    className="rounded-full w-6 h-6 flex items-center justify-center text-xs text-[#671226]/60 hover:text-[#671226] hover:bg-black/5 transition-colors cursor-pointer"
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Question - with 'angel' and Caveat Font */}
                <div className="py-2.5">
                  <p
                    style={{
                      fontFamily: "'Caveat', cursive",
                      color: '#5A1220',
                    }}
                    className="text-2xl sm:text-[1.75rem] font-bold leading-snug drop-shadow-sm select-none"
                  >
                    “which date and month angel will born”
                  </p>
                </div>

                {/* Option: Too hard to guess? */}
                {!showExtraHint ? (
                  <div className="pt-1.5 border-t border-[#671226]/10 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setShowExtraHint(true)}
                      style={{
                        fontFamily: "'Caveat', cursive",
                        color: '#671226',
                      }}
                      className="text-base sm:text-lg font-bold tracking-wide hover:underline cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                    >
                      Is the question too hard? Tap for a clue ✨
                    </button>
                  </div>
                ) : (
                  <div className="pt-1.5 border-t border-[#671226]/10 text-center animate-fade-in">
                    <div className="flex justify-center items-center gap-3 my-1">
                      <span
                        style={{
                          fontFamily: "'Caveat', cursive",
                          color: '#5A1220',
                        }}
                        className="w-9 h-9 rounded-full bg-white/95 border border-[#671226]/25 flex items-center justify-center font-bold text-2xl shadow-sm"
                      >
                        0
                      </span>
                      <span className="text-[#671226]/30 text-xl font-bold">•</span>
                      <span className="text-[#671226]/30 text-xl font-bold">•</span>
                      <span
                        style={{
                          fontFamily: "'Caveat', cursive",
                          color: '#5A1220',
                        }}
                        className="w-9 h-9 rounded-full bg-white/95 border border-[#671226]/25 flex items-center justify-center font-bold text-2xl shadow-sm"
                      >
                        1
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Caveat', cursive",
                        color: '#671226',
                      }}
                      className="text-sm sm:text-base font-semibold text-[#671226]/85"
                    >
                      Starts with 0 &amp; ends with 1 (0 • • 1)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Watercolor Flower Button from the Garden - floats smoothly just like the central blossom */}
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            aria-label="Toggle clue"
            className="relative flex items-center justify-center transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            <img
              src="/assets/flower/f5.png"
              alt="Watercolor Flower"
              width="68"
              height="68"
              className="animate-soft-float block select-none drop-shadow-[0_16px_30px_rgba(200,80,90,0.32)] w-14 h-14 sm:w-16 sm:h-16"
              draggable={false}
            />
          </button>
        </div>
      )}

      {isTransitioning && <PetalSpiral splitting={stage === 'split'} />}

      {isTransitioning && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed left-1/2 top-1/2 z-[60]"
          style={{
            transform: `translate(-50%, -50%) translate3d(${stage === 'split' ? '110vw' : '0px'}, 0, 0)`,
            transition:
              stage === 'split'
                ? 'transform 1500ms cubic-bezier(0.65, 0, 0.35, 1)'
                : undefined,
            willChange: 'transform',
          }}
        >
          <img
            src="/assets/flower/flower.png"
            alt=""
            className="animate-spin-sync block h-[min(14rem,26vh)] w-[min(14rem,26vh)] max-w-none select-none drop-shadow-[0_20px_35px_rgba(200,120,140,0.28)]"
            style={{ willChange: 'transform' }}
            draggable={false}
          />
        </div>
      )}
    </>
  );
}
