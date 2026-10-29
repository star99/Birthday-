import React, { useState, useRef } from 'react';

const PHOTO_COUNT = 10;
const PHOTOS = Array.from(
  { length: PHOTO_COUNT },
  (_, i) => `/assets/images/${i + 1}.png`
);

export default function MemoriesScreen({ onBack, onNext }) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [exiting, setExiting] = useState(null);
  const startXRef = useRef(0);

  const SWIPE_THRESHOLD = 90;

  const onPointerDown = (e) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    setDragX(e.clientX - startXRef.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (Math.abs(dragX) > SWIPE_THRESHOLD) {
      const dir = dragX > 0 ? 'right' : 'left';
      setExiting(dir);
      setTimeout(() => {
        setIndex((i) => (i + 1) % PHOTOS.length);
        setExiting(null);
        setDragX(0);
      }, 280);
    } else {
      setDragX(0);
    }
  };

  const cardTransform = exiting
    ? `translateX(${exiting === 'right' ? 420 : -420}px) rotate(${exiting === 'right' ? 24 : -24}deg)`
    : `translateX(${dragX}px) rotate(${dragX / 18}deg)`;

  const activePhoto = PHOTOS[index];
  const nextPhoto = PHOTOS[(index + 1) % PHOTOS.length];

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#FFF2EC',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6vh 6vw',
        boxSizing: 'border-box',
      }}
    >
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
          zIndex: 20,
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

      {/* Heading */}
      <h1
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: 'clamp(1.6rem, 5vw, 2.6rem)',
          fontWeight: 600,
          letterSpacing: '0.06em',
          lineHeight: 1.25,
          margin: '0 0 0.5rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, var(--rose) 0%, var(--plum) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        Beautiful Memories
      </h1>

      <div
        aria-hidden="true"
        style={{
          height: '1px',
          width: '120px',
          margin: '0 0 0.8rem',
          background:
            'linear-gradient(to right, transparent, var(--rose), var(--plum), var(--rose), transparent)',
        }}
      />

      <p
        style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontStyle: 'italic',
          fontSize: '0.95rem',
          color: 'color-mix(in oklab, var(--plum) 55%, transparent)',
          margin: '0 0 1.4rem',
          letterSpacing: '0.05em',
        }}
      >
        Swipe the cards ✦
      </p>

      {/* Cards stack */}
      <div
        style={{
          position: 'relative',
          width: 'min(260px, 66vw)',
          height: 'min(360px, 46vh)',
        }}
      >
        {/* Next card in background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1.25rem',
            overflow: 'hidden',
            border: '1px solid color-mix(in oklab, var(--plum) 25%, transparent)',
            boxShadow:
              '0 18px 45px -20px color-mix(in oklab, var(--plum) 45%, transparent)',
            transform: 'translateX(20px) translateY(14px) rotate(7deg) scale(0.97)',
          }}
        >
          <img
            src={nextPhoto}
            alt=""
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Active card in foreground */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '1.25rem',
            overflow: 'hidden',
            border: '1px solid color-mix(in oklab, var(--plum) 30%, transparent)',
            boxShadow:
              '0 20px 50px -18px color-mix(in oklab, var(--plum) 55%, transparent)',
            cursor: isDragging ? 'grabbing' : 'grab',
            touchAction: 'none',
            transform: cardTransform,
            transition: isDragging ? 'none' : 'transform 280ms ease',
          }}
        >
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              background:
                'linear-gradient(to bottom, color-mix(in oklab, var(--plum) 8%, transparent) 0%, transparent 40%, color-mix(in oklab, var(--plum) 20%, transparent) 100%)',
              pointerEvents: 'none',
            }}
          />
          <img
            src={activePhoto}
            alt={`Memory ${index + 1}`}
            draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Next button */}
      <button
        type="button"
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
          zIndex: 20,
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
    </div>
  );
}
