import React, { useState, useRef } from 'react';

function FloatingMotes({ active }) {
  const motes = useRef(
    Array.from({ length: 30 }).map(() => ({
      s: 1.2 + Math.random() * 2.5,
      x: 20 + Math.random() * 60,
      y: 10 + Math.random() * 65,
      d: 4 + Math.random() * 5,
      dl: Math.random() * 6,
      dx: -15 + Math.random() * 30,
      dy: -(15 + Math.random() * 25),
      o: 0.15 + Math.random() * 0.4,
    }))
  ).current;

  if (!active) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2 }}>
      {motes.map((mt, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '9999px',
            width: mt.s,
            height: mt.s,
            left: `${mt.x}%`,
            top: `${mt.y}%`,
            background: `rgba(255, 200, 215, ${mt.o})`,
            '--lp-mx': `${mt.dx}px`,
            '--lp-my': `${mt.dy}px`,
            '--lp-mo': mt.o,
            animation: `lp-mote ${mt.d}s ease-in-out ${mt.dl}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

export default function LampScreen({ onNext }) {
  const [slideLeft, setSlideLeft] = useState(false);
  const [drag, setDrag] = useState({ on: false, sy: 0, cy: 0, sx: 0, cx: 0 });

  const dStart = (e) => {
    if (slideLeft) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag({ on: true, sy: e.clientY, cy: e.clientY, sx: e.clientX, cx: e.clientX });
  };

  const dMove = (e) => {
    setDrag((p) => (p.on ? { ...p, cy: e.clientY, cx: e.clientX } : p));
  };

  const dEnd = () => {
    setDrag((p) => {
      if (!p.on) return p;
      if (p.cy - p.sy > 45) {
        setSlideLeft(true);
        setTimeout(() => {
          onNext?.();
        }, 1500);
      }
      return { on: false, sy: 0, cy: 0, sx: 0, cx: 0 };
    });
  };

  const pullY = drag.on ? Math.min(Math.max(0, drag.cy - drag.sy), 90) : 0;
  const pullX = drag.on ? Math.min(Math.max(-60, drag.cx - drag.sx), 60) : 0;
  const totalLinks = 10;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#FFF2EC',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes lp-mote { 0%, 100% { opacity: 0; transform: translate(0,0); } 50% { opacity: var(--lp-mo); transform: translate(var(--lp-mx), var(--lp-my)); } }
        @keyframes lp-glow1 { 0%, 100% { opacity: .4; } 50% { opacity: .5; } }
        @keyframes lp-glow2 { 0%, 100% { opacity: .18; } 50% { opacity: .25; } }
        @keyframes lp-pulse { 0%, 100% { opacity: var(--lp-op0); transform: translate(-50%,-50%) scale(var(--lp-sc0)); } 50% { opacity: var(--lp-op1); transform: translate(-50%,-50%) scale(var(--lp-sc1)); } }
        @keyframes lp-hint { 0%, 100% { opacity: .4; transform: translateY(0); } 50% { opacity: .65; transform: translateY(5px); } }
      `}</style>

      {/* Ambient ceiling glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'lp-glow1 4.5s ease-in-out infinite',
          background:
            'radial-gradient(ellipse 650px 850px at 50% 6%, rgba(255,215,225,0.58) 0%, rgba(255,200,215,0.40) 25%, rgba(245,180,200,0.22) 50%, rgba(235,165,185,0.08) 75%, transparent 90%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
          animation: 'lp-glow2 5.5s ease-in-out .25s infinite',
          background:
            'radial-gradient(ellipse 950px 1150px at 50% 8%, rgba(255,200,215,0.18) 0%, rgba(245,185,200,0.06) 45%, transparent 80%)',
        }}
      />

      <FloatingMotes active={true} />

      {/* Hanging Lamp Assembly */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          transform: 'translateX(-50%)',
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            transform: slideLeft ? 'translateX(-150vw) scale(0.8)' : 'translateX(0) scale(1)',
            opacity: slideLeft ? 0 : 1,
            transition:
              'transform 1.5s cubic-bezier(0.7,0,0.84,0), opacity 1.5s cubic-bezier(0.7,0,0.84,0)',
          }}
        >
          {/* Ceiling mount */}
          <div
            style={{
              width: '30px',
              height: '9px',
              borderRadius: '0 0 2px 2px',
              background: 'linear-gradient(180deg, #b8839a, #9c6b80)',
              boxShadow: '0 3px 8px rgba(150,80,100,0.4)',
            }}
          />
          {/* Cord */}
          <div
            style={{
              width: '1.5px',
              height: '52px',
              background: 'linear-gradient(to bottom, #b8839a, #9c6b80)',
            }}
          />
          {/* Lamp fixture */}
          <div
            style={{
              position: 'relative',
              width: '40px',
              height: '12px',
              borderRadius: '0 0 6px 6px',
              background: 'linear-gradient(180deg, #e8c0ce 0%, #d4a3b2 45%, #b8839a 100%)',
              boxShadow: '0 2px 8px rgba(150,80,100,0.3)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                width: '16px',
                height: '2px',
                top: '2px',
                left: '50%',
                transform: 'translateX(-50%)',
                borderRadius: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
              }}
            />
          </div>

          {/* Lamp bulb with glowing halo */}
          <div style={{ position: 'relative', marginTop: '-1px' }}>
            <div
              style={{
                position: 'absolute',
                borderRadius: '9999px',
                pointerEvents: 'none',
                width: '340px',
                height: '340px',
                top: '50%',
                left: '50%',
                filter: 'blur(30px)',
                background: 'radial-gradient(circle, rgba(255,200,215,0.28) 0%, transparent 60%)',
                '--lp-op0': 0.1,
                '--lp-op1': 0.22,
                '--lp-sc0': 1,
                '--lp-sc1': 1.1,
                animation: 'lp-pulse 4.2s ease-in-out infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                borderRadius: '9999px',
                pointerEvents: 'none',
                width: '180px',
                height: '180px',
                top: '50%',
                left: '50%',
                filter: 'blur(10px)',
                background: 'radial-gradient(circle, rgba(255,235,240,0.45) 0%, transparent 50%)',
                '--lp-op0': 0.15,
                '--lp-op1': 0.35,
                '--lp-sc0': 1,
                '--lp-sc1': 1.08,
                animation: 'lp-pulse 3.8s ease-in-out infinite',
              }}
            />
            <div
              style={{
                width: '36px',
                height: '48px',
                borderRadius: '18px 18px 14px 14px',
                background: 'linear-gradient(180deg, #fff 0%, #fff0f5 40%, #ffd6e0 100%)',
                boxShadow:
                  '0 0 25px rgba(255,200,215,0.8), 0 0 50px rgba(255,180,200,0.4), inset 0 -4px 8px rgba(220,150,170,0.3)',
              }}
            />
          </div>

          {/* Pull Chain Links and Interactive String */}
          <div
            onPointerDown={dStart}
            onPointerMove={dMove}
            onPointerUp={dEnd}
            onPointerCancel={dEnd}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: '1px',
              marginLeft: '-40px',
              padding: '0 40px 40px 40px',
              cursor: drag.on ? 'grabbing' : 'grab',
              touchAction: 'none',
            }}
          >
            {/* Chain links */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: `${1.2 + pullY * 0.03}px`,
                transition: drag.on ? 'none' : 'gap 0.5s cubic-bezier(0.175,0.885,0.32,1.275)',
              }}
            >
              {Array.from({ length: totalLinks }).map((_, i) => {
                const ratio = (i + 1) / totalLinks;
                const linkX = drag.on ? pullX * Math.pow(ratio, 1.5) : 0;
                const linkY = drag.on ? pullY * (i / totalLinks) * 0.15 : 0;
                return (
                  <div
                    key={i}
                    style={{
                      transform: `translate(${linkX}px, ${linkY}px)`,
                      transition: drag.on
                        ? 'none'
                        : 'transform 0.6s cubic-bezier(0.25,1.1,0.5,1.35)',
                    }}
                  >
                    <svg width="6" height="10" viewBox="0 0 6 10">
                      <ellipse
                        cx="3"
                        cy="5"
                        rx="2.2"
                        ry="4"
                        fill="none"
                        stroke="#b8839a"
                        strokeWidth="1.3"
                      />
                    </svg>
                  </div>
                );
              })}
            </div>

            {/* Pull Knob */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '3px',
                width: '18px',
                height: '18px',
                borderRadius: '9999px',
                border: '1px solid rgba(255,255,255,0.25)',
                boxShadow:
                  '0 3px 10px rgba(150,80,100,0.4), inset 0 1px 0 rgba(255,255,255,0.3)',
                background: 'linear-gradient(145deg, #e8c0ce, #b8839a)',
                transform: `translate(${pullX}px, ${pullY * 0.18}px)`,
                transition: drag.on
                  ? 'none'
                  : 'transform 0.6s cubic-bezier(0.25,1.1,0.5,1.35)',
              }}
            >
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '9999px',
                  background: '#8a5a6b',
                }}
              />
            </div>

            {/* Hint arrow */}
            {!drag.on && !slideLeft && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  marginTop: '12px',
                  pointerEvents: 'none',
                  animation: 'lp-hint 2s ease-in-out infinite',
                }}
              >
                <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                  <path
                    d="M5 1 L5 9 M2 7 L5 10 L8 7"
                    stroke="rgba(219,144,150,0.6)"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pull instruction text */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '20%',
          zIndex: 10,
          textAlign: 'center',
          opacity: slideLeft ? 0 : 1,
          transition: 'opacity 1s ease',
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'Georgia, serif',
            color: 'rgba(219,144,150,0.5)',
            fontSize: '10px',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
          }}
        >
          drag the string down to pull
        </p>
      </div>
    </div>
  );
}
