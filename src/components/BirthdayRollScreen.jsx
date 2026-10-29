import React, { useState, useEffect, useRef } from 'react';
import SketchDrawingIntro from './SketchDrawingIntro.jsx';
import HangingBubuRope from './HangingBubuRope.jsx';

// 42 languages
const BIRTHDAY_LANGUAGES = [
  { phrase: 'HAPPY BIRTHDAY', lang: 'English' },
  { phrase: 'JOYEUX ANNIVERSAIRE', lang: 'French' },
  { phrase: 'FELIZ CUMPLEAÑOS', lang: 'Spanish' },
  { phrase: 'ALLES GUTE ZUM GEBURTSTAG', lang: 'German' },
  { phrase: 'BUON COMPLEANNO', lang: 'Italian' },
  { phrase: 'FELIZ ANIVERSÁRIO', lang: 'Portuguese' },
  { phrase: 'お誕生日おめでとう', lang: 'Japanese' },
  { phrase: '생일 축하해요', lang: 'Korean' },
  { phrase: '生日快乐', lang: 'Chinese (Mandarin)' },
  { phrase: 'С ДНЁМ РОЖДЕНИЯ', lang: 'Russian' },
  { phrase: 'عيد ميلاد سعيد', lang: 'Arabic' },
  { phrase: 'பிறந்தநாள் வாழ்த்துக்கள்', lang: 'Tamil' },
  { phrase: 'जन्मदिन मुबारक', lang: 'Hindi' },
  { phrase: 'ΧΡΟΝΙΑ ΠΟΛΛΑ', lang: 'Greek' },
  { phrase: 'GEFELICITEERD MET JE VERJAARDAG', lang: 'Dutch' },
  { phrase: 'GRATTIS PÅ FÖDELSEDAGEN', lang: 'Swedish' },
  { phrase: 'DOĞUM GÜNÜN KUTLU OLSUN', lang: 'Turkish' },
  { phrase: 'CHÚC MỪNG SINH NHẬT', lang: 'Vietnamese' },
  { phrase: 'สุขสันต์วันเกิด', lang: 'Thai' },
  { phrase: 'יום הולדת שמח', lang: 'Hebrew' },
  { phrase: 'WSZYSTKIEGO NAJLEPSZEGO', lang: 'Polish' },
  { phrase: 'MALIGAYANG KAARAWAN', lang: 'Tagalog' },
  { phrase: 'SELAMAT ULANG TAHUN', lang: 'Indonesian' },
  { phrase: 'З ДНЕМ НАРОДЖЕННЯ', lang: 'Ukrainian' },
  { phrase: 'শুভ জন্মদিন', lang: 'Bengali' },
  { phrase: 'పుట్టినరోజు శుభాకాంక్షలు', lang: 'Telugu' },
  { phrase: 'ജന്മദിനാശംസകൾ', lang: 'Malayalam' },
  { phrase: 'تولدت مبارک', lang: 'Persian' },
  { phrase: 'TILLYKKE MED FØDSELSDAGEN', lang: 'Danish' },
  { phrase: 'GRATULERER MED DAGEN', lang: 'Norwegian' },
  { phrase: 'HYVÄÄ SYNTYMÄPÄIVÄÄ', lang: 'Finnish' },
  { phrase: 'LA MULȚI ANI', lang: 'Romanian' },
  { phrase: 'BOLDOG SZÜLETÉSNAPOT', lang: 'Hungarian' },
  { phrase: 'VŠECHNO NEJLEPŠÍ', lang: 'Czech' },
  { phrase: 'LÁ BREITHE SHONA DUIT', lang: 'Irish' },
  { phrase: "HAUʻOLI LĀ HĀNAU", lang: 'Hawaiian' },
  { phrase: 'SIKUKUU NJEMA YA KUZALIWA', lang: 'Swahili' },
  { phrase: 'FELIX SIT DIES NATALIS', lang: 'Latin' },
  { phrase: 'ಹುಟ್ಟುಹಬ್ಬದ ಶುಭಾಶಯಗಳು', lang: 'Kannada' },
  { phrase: 'वाढदिवसाच्या हार्दिक शुभेच्छा', lang: 'Marathi' },
  { phrase: 'SREĆAN ROĐENDAN', lang: 'Serbian / Croatian' },
  { phrase: 'TIL HAMINGJU MEÐ AFMÆLIÐ', lang: 'Icelandic' },
];

