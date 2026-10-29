/**
 * AudioManager for Birthday Garden Experience
 * 
 * Choreography:
 * 1. Blossom Touch (Lock Screen):
 *    - Song ("I Love You Krish Kapoor!") starts at 0:48 at medium volume (0.55).
 *    - Guaranteed to play on all mobile devices (iOS with silent switch on/off, Android, desktop).
 *    - Builds up for 15.68s during the petal spiral & curtain split.
 * 2. Roll Screen Appearance (at 1:03.68):
 *    - Hits the exact downbeat drop at 1:03.68 as the roll screen appears.
 *    - Loops seamlessly from 1:03.68 (63.681s) to 1:19.68 (79.678s).
 *    - Uses pre-rendered equal-power S-curve crossfaded circular buffer.
 * 3. Scrapbook Appearance:
 *    - releaseLoop() smoothly transitions out of the loop and continues forward to the end of the track.
 * 4. Website Closed / Hidden:
 *    - Automatically stops playback.
 * 
 * Reliability Guarantee:
 * - Single-engine enforcement (activeEngine = 'webaudio' | 'html5'): NEVER plays twice.
 * - iOS silent switch bypass: sets navigator.audioSession.type = 'playback' and uses silent tag unmuter.
 */

const SILENT_WAV = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

class AudioManager {
  constructor() {
    this.audioCtx = null;
    this.audioBuffer = null;
    this.loopBuffer = null;
    this.introSource = null;
    this.loopSource = null;
    this.outroSource = null;
    this.masterGain = null;
    this.loopGain = null;
    this.fallbackAudio = null;
    this.silentUnmuter = null;
    this.activeEngine = null; // 'webaudio' | 'html5' | null
    this.isPlaying = false;
    this.isLooping = false;
    this.startOffset = 48.0;      // 0:48 (blossom touch start)
    this.loopStart = 63.68147;    // 1:03.68 (exact downbeat drop transient)
    this.loopDuration = 15.69929; // Exactly 32 beats = 8 full bars of 4/4 at 122.298 BPM
    this.loopEnd = this.loopStart + this.loopDuration; // 79.38076s (~1:19.38)
    this.targetVolume = 0.55;     // Medium level sound
    this.isLoaded = false;
    this.loadPromise = null;
    this.wasPlayingBeforeHide = false;
    this.listeners = new Set();

    if (typeof window !== 'undefined') {
      this.initListeners();
      this.preload();
    }
  }

  // Subscribe to playback state changes
  subscribe(fn) {
    this.listeners.add(fn);
    fn({
      isPlaying: this.isPlaying,
      isLooping: this.isLooping,
      isLoaded: this.isLoaded,
    });
    return () => this.listeners.delete(fn);
  }

  notify() {
    for (const fn of this.listeners) {
      try {
        fn({
          isPlaying: this.isPlaying,
          isLooping: this.isLooping,
          isLoaded: this.isLoaded,
        });
      } catch (_) {}
    }
  }

  // Get shared AudioContext for all sound effects across the app
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Unlocks audio on mobile Safari and Android
  unlockAudio() {
    // 1. Set audioSession to 'playback' on iOS Safari 15+ so silent switch doesn't mute
    try {
      if (typeof navigator !== 'undefined' && 'audioSession' in navigator) {
        navigator.audioSession.type = 'playback';
      }
    } catch (_) {}

    // 2. Play 1-sample silent inaudible WAV on HTML5 Audio to force iOS into Playback audio session
    try {
      if (!this.silentUnmuter) {
        this.silentUnmuter = new Audio(SILENT_WAV);
        this.silentUnmuter.volume = 0.01;
      }
      this.silentUnmuter.play().catch(() => {});
    } catch (_) {}

    // 3. Resume / create Web Audio context
    try {
      if (!this.audioCtx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.audioCtx = new AudioCtx();
      }
      if (this.audioCtx) {
        this.audioCtx.onstatechange = () => {
          if (this.isPlaying && this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
        };
        if (this.audioCtx.state === 'suspended') {
          this.audioCtx.resume().catch(() => {});
        }
        // Play 1-sample silent Web Audio buffer at system sample rate
        const sr = this.audioCtx.sampleRate || 44100;
        const buffer = this.audioCtx.createBuffer(1, 1, sr);
        const source = this.audioCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.audioCtx.destination);
        source.start(0);
      }
    } catch (_) {}
  }

