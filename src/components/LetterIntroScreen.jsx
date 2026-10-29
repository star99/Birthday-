import React from 'react';

export default function LetterIntroScreen({ onNext, onBack }) {
  const handleBack = () => {
    if (onBack) onBack();
    else window.location.reload();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100dvh',
        background: '#FFF2EC',
        overflow: 'hidden',
      }}
    >
      <button
        type="button"
        onClick={handleBack}
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

      <style>{`
        .hp-letter-scroll::-webkit-scrollbar { width: 6px; }
        .hp-letter-scroll::-webkit-scrollbar-track { background: #FFF2EC; }
        .hp-letter-scroll::-webkit-scrollbar-thumb {
          background: color-mix(in oklab, var(--plum) 35%, transparent);
          border-radius: 9999px;
        }
      `}</style>

      <div
        className="hp-letter-scroll"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '16vh 9vw 12vh',
          overflowY: 'auto',
          textAlign: 'center',
          boxSizing: 'border-box',
          scrollbarWidth: 'thin',
          scrollbarColor: 'color-mix(in oklab, var(--plum) 35%, transparent) #FFF2EC',
        }}
      >
        <img
          src="/assets/flower/cake.png"
          alt=""
          draggable={false}
          style={{
            width: 'min(96px, 22vw)',
            height: 'min(96px, 22vw)',
            objectFit: 'contain',
            marginBottom: 'clamp(20px, 4vh, 32px)',
          }}
        />

        <div
          style={{
            fontFamily: "'Short Stack', cursive",
            color: 'var(--plum)',
            fontSize: 'clamp(1.35rem, 4.6vw, 1.85rem)',
            lineHeight: '1.85',
            maxWidth: '22rem',
          }}
        >
          <p style={{ margin: '0 0 1.4em' }}>Hey Baby,</p>
          <p style={{ margin: '0 0 1.4em' }}>
            I know this isn't a normal birthday gift...
          </p>
          <p style={{ margin: 0 }}>
            But I made this just for you.
          </p>
        </div>

        <svg
          width="34"
          height="34"
          viewBox="0 0 24 24"
          aria-hidden={true}
          style={{ marginTop: 'clamp(18px, 4vh, 30px)' }}
        >
          <path
            fill="#e6394f"
            d="M12 21s-6.7-4.35-9.33-8.2C.86 10.42 1.4 7.4 3.64 5.77 5.6 4.35 8.2 4.7 9.7 6.44L12 9.1l2.3-2.66c1.5-1.74 4.1-2.09 6.06-.67 2.24 1.63 2.78 4.65 1 7.03C18.7 16.65 12 21 12 21z"
          />
        </svg>
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        style={{
          position: 'absolute',
          right: '18px',
          bottom: 'max(20px, env(safe-area-inset-bottom))',
          width: '46px',
          height: '46px',
          borderRadius: '9999px',
          border: '1.5px solid #1c1c1c',
          background: '#f5f5f3',
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
