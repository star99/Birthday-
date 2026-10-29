import React, { useState, useEffect } from 'react';

const DEFAULT_ROMANTIC_MESSAGE = `Happiest birthday my gurll😍👸

I pray you achieve all your dreams, stay happy, and keep smiling the way you do...

because that smile is my favorite thing🫶

Everyday is your day because you are the main character... and YOU KNOW IT😌

Let's share unlimited laughs, love, fights, and happiness🪬🙂‍↔️

I love you forever and ever and ever 

Thankyou for being my partner in every sense, happy 19th darlzzz😍🫀💋
I love you darlzzzz please be with mee chelloo🥺🤌`;

export default function MessageScreen({ message = DEFAULT_ROMANTIC_MESSAGE }) {
  const [showOverlay, setShowOverlay] = useState(false);
  const [typedText, setTypedText] = useState('');
  const [envelopeOpen, setEnvelopeOpen] = useState(false);
  const [isTypingDone, setIsTypingDone] = useState(false);

  const handleOpen = () => {
    setEnvelopeOpen(true);
    setTimeout(() => setShowOverlay(true), 600);
  };

  const handleCloseAll = () => {
    setShowOverlay(false);
    setTimeout(() => setEnvelopeOpen(false), 200);
  };

  useEffect(() => {
    if (!showOverlay) return;
    setTypedText('');
    setIsTypingDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
        setIsTypingDone(true);
      }
    }, 28);
    return () => clearInterval(interval);
  }, [showOverlay, message]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: '#FFF2EC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '6vh 6vw',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Title */}
        <div style={{ marginBottom: '28px' }}>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Playpen Sans Deva', cursive, serif",
              fontSize: 'clamp(18px, 4vw, 26px)',
              fontWeight: 700,
              color: '#d65b8b',
              letterSpacing: '0.04em',
            }}
          >
            A Letter, Just For You
          </h1>
          <p
            style={{
              margin: '6px 0 0',
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              color: 'rgba(124,60,100,0.7)',
              fontSize: '14px',
            }}
          >
            Tap the envelope to unseal
          </p>
        </div>

        {/* 3D Envelope */}
        <div
          style={{
            perspective: '1000px',
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          <div
            onClick={!envelopeOpen ? handleOpen : undefined}
            role="button"
            tabIndex={0}
            aria-label="Open letter envelope"
            style={{
              position: 'relative',
              width: '280px',
              height: '190px',
              cursor: envelopeOpen ? 'default' : 'pointer',
            }}
          >
            {/* Envelope body background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '4px',
                background: 'linear-gradient(160deg, #fff0f6 0%, #ffe0ef 100%)',
                border: '1px solid rgba(214,91,139,0.2)',
                boxShadow:
                  '0 10px 24px rgba(214,91,139,0.12), 0 4px 8px rgba(0,0,0,0.02), inset 0 1px 3px rgba(255,255,255,0.8)',
              }}
            />

            {/* Fold crease lines */}
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              viewBox="0 0 280 190"
            >
              <line
                x1="0"
                y1="190"
                x2="140"
                y2="100"
                stroke="rgba(214,91,139,0.15)"
                strokeWidth="1"
              />
              <line
                x1="280"
                y1="190"
                x2="140"
                y2="100"
                stroke="rgba(214,91,139,0.15)"
                strokeWidth="1"
              />
              <line
                x1="0"
                y1="0"
                x2="140"
                y2="100"
                stroke="rgba(214,91,139,0.1)"
                strokeWidth="0.5"
              />
              <line
                x1="280"
                y1="0"
                x2="140"
                y2="100"
                stroke="rgba(214,91,139,0.1)"
                strokeWidth="0.5"
              />
            </svg>

            {/* 3D Top Flap */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '50%',
                zIndex: 10,
                transformOrigin: 'top center',
                transformStyle: 'preserve-3d',
                transform: envelopeOpen ? 'rotateX(-160deg)' : 'rotateX(0deg)',
                transition: 'transform 0.5s ease-in-out',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '100%',
                  clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
                  background: 'linear-gradient(180deg, #ffe0ef 0%, #ffd1e4 100%)',
                  border: '1px solid rgba(214,91,139,0.15)',
                }}
              />
            </div>

            {/* Wax Seal */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%,-50%)',
                zIndex: envelopeOpen ? 1 : 15,
                transition: 'opacity 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'radial-gradient(circle at 35% 30%, #ff6b9d 0%, #d63384 50%, #b3206a 100%)',
                  boxShadow:
                    '0 3px 8px rgba(179,32,106,0.3), inset 0 1px 3px rgba(255,255,255,0.4)',
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '18px',
                    color: '#fff0f6',
                  }}
                >
                  ✦
                </span>
              </div>
            </div>

            {!envelopeOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: '28px',
                  left: 0,
                  right: 0,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    marginTop: '3px',
                    fontFamily: "'Cinzel', serif",
                    fontSize: '8px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: 'rgba(124,60,100,0.6)',
                  }}
                >
                  Tap to unseal ♡
                </div>
              </div>
            )}

            <div
              style={{
                position: 'absolute',
                top: '12px',
                right: '14px',
                fontFamily: "'Cinzel', serif",
                fontSize: '9px',
                color: 'rgba(214,91,139,0.3)',
                letterSpacing: '0.1em',
              }}
            >
              ❋
            </div>
          </div>
        </div>

        {/* Decorative Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(214,91,139,0.3))',
            }}
          />
          <span style={{ color: 'rgba(214,91,139,0.4)', fontSize: '12px' }}>◈</span>
          <div
            style={{
              width: '60px',
              height: '1px',
              background: 'linear-gradient(90deg, rgba(214,91,139,0.3), transparent)',
            }}
          />
        </div>

        {/* Typewriter Letter Overlay Modal */}
        {showOverlay && (
          <div
            onClick={handleCloseAll}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              gap: '20px',
              background: 'rgba(255,230,245,0.5)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'relative',
                width: '100%',
                maxWidth: '540px',
                maxHeight: '70vh',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                borderRadius: '12px',
                padding: '40px 32px 32px',
                backgroundColor: '#fffafc',
                backgroundImage:
                  'radial-gradient(ellipse 600px 400px at 20% 20%, rgba(214,91,139,0.04) 0%, transparent 50%), radial-gradient(ellipse 500px 350px at 85% 75%, rgba(216,172,255,0.04) 0%, transparent 50%), repeating-linear-gradient(0deg, rgba(124,60,100,0.015) 0px, rgba(124,60,100,0.015) 1px, transparent 1px, transparent 24px)',
                backgroundSize: '100% 100%, 100% 100%, 100% 24px',
                border: '1px solid rgba(214,91,139,0.15)',
                boxShadow:
                  '0 30px 70px rgba(214,91,139,0.15), 0 10px 30px rgba(0,0,0,0.02), inset 0 0 0 1px rgba(255,255,255,0.9)',
              }}
            >
              {/* Corner Ornaments */}
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '12px',
                  height: '12px',
                  borderTop: '1px solid rgba(214,91,139,0.3)',
                  borderLeft: '1px solid rgba(214,91,139,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '12px',
                  height: '12px',
                  borderTop: '1px solid rgba(214,91,139,0.3)',
                  borderRight: '1px solid rgba(214,91,139,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  left: '12px',
                  width: '12px',
                  height: '12px',
                  borderBottom: '1px solid rgba(214,91,139,0.3)',
                  borderLeft: '1px solid rgba(214,91,139,0.3)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  width: '12px',
                  height: '12px',
                  borderBottom: '1px solid rgba(214,91,139,0.3)',
                  borderRight: '1px solid rgba(214,91,139,0.3)',
                }}
              />

              {/* Close button */}
              <button
                type="button"
                onClick={handleCloseAll}
                aria-label="Close message"
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '18px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '22px',
                  lineHeight: 1,
                  padding: '4px',
                  color: 'rgba(124,60,100,0.4)',
                }}
              >
                ×
              </button>

              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <h3
                  style={{
                    margin: '0 0 4px',
                    fontFamily: "'Playpen Sans Deva', cursive, serif",
                    fontSize: '20px',
                    fontWeight: 700,
                    color: '#7c3c64',
                  }}
                >
                  Happy Birthday ✨
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    color: '#d65b8b',
                    fontSize: '14px',
                  }}
                >
                  Just for you ♡
                </p>
              </div>

              {/* Typewriter message content */}
              <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
                <p
                  style={{
                    margin: 0,
                    padding: '0 8px',
                    fontFamily: "'Playpen Sans Deva', cursive",
                    fontSize: '15px',
                    lineHeight: '24px',
                    color: 'var(--plum)',
                    whiteSpace: 'pre-line',
                    textAlign: 'left',
                  }}
                >
                  {typedText}
                  {!isTypingDone && (
                    <span style={{ color: 'var(--plum)', fontWeight: 300 }}>|</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