const STREAM_PHOTOS = [
  { src: '/assets/portraits/portrait_5.jpg', id: 'p5' },
  { src: '/assets/portraits/portrait_3.jpg', id: 'p4' },
  { src: '/assets/portraits/portrait_2.jpg', id: 'p3' },
  { src: '/assets/portraits/portrait_1.jpg', id: 'p2' },
  { src: '/assets/portraits/hero_sketch.jpg', id: 'p1', isHeader: true },
];

// Row height matches .wheel-row height in CSS
const ROW_H = 72;

export default function BirthdayRollScreen({ onReset, onPullRedirect }) {
  const [stage, setStage] = useState('intro'); // 'intro' | 'minimizing' | 'fading_in' | 'rolling'
  const [isPlaced, setIsPlaced] = useState(false);
  const [showRopeBubu, setShowRopeBubu] = useState(false);
  const [streamMetrics, setStreamMetrics] = useState({ startY: 0, seqHeight: 0 });
  const [viewH, setViewH] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  const textCylinderRef  = useRef(null);
  const photoCylinderRef = useRef(null);
  const sequenceRef      = useRef(null);
  const headerImgRef     = useRef(null);

  const textStartYRef    = useRef(0);
  const photoStartYRef   = useRef(0);
  const photoSeqHRef     = useRef(0);

  const textYRef         = useRef(0);
  const photoYRef        = useRef(0);
  const rafIdRef         = useRef(null);

  const measureAll = () => {
    const vh = window.innerHeight;
    setViewH(vh);

    // Text left column initial center:
    const startYText = vh / 2 - ROW_H / 2;
    textStartYRef.current = startYText;

    // Photo right column initial center:
    if (sequenceRef.current && photoCylinderRef.current && headerImgRef.current) {
      const pSeqH = sequenceRef.current.offsetHeight;
      const headerRect = headerImgRef.current.getBoundingClientRect();
      const cylRect = photoCylinderRef.current.getBoundingClientRect();
      // True untransformed vertical offset of hero_sketch center inside photoCylinder:
      const headerCenterInCylinder = (headerRect.top - cylRect.top) + headerRect.height / 2;
      const startYPhoto = vh / 2 - headerCenterInCylinder;

      photoSeqHRef.current = pSeqH;
      photoStartYRef.current = startYPhoto;
      setStreamMetrics({ startY: startYPhoto, seqHeight: pSeqH });

      // If not yet rolling, position cylinders at their respective starting positions
      if (stage !== 'rolling') {
        textYRef.current = startYText;
        photoYRef.current = startYPhoto;
        if (textCylinderRef.current) {
          textCylinderRef.current.style.transform = `translate3d(0, ${startYText}px, 0)`;
        }
        if (photoCylinderRef.current) {
          photoCylinderRef.current.style.transform = `translate3d(0, ${startYPhoto}px, 0)`;
        }
      }
    }
  };

  useEffect(() => {
    measureAll();
    window.addEventListener('resize', measureAll);
    return () => window.removeEventListener('resize', measureAll);
  }, [stage]);

  // Unified 60fps/120fps hardware-accelerated continuous rolling loop
  useEffect(() => {
    if (stage !== 'rolling') {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    const tSeqH = BIRTHDAY_LANGUAGES.length * ROW_H; // 42 * 72 = 3024px
    const pSeqH = photoSeqHRef.current || (sequenceRef.current ? sequenceRef.current.offsetHeight : 2400);
    const startYText = textStartYRef.current || (window.innerHeight / 2 - ROW_H / 2);
    const startYPhoto = photoStartYRef.current || streamMetrics.startY;

    // Start coordinates
    let curTextY = startYText;
    let curPhotoY = startYPhoto;
    textYRef.current = curTextY;
    photoYRef.current = curPhotoY;

    // Both roll at 40s per complete cycle
    const textSpeed = tSeqH / 40;
    const photoSpeed = pSeqH / 40;

    let lastTime = performance.now();

    const tick = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // cap at 50ms to protect against tab backgrounding
      lastTime = now;

      // 1. Text moves UPWARD (curTextY decreases):
      curTextY -= textSpeed * dt;
      // Wrap seamlessly by +tSeqH once past startYText - 2 * tSeqH:
      if (curTextY <= startYText - 2 * tSeqH) {
        curTextY += tSeqH;
      }
      textYRef.current = curTextY;
      if (textCylinderRef.current) {
        textCylinderRef.current.style.transform = `translate3d(0, ${curTextY}px, 0)`;
      }

      // 2. Photos move DOWNWARD (curPhotoY increases):
      curPhotoY += photoSpeed * dt;
      // Wrap seamlessly by -pSeqH once past startYPhoto + pSeqH:
      if (curPhotoY >= startYPhoto + pSeqH) {
        curPhotoY -= pSeqH;
      }
      photoYRef.current = curPhotoY;
      if (photoCylinderRef.current) {
        photoCylinderRef.current.style.transform = `translate3d(0, ${curPhotoY}px, 0)`;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [stage]);

  // Trigger Hanging Bubu on rope right after English "HAPPY BIRTHDAY" scrolls up and goes away (~6.2s)
  useEffect(() => {
    if (stage === 'rolling') {
      const timer = setTimeout(() => {
        setShowRopeBubu(true);
      }, 6200);
      return () => clearTimeout(timer);
    } else {
      setShowRopeBubu(false);
    }
  }, [stage]);

  const handleIntroComplete = () => {
    setStage('minimizing');
    requestAnimationFrame(() => {
      setTimeout(() => setIsPlaced(true), 50);
    });
    // Dual transition runs for 1.3s:
    // Hero sketch moves center -> right (75%)
    // Happy Birthday text moves center -> left (25%)
    setTimeout(() => {
      setStage('fading_in');
      setTimeout(measureAll, 40);
      // Hold for 500ms after text fits into its assigned place before rolling starts
      setTimeout(() => {
        setStage('rolling');
      }, 500);
    }, 1350);
  };

  const showOtherElements = stage === 'fading_in' || stage === 'rolling';
  const isRolling = stage === 'rolling';
  const textStartY = viewH / 2 - ROW_H / 2;

  const renderTextRows = (prefix) =>
    BIRTHDAY_LANGUAGES.map((item, idx) => {
      const isEng = item.lang === 'English';
      return (
        <div
          key={`${prefix}-${idx}`}
          className="wheel-row"
          style={{
            opacity: isRolling || isEng ? 1 : 0,
            transition: 'opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        >
          <span
            className="wheel-text"
            style={isEng
              ? { color: '#8A1C34', fontWeight: 600, letterSpacing: '0.14em' }
              : undefined
            }
          >
            {item.phrase}
          </span>
          <span
            className="wheel-lang"
            style={isEng ? { color: '#8A1C34', opacity: 0.7 } : undefined}
          >
            {item.lang}
          </span>
        </div>
      );
    });

  return (
    <main
      className="birthday-split-screen"
      onDoubleClick={() => {
        if (isRolling) setShowRopeBubu(prev => !prev);
      }}
    >
      <style>{`
        .birthday-split-screen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100dvh;
          overflow: hidden;
          background-color: #ffffff;
          display: flex;
          flex-direction: row;
          align-items: center;
          justify-content: center;
          user-select: none;
          -webkit-user-select: none;
        }

        /* ── Minimising hero sketch ───────────────────────────────── */
        .minimizing-hero-wrapper {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: min(94vw, 680px);
          max-height: 85vh;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 1.3s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }
        .minimizing-hero-wrapper.is-placed {
          left: 75%;
          width: 50vw;
          max-height: 44vh;
        }
        .minimizing-hero-img {
          width: 100%;
          height: auto;
          max-height: inherit;
          object-fit: contain;
          mix-blend-mode: multiply;
          background-color: #ffffff;
          filter: contrast(1.15) brightness(0.97);
        }

        /* ── Shared column layout ─────────────────────────────────── */
        .left-roller-section,
        .right-portraits-section {
          position: relative;
          width: 50%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background-color: #ffffff;
          transition: opacity 0.4s ease;
        }

        /* Fade mask top & bottom */
        .iphone-wheel-mask {
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
          -webkit-mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0,0,0,0.04) 8%,
            rgba(0,0,0,0.55) 24%,
            rgba(0,0,0,1) 38%,
            rgba(0,0,0,1) 62%,
            rgba(0,0,0,0.55) 76%,
            rgba(0,0,0,0.04) 92%,
            transparent 100%
          );
          mask-image: linear-gradient(
            to bottom,
            transparent 0%,
            rgba(0,0,0,0.04) 8%,
            rgba(0,0,0,0.55) 24%,
            rgba(0,0,0,1) 38%,
            rgba(0,0,0,1) 62%,
            rgba(0,0,0,0.55) 76%,
            rgba(0,0,0,0.04) 92%,
            transparent 100%
          );
        }

        .iphone-lens-guides {
          position: absolute;
          left: 0; right: 0;
          top: 50%;
          transform: translateY(-50%);
          height: 72px;
          border-top: 1px solid rgba(0,0,0,0.08);
          border-bottom: 1px solid rgba(0,0,0,0.08);
          pointer-events: none;
          z-index: 10;
        }

        /* ── LEFT: Text cylinder (hardware GPU composited) ───────── */
        .text-cylinder {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          flex-shrink: 0;
          will-change: transform;
        }

        .text-sequence {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          flex-shrink: 0;
        }

        .wheel-row {
          height: 72px;
          width: 100%;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 0 8px;
          box-sizing: border-box;
        }

        .wheel-text {
          font-family: 'LEMON MILK Pro FTR', 'LEMON MILK', 'Lemon Milk Pro',
            -apple-system, BlinkMacSystemFont, 'SF Pro Display',
            'Noto Sans', sans-serif;
          color: #000000;
          font-size: clamp(0.72rem, 2.5vw, 1.25rem);
          font-weight: 500;
          letter-spacing: 0.12em;
          text-align: center;
          white-space: nowrap;
          line-height: 1.1;
          max-width: 95%;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wheel-lang {
          font-family: 'LEMON MILK Pro FTR', 'LEMON MILK', 'Lemon Milk Pro', sans-serif;
          color: rgba(0,0,0,0.35);
          font-size: 0.52rem;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          margin-top: 4px;
          line-height: 1;
        }

        /* ── RIGHT: portrait cylinder (hardware GPU composited) ─── */
        .portraits-cylinder {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          flex-shrink: 0;
          will-change: transform;
        }

        .portraits-sequence {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          flex-shrink: 0;
        }
        .portrait-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 36px;
          padding: 0;
          line-height: 0;
          background-color: #ffffff;
        }
        .portrait-img {
          width: 100%;
          height: auto;
          display: block;
          mix-blend-mode: multiply;
          background-color: #ffffff;
          filter: contrast(1.15) brightness(0.97);
          image-rendering: -webkit-optimize-contrast;
        }
      `}</style>

      {/* STAGE 1 — Fullscreen sketch + video overlay */}
      {stage === 'intro' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-white overflow-hidden pointer-events-none">
          <SketchDrawingIntro onComplete={handleIntroComplete} />
        </div>
      )}

      {/* STAGE 2 — Hero sketch minimises to right column */}
      {(stage === 'minimizing' || stage === 'fading_in') && (
        <div
          className={`minimizing-hero-wrapper ${isPlaced ? 'is-placed' : ''}`}
          style={{ opacity: 1, transition: 'all 1.3s cubic-bezier(0.22, 1, 0.36, 1)' }}
        >
          <img
            src="/assets/portraits/hero_sketch.jpg"
            alt="Pencil sketch"
            className="minimizing-hero-img"
          />
        </div>
      )}

      {/* ── LEFT COLUMN — Birthday text, scrolls UPWARD ─────────── */}
      <section
        className="left-roller-section"
        style={{
          opacity: stage === 'intro' ? 0 : 1,
          pointerEvents: stage === 'intro' ? 'none' : 'auto',
        }}
      >
        <div aria-hidden="true" className="iphone-lens-guides" />
        <div className="iphone-wheel-mask">
          <div
            ref={textCylinderRef}
            className="text-cylinder"
            style={{
              transform: `translate3d(0, ${textStartY}px, 0)`,
            }}
          >
            {/* Seq 1 — primary sequence: starts with English at top */}
            <div className="text-sequence">
              {renderTextRows('main')}
            </div>

            {/* Seq 2 — continuous repeat */}
            <div className="text-sequence" aria-hidden="true">
              {renderTextRows('loop1')}
            </div>

            {/* Seq 3 — continuous repeat */}
            <div className="text-sequence" aria-hidden="true">
              {renderTextRows('loop2')}
            </div>
          </div>
        </div>
      </section>

      {/* ── RIGHT COLUMN — Portraits, scrolls DOWNWARD ───────────── */}
      <section
        className="right-portraits-section"
        style={{
          opacity: showOtherElements ? 1 : 0,
          pointerEvents: showOtherElements ? 'auto' : 'none',
        }}
      >
        <div className="iphone-wheel-mask">
          <div
            ref={photoCylinderRef}
            className="portraits-cylinder"
            style={{
              transform: `translate3d(0, ${streamMetrics.startY}px, 0)`,
            }}
          >
            {/* Seq 0 — top buffer */}
            <div className="portraits-sequence" aria-hidden="true">
              {STREAM_PHOTOS.map(photo => (
                <div key={`s0-${photo.id}`} className="portrait-item">
                  <img src={photo.src} alt="" className="portrait-img" loading="eager" />
                </div>
              ))}
            </div>

            {/* Seq 1 — primary (measured, starts with hero_sketch centered) */}
            <div ref={sequenceRef} className="portraits-sequence">
              {STREAM_PHOTOS.map(photo => (
                <div
                  key={`s1-${photo.id}`}
                  ref={photo.isHeader ? headerImgRef : undefined}
                  className="portrait-item"
                  style={
                    photo.isHeader && (stage === 'minimizing' || stage === 'fading_in')
                      ? { opacity: 0 }
                      : undefined
                  }
                >
                  <img
                    src={photo.src}
                    alt="Birthday portrait sketch"
                    className="portrait-img"
                    onLoad={measureAll}
                    loading="eager"
                  />
                </div>
              ))}
            </div>

            {/* Seq 2 — bottom buffer */}
            <div className="portraits-sequence" aria-hidden="true">
              {STREAM_PHOTOS.map(photo => (
                <div key={`s2-${photo.id}`} className="portrait-item">
                  <img src={photo.src} alt="" className="portrait-img" loading="eager" />
                </div>
              ))}
            </div>

            {/* Seq 3 — extended bottom buffer */}
            <div className="portraits-sequence" aria-hidden="true">
              {STREAM_PHOTOS.map(photo => (
                <div key={`s3-${photo.id}`} className="portrait-item">
                  <img src={photo.src} alt="" className="portrait-img" loading="eager" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Hanging Bubu Rope (falls from top after 1 round of roll) ── */}
      {showRopeBubu && <HangingBubuRope onRedirect={onPullRedirect} />}

      {onReset && (
        <button
          type="button"
          onClick={() => {
            setShowRopeBubu(false);
            if (onReset) onReset();
          }}
          className="fixed bottom-6 right-6 z-50 text-black/20 hover:text-black/80 text-sm tracking-widest uppercase transition-colors p-2 font-mono"
          aria-label="Replay"
          title="Replay"
        >
          ↺
        </button>
      )}
    </main>
  );
}