  // Warm up audio context on keypad typing
  warmup() {
    this.unlockAudio();
  }

  // Preload and decode audio into memory
  preload() {
    if (this.loadPromise) return this.loadPromise;

    this.initFallback();

    this.loadPromise = (async () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;

        if (!this.audioCtx) {
          this.audioCtx = new AudioCtx();
        }
        const res = await fetch('/assets/sounds/krish_kapoor.mp3');
        const arrayBuf = await res.arrayBuffer();
        this.audioBuffer = await this.audioCtx.decodeAudioData(arrayBuf);
        this.isLoaded = true;

        // Build the seamless equal-power circular loop buffer in memory
        this.buildLoopBuffer();
      } catch (err) {
        console.warn('Web Audio preload note:', err);
      }
    })();

    return this.loadPromise;
  }

  // Pre-render seamless circular audio loop buffer
  buildLoopBuffer() {
    if (!this.audioCtx || !this.audioBuffer) return null;
    if (this.loopBuffer) return this.loopBuffer;

    try {
      const sr = this.audioBuffer.sampleRate;
      const startSample = Math.floor(this.loopStart * sr);
      const loopSamples = Math.floor(this.loopDuration * sr);
      const endSample = startSample + loopSamples;

      if (loopSamples <= 0 || endSample > this.audioBuffer.length) return null;

      // 350ms crossfade window
      const xfadeSamples = Math.min(Math.floor(0.350 * sr), Math.floor(loopSamples / 4));
      const numChannels = this.audioBuffer.numberOfChannels;
      const loopBuf = this.audioCtx.createBuffer(numChannels, loopSamples, sr);

      for (let ch = 0; ch < numChannels; ch++) {
        const srcChannel = this.audioBuffer.getChannelData(ch);
        const destChannel = loopBuf.getChannelData(ch);

        // Copy 32-beat phrase
        for (let i = 0; i < loopSamples; i++) {
          destChannel[i] = srcChannel[startSample + i];
        }

        // Crossfade
        for (let i = 0; i < xfadeSamples; i++) {
          const theta = (i / xfadeSamples) * (Math.PI / 2);
          const gainOut = Math.cos(theta);
          const gainIn = Math.sin(theta);

          const contSample = (endSample + i < srcChannel.length) ? srcChannel[endSample + i] : 0;
          destChannel[i] = destChannel[i] * gainIn + contSample * gainOut;
        }
      }

      this.loopBuffer = loopBuf;
      return loopBuf;
    } catch (e) {
      console.warn('Failed to build seamless loop buffer:', e);
      return null;
    }
  }

  initFallback() {
    if (this.fallbackAudio) return;
    this.fallbackAudio = new Audio('/assets/sounds/krish_kapoor.mp3');
    this.fallbackAudio.volume = this.targetVolume;
    this.fallbackAudio.preload = 'auto';

    // HTML5 audio loop handler with safe retry on mobile
    this.fallbackAudio.addEventListener('timeupdate', () => {
      if (this.activeEngine === 'html5' && this.isLooping && this.fallbackAudio.currentTime >= this.loopEnd) {
        try {
          this.fallbackAudio.currentTime = this.loopStart;
          if (this.fallbackAudio.paused && this.isPlaying) {
            this.fallbackAudio.play().catch(() => {});
          }
        } catch (_) {}
      }
    });
  }

  // Listen for tab hide or window close to stop sound, and auto-revive on user touch
  initListeners() {
    window.addEventListener('beforeunload', () => this.stop());
    window.addEventListener('pagehide', () => this.stop());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        if (this.isPlaying) {
          this.wasPlayingBeforeHide = true;
        }
      } else if (document.visibilityState === 'visible') {
        if (this.wasPlayingBeforeHide) {
          this.wasPlayingBeforeHide = false;
          this.resume();
        }
      }
    });

    // Mobile watchdog: auto-revive audio context if iOS/Android throttles or stalls it during page transitions
    const reviveIfStalled = () => {
      if (!this.isPlaying) return;
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      if (this.activeEngine === 'html5' && this.fallbackAudio && this.fallbackAudio.paused) {
        this.fallbackAudio.play().catch(() => {});
      }
    };
    window.addEventListener('touchstart', reviveIfStalled, { passive: true });
    window.addEventListener('touchend', reviveIfStalled, { passive: true });
    window.addEventListener('click', reviveIfStalled, { passive: true });
  }

  // Start playback when blossom is touched: from 0:48 at medium volume
  async playFromBlossom() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.isLooping = true;
    this.unlockAudio();
    this.notify();

    // Check if AudioContext needs resuming
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (_) {}
    }

    // If Web Audio buffer is ready and context is running, use Web Audio
    if (this.isLoaded && this.audioBuffer && this.audioCtx && this.audioCtx.state === 'running') {
      this.activeEngine = 'webaudio';
      this._startWebAudio();
    } else {
      // Otherwise, start HTML5 Audio immediately so user hears music without waiting
      this.activeEngine = 'html5';
      this._startHTML5Audio();

      // If Web Audio finishes loading while playing, schedule seamless takeover at the 1:03 drop
      if (this.loadPromise) {
        this.loadPromise.then(async () => {
          if (this.isPlaying && this.activeEngine === 'html5') {
            this.buildLoopBuffer();
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
              try { await this.audioCtx.resume(); } catch (_) {}
            }
            // If still in the 15-second intro before 1:03.68, transition to Web Audio loop at 1:03.68
            const currentPos = this.fallbackAudio ? this.fallbackAudio.currentTime : 48;
            if (currentPos < this.loopStart) {
              const msUntilDrop = Math.max(100, (this.loopStart - currentPos) * 1000);
              setTimeout(() => {
                if (this.isPlaying && this.activeEngine === 'html5' && this.loopBuffer) {
                  // Switch from HTML5 intro to Web Audio loop
                  try {
                    if (this.fallbackAudio) this.fallbackAudio.pause();
                  } catch (_) {}
                  this.activeEngine = 'webaudio';
                  this._startWebAudioLoopOnly();
                }
              }, msUntilDrop - 40);
            }
          }
        });
      }
    }
  }

  _startHTML5Audio() {
    try {
      if (!this.fallbackAudio) this.initFallback();
      if (!this.fallbackAudio) return;

      this.fallbackAudio.volume = this.targetVolume;

      const doPlay = () => {
        try {
          this.fallbackAudio.currentTime = this.startOffset;
        } catch (_) {}
        const p = this.fallbackAudio.play();
        if (p && typeof p.catch === 'function') {
          p.catch((err) => console.warn('HTML5 play note:', err));
        }
      };

      if (this.fallbackAudio.readyState >= 1) {
        doPlay();
      } else {
        doPlay();
        this.fallbackAudio.addEventListener('loadedmetadata', doPlay, { once: true });
        this.fallbackAudio.addEventListener('canplay', doPlay, { once: true });
      }
    } catch (e) {
      console.warn('Fallback audio start error:', e);
    }
  }

  _startWebAudio() {
    try {
      // Guarantee fallback HTML5 audio is stopped
      if (this.fallbackAudio) {
        try {
          this.fallbackAudio.pause();
          this.fallbackAudio.currentTime = this.startOffset;
        } catch (_) {}
      }

      if (!this.audioBuffer || !this.audioCtx) {
        this.activeEngine = 'html5';
        this._startHTML5Audio();
        return;
      }

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.targetVolume, this.audioCtx.currentTime);
      this.masterGain.connect(this.audioCtx.destination);

      this.buildLoopBuffer();

      const now = this.audioCtx.currentTime;
      const introDuration = this.loopStart - this.startOffset; // 15.68147s

      // 1. Play intro from 48.0s up to 63.68147s (exact duration of spiral + split)
      this.introSource = this.audioCtx.createBufferSource();
      this.introSource.buffer = this.audioBuffer;
      this.introSource.connect(this.masterGain);
      this.introSource.start(now, this.startOffset, introDuration);

      // 2. Schedule seamless circular loop buffer on the Web Audio hardware clock
      // Starts at the EXACT microsecond intro finishes (1:03.68 downbeat drop)
      if (this.loopBuffer) {
        this.loopGain = this.audioCtx.createGain();
        this.loopGain.gain.setValueAtTime(1.0, now);
        this.loopGain.connect(this.masterGain);

        this.loopSource = this.audioCtx.createBufferSource();
        this.loopSource.buffer = this.loopBuffer;
        this.loopSource.loop = true;
        this.loopSource.connect(this.loopGain);
        this.loopSource.start(now + introDuration);
      }
      this.notify();
    } catch (err) {
      console.error('Web Audio start error, falling back to HTML5:', err);
      this.activeEngine = 'html5';
      this._startHTML5Audio();
    }
  }

  _startWebAudioLoopOnly() {
    try {
      if (!this.audioCtx || !this.loopBuffer) return;
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume().catch(() => {});
      }
      const now = this.audioCtx.currentTime;

      this.masterGain = this.audioCtx.createGain();
      this.masterGain.gain.setValueAtTime(this.targetVolume, now);
      this.masterGain.connect(this.audioCtx.destination);

      this.loopGain = this.audioCtx.createGain();
      this.loopGain.gain.setValueAtTime(1.0, now);
      this.loopGain.connect(this.masterGain);

      this.loopSource = this.audioCtx.createBufferSource();
      this.loopSource.buffer = this.loopBuffer;
      this.loopSource.loop = true;
      this.loopSource.connect(this.loopGain);
      this.loopSource.start(now);
      this.notify();
    } catch (e) {
      console.warn('Web Audio loop-only start error:', e);
    }
  }

  // Release loop when scrapbook appears: continues seamlessly from 1:19.38 to end
  releaseLoop() {
    if (!this.isPlaying) return;
    this.isLooping = false;

    if (this.activeEngine === 'webaudio' && this.audioCtx && this.audioBuffer && this.masterGain) {
      try {
        const now = this.audioCtx.currentTime;

        // Start outro continuing naturally from loopEnd (79.38076s) through to song end
        this.outroSource = this.audioCtx.createBufferSource();
        this.outroSource.buffer = this.audioBuffer;

        const outroGain = this.audioCtx.createGain();
        outroGain.gain.setValueAtTime(0.001, now);
        outroGain.gain.linearRampToValueAtTime(1.0, now + 0.25);

        this.outroSource.connect(outroGain);
        outroGain.connect(this.masterGain);
        this.outroSource.start(now, this.loopEnd);

        // Smoothly fade out the looping buffer node over 250ms
        if (this.loopGain && this.loopSource) {
          this.loopGain.gain.setValueAtTime(this.loopGain.gain.value, now);
          this.loopGain.gain.linearRampToValueAtTime(0.001, now + 0.25);
          setTimeout(() => {
            if (this.loopSource) {
              try { this.loopSource.stop(); } catch {}
              this.loopSource = null;
            }
          }, 300);
        }
      } catch (err) {
        console.warn('Error releasing loop:', err);
      }
    } else if (this.activeEngine === 'html5' && this.fallbackAudio) {
      // In HTML5 mode, setting isLooping = false allows playback to continue forward to end
    }
    this.notify();
  }

  // Stop playback immediately when closed or requested
  stop() {
    this.isPlaying = false;
    this.isLooping = false;
    this.activeEngine = null;

    if (this.introSource) {
      try { this.introSource.stop(); } catch {}
      this.introSource = null;
    }
    if (this.loopSource) {
      try { this.loopSource.stop(); } catch {}
      this.loopSource = null;
    }
    if (this.outroSource) {
      try { this.outroSource.stop(); } catch {}
      this.outroSource = null;
    }

    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
        this.fallbackAudio.currentTime = 0;
      } catch {}
    }
    this.notify();
  }

  pause() {
    this.isPlaying = false;
    if (this.activeEngine === 'webaudio' && this.audioCtx && this.audioCtx.state === 'running') {
      this.audioCtx.suspend().catch(() => {});
    }
    if (this.fallbackAudio && !this.fallbackAudio.paused) {
      this.fallbackAudio.pause();
    }
    this.notify();
  }

  resume() {
    this.unlockAudio();
    this.isPlaying = true;
    if (this.activeEngine === 'webaudio' && this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    } else if (this.activeEngine === 'html5' && this.fallbackAudio && this.fallbackAudio.paused) {
      this.fallbackAudio.play().catch(() => {});
    }
    this.notify();
  }
}

export const audioManager = new AudioManager();
if (typeof window !== 'undefined') {
  window.audioManager = audioManager;
}
export default audioManager;
