import React, { useEffect, useRef, useState } from 'react';

const STAGE_SRCS = [
  '/assets/portraits/stage_0.jpg',
  '/assets/portraits/stage_1.jpg',
  '/assets/portraits/stage_2.jpg',
  '/assets/portraits/stage_3.jpg',
  '/assets/portraits/stage_4.jpg',
  '/assets/portraits/stage_5.jpg',
  '/assets/portraits/stage_6.jpg',
  '/assets/portraits/stage_7.jpg',
];

const TOTAL_DURATION = 7000; // 7.0s realistic drawing animation synced with Scene-9.mp4

export default function SketchDrawingIntro({ onComplete }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const imagesRef = useRef([]);
  const hasTriggeredCompleteRef = useRef(false);

  const triggerComplete = () => {
    if (hasTriggeredCompleteRef.current) return;
    hasTriggeredCompleteRef.current = true;
    setTimeout(() => {
      if (onComplete) onComplete();
    }, 450);
  };

  // Video end event listener & fallback safety timer
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleEnded = () => {
      triggerComplete();
    };

    const handleTimeUpdate = () => {
      // Scene-9 ends at 7.5s; if it reaches 7.3s, prepare smooth finish
      if (vid.currentTime >= 7.3) {
        triggerComplete();
      }
    };

    vid.addEventListener('ended', handleEnded);
    vid.addEventListener('timeupdate', handleTimeUpdate);

    // Safety fallback timer if video fails to play or load
    const fallbackTimer = setTimeout(() => {
      triggerComplete();
    }, 8200);

    return () => {
      vid.removeEventListener('ended', handleEnded);
      vid.removeEventListener('timeupdate', handleTimeUpdate);
      clearTimeout(fallbackTimer);
    };
  }, [onComplete]);

  // Preload all 8 progressive drawing stages
  useEffect(() => {
    let loadedCount = 0;
    const imgs = [];

    STAGE_SRCS.forEach((src, idx) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount === STAGE_SRCS.length) {
          imagesRef.current = imgs;
          setImagesLoaded(true);
        }
      };
      imgs[idx] = img;
    });
  }, []);

  // Run the progressive drawing animation loop on canvas
  useEffect(() => {
    if (!imagesLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const imgs = imagesRef.current;

    // Use high-resolution canvas matching aspect ratio (16:9)
    const w = 1280;
    const h = 720;
    canvas.width = w;
    canvas.height = h;

    // Create persistent offscreen canvas for pristine ink compositing
    const offCanvas = document.createElement('canvas');
    offCanvas.width = w;
    offCanvas.height = h;
    const offCtx = offCanvas.getContext('2d');

    let startTime = null;

    const renderLoop = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / TOTAL_DURATION, 1);

      // 1. Fill base with 100% pure white paper
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, w, h);

      // Determine active stages
      const numIntervals = imgs.length - 1; // 7 intervals
      const scaledP = progress * numIntervals;
      const stageA = Math.min(Math.floor(scaledP), numIntervals - 1);
      const stageB = Math.min(stageA + 1, imgs.length - 1);
      const localP = scaledP - stageA;

      // Smooth Hermite easing curve for natural hand sketching rhythm
      const easeAlpha = localP * localP * (3 - 2 * localP);

      if (stageA < 5) {
        // Stages 0 through 4: Progressive pencil stroke buildup
        ctx.globalAlpha = 1.0;
        ctx.drawImage(imgs[stageA], 0, 0, w, h);

        if (localP > 0.001) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.globalAlpha = easeAlpha;
          ctx.drawImage(imgs[stageB], 0, 0, w, h);
        }
      } else {
        // Stage 5 -> 6 and 6 -> 7:
        // Accurate ink dissolve: the drawing image (stage 5) smoothly fades out,
        // while the realistic portrait (stage 6 & 7) smoothly resolves in.
        ctx.globalAlpha = 1.0 - easeAlpha;
        ctx.drawImage(imgs[stageA], 0, 0, w, h);

        offCtx.globalCompositeOperation = 'source-over';
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, w, h);
        offCtx.globalAlpha = easeAlpha;
        offCtx.drawImage(imgs[stageB], 0, 0, w, h);

        ctx.globalCompositeOperation = 'multiply';
        ctx.globalAlpha = 1.0;
        ctx.drawImage(offCanvas, 0, 0, w, h);
      }

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(renderLoop);
      }
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [imagesLoaded]);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none select-none bg-white"
      style={{ isolation: 'isolate', contain: 'paint' }}
    >
      <style>{`
        /* Canvas intro gentle breath zoom */
        @keyframes gentleStartZoom {
          0%   { transform: scale(1) translateZ(0); }
          45%  { transform: scale(1.035) translateZ(0); }
          100% { transform: scale(1) translateZ(0); }
        }

        /* Overlay layers fade in */
        @keyframes scene9VideoFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 0.75; }
        }
        @keyframes scene9TintFadeIn {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }

        /* Canvas – GPU layer, multiply blend to show pencil on white */
        .intro-sketch-canvas {
          animation: gentleStartZoom 2.4s cubic-bezier(0.25, 1, 0.5, 1) 1 forwards;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* ── Scene-9 video ──────────────────────────────────────────
           scale(1.22) zooms in ~22% – crops the Jitter watermark
           from all four edges without any visible cropping artefact.
           NO CSS filter (filter chains cause per-pixel CPU lag).
           GPU layer via translateZ(0) + will-change for smooth decode. */
        .scene9-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scale(1.22) translateZ(0);
          will-change: transform;
          backface-visibility: hidden;
          mix-blend-mode: multiply;
          opacity: 0;
          animation: scene9VideoFadeIn 1.4s ease-out 0.5s forwards;
          animation-fill-mode: both;
          z-index: 20;
          pointer-events: none;
        }

        /* ── Maroon cinematic tint div ──────────────────────────────
           A plain GPU-drawn rectangle – zero per-pixel cost vs filter.
           Sits above the video, blends multiply for deep maroon wash. */
        .scene9-tint {
          position: absolute;
          inset: 0;
          background: rgba(110, 8, 38, 0.42);
          mix-blend-mode: multiply;
          z-index: 21;
          pointer-events: none;
          opacity: 0;
          animation: scene9TintFadeIn 1.4s ease-out 0.5s forwards;
          transform: translateZ(0);
          will-change: opacity;
        }

      `}</style>

      {/* ── Layer 1: Pencil sketch canvas (z-index 10) ──────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ zIndex: 10, willChange: 'contents', transform: 'translateZ(0)' }}
      >
        <canvas
          ref={canvasRef}
          className="intro-sketch-canvas block max-w-[94vw] max-h-[85vh] object-contain"
          style={{ backgroundColor: '#ffffff', mixBlendMode: 'multiply' }}
        />
      </div>

      {/* ── Layer 2: Scene-9 raw video, zoomed to crop watermark ── */}
      <video
        ref={videoRef}
        className="scene9-video"
        src="/assets/scene9.mp4"
        autoPlay
        muted
        playsInline
        preload="auto"
      />

      {/* ── Layer 3: Maroon tint — replaces expensive CSS filter ─── */}
      <div className="scene9-tint" />
    </div>
  );
}
