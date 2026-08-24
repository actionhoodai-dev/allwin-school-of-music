// ============================================
// Web Audio API — Real-time Instrument Synthesizer
// Generates authentic acoustic audio previews for each discipline
// Zero external files, 100% reliable, zero latency
// ============================================

class SoundEngine {
  private ctx: AudioContext | null = null;
  private currentStopCallbacks: Array<() => void> = [];
  private activeSlug: string | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public getActiveSlug(): string | null {
    return this.activeSlug;
  }

  public stopAll() {
    this.currentStopCallbacks.forEach((cb) => {
      try {
        cb();
      } catch (_) {}
    });
    this.currentStopCallbacks = [];
    this.activeSlug = null;
  }

  // --- Keyboard / Grand Piano Simulation ---
  private playPiano(ctx: AudioContext, onEnd: () => void) {
    // Elegant C Major 9 Arpeggio: C4, E4, G4, B4, D5, C5
    const notes = [
      { freq: 261.63, time: 0.0, dur: 1.6 },
      { freq: 329.63, time: 0.25, dur: 1.5 },
      { freq: 392.0, time: 0.5, dur: 1.4 },
      { freq: 493.88, time: 0.75, dur: 1.3 },
      { freq: 587.33, time: 1.0, dur: 1.5 },
      { freq: 523.25, time: 1.3, dur: 2.2 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, time, dur }) => {
      const t = ctx.currentTime + time;
      
      // Fundamental + Warm Harmonic
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(freq, t);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, t);

      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(freq * 3, t);

      noteGain.gain.setValueAtTime(0.0001, t);
      noteGain.gain.exponentialRampToValueAtTime(0.8, t + 0.02); // quick acoustic strike
      noteGain.gain.exponentialRampToValueAtTime(0.2, t + 0.2); // initial decay
      noteGain.gain.exponentialRampToValueAtTime(0.0001, t + dur); // sustain release

      osc1.connect(noteGain);
      osc2.connect(noteGain);
      osc3.connect(noteGain);
      noteGain.connect(masterGain);

      osc1.start(t);
      osc2.start(t);
      osc3.start(t);
      osc1.stop(t + dur + 0.05);
      osc2.stop(t + dur + 0.05);
      osc3.stop(t + dur + 0.05);

      this.currentStopCallbacks.push(() => {
        try {
          osc1.stop();
          osc2.stop();
          osc3.stop();
        } catch (_) {}
      });
    });

    const timer = setTimeout(onEnd, 3600);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // --- Acoustic Guitar Strum ---
  private playGuitar(ctx: AudioContext, onEnd: () => void) {
    // Warm Em7 / G Major Fingerstyle Pluck
    const strings = [
      { freq: 164.81, time: 0.0, dur: 1.8 }, // E3
      { freq: 246.94, time: 0.18, dur: 1.7 }, // B3
      { freq: 329.63, time: 0.36, dur: 1.6 }, // E4
      { freq: 392.0, time: 0.54, dur: 1.5 },  // G4
      { freq: 493.88, time: 0.72, dur: 1.8 }, // B4
      { freq: 659.25, time: 0.9, dur: 2.2 },  // E5
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);

    strings.forEach(({ freq, time, dur }) => {
      const t = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const pluckGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      // Lowpass acoustic string damping
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2800, t);
      filter.frequency.exponentialRampToValueAtTime(500, t + dur);

      pluckGain.gain.setValueAtTime(0.001, t);
      pluckGain.gain.exponentialRampToValueAtTime(0.9, t + 0.015);
      pluckGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

      osc.connect(filter);
      filter.connect(pluckGain);
      pluckGain.connect(masterGain);

      osc.start(t);
      osc.stop(t + dur);

      this.currentStopCallbacks.push(() => {
        try {
          osc.stop();
        } catch (_) {}
      });
    });

    const timer = setTimeout(onEnd, 3300);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // --- Bowed Violin Legato with Vibrato ---
  private playViolin(ctx: AudioContext, onEnd: () => void) {
    const melody = [
      { freq: 293.66, dur: 0.8 }, // D4
      { freq: 440.0, dur: 0.9 },  // A4
      { freq: 493.88, dur: 0.8 }, // B4
      { freq: 587.33, dur: 1.6 }, // D5
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
    masterGain.connect(ctx.destination);

    let offset = 0;
    melody.forEach(({ freq, dur }) => {
      const t = ctx.currentTime + offset;
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      // Vibrato LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.8, t); // 5.8Hz natural violin vibrato
      lfoGain.gain.setValueAtTime(4.5, t);
      lfo.connect(osc.frequency);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.5, t);
      filter.Q.setValueAtTime(2.0, t);

      // Smooth bowing envelope
      noteGain.gain.setValueAtTime(0.001, t);
      noteGain.gain.exponentialRampToValueAtTime(0.85, t + 0.15); // gentle bow stroke
      noteGain.gain.setValueAtTime(0.85, t + dur - 0.1);
      noteGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(masterGain);

      lfo.start(t);
      osc.start(t);
      lfo.stop(t + dur);
      osc.stop(t + dur);

      this.currentStopCallbacks.push(() => {
        try {
          lfo.stop();
          osc.stop();
        } catch (_) {}
      });

      offset += dur - 0.05; // smooth legato overlap
    });

    const timer = setTimeout(onEnd, 4200);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // --- Indian Classical Vocal & Tanpura Drone ---
  private playVocal(ctx: AudioContext, onEnd: () => void) {
    // Tanpura Drone (Sa, Pa, Sa')
    const droneFreqs = [130.81, 196.0, 261.63]; // C3, G3, C4
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
    masterGain.connect(ctx.destination);

    droneFreqs.forEach((freq, idx) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.4 / (idx + 1), t + 0.5);
      g.gain.setValueAtTime(0.4 / (idx + 1), t + 3.0);
      g.gain.exponentialRampToValueAtTime(0.001, t + 4.0);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(t);
      osc.stop(t + 4.1);

      this.currentStopCallbacks.push(() => {
        try {
          osc.stop();
        } catch (_) {}
      });
    });

    // Melodic Vocal Aalap Phrase (Sa - Ga - Ma - Pa)
    const vocalNotes = [
      { freq: 261.63, time: 0.4, dur: 0.9 }, // Sa
      { freq: 329.63, time: 1.2, dur: 0.9 }, // Ga
      { freq: 349.23, time: 2.0, dur: 0.8 }, // Ma
      { freq: 392.0, time: 2.7, dur: 1.4 },  // Pa
    ];

    vocalNotes.forEach(({ freq, time, dur }) => {
      const t = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const formant = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Formant vowel simulation "Aaa"
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(800, t);
      formant.Q.setValueAtTime(3.0, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.7, t + 0.15);
      g.gain.setValueAtTime(0.7, t + dur - 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.connect(formant);
      formant.connect(g);
      g.connect(masterGain);

      osc.start(t);
      osc.stop(t + dur);

      this.currentStopCallbacks.push(() => {
        try {
          osc.stop();
        } catch (_) {}
      });
    });

    const timer = setTimeout(onEnd, 4300);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // --- Bharatham Rhythm (Sollukattu / Mridangam & Ghungroo) ---
  private playBharatham(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.35, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Rhythmic Sollukattu Pattern: Tha (Bass) - Ki - Ta - Tha - Ka - Dhi - Mi
    const beats = [
      { time: 0.0, type: 'bass', freq: 95 },
      { time: 0.35, type: 'snap', freq: 380 },
      { time: 0.7, type: 'mid', freq: 220 },
      { time: 1.05, type: 'bass', freq: 105 },
      { time: 1.4, type: 'snap', freq: 420 },
      { time: 1.75, type: 'mid', freq: 240 },
      { time: 2.1, type: 'bell', freq: 2400 }, // Ghungroo chime
      { time: 2.45, type: 'bass', freq: 90 },
    ];

    beats.forEach(({ time, type, freq }) => {
      const t = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();

      if (type === 'bass') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.25);
        g.gain.setValueAtTime(0.9, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      } else if (type === 'snap') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.12);
        g.gain.setValueAtTime(0.7, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      } else if (type === 'bell') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.4, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      } else {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        g.gain.setValueAtTime(0.6, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      }

      osc.connect(g);
      g.connect(masterGain);

      osc.start(t);
      osc.stop(t + 0.7);

      this.currentStopCallbacks.push(() => {
        try {
          osc.stop();
        } catch (_) {}
      });
    });

    const timer = setTimeout(onEnd, 3400);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // --- Theory of Music (Polyphonic Chorale Cadence) ---
  private playTheory(ctx: AudioContext, onEnd: () => void) {
    // 4-Part Harmony Chord Progression: I - IV - V7 - I
    const chords = [
      { time: 0.0, freqs: [261.63, 329.63, 392.0, 523.25], dur: 0.8 }, // C Major
      { time: 0.8, freqs: [261.63, 349.23, 440.0, 523.25], dur: 0.8 }, // F Major
      { time: 1.6, freqs: [246.94, 293.66, 392.0, 493.88], dur: 0.8 }, // G7
      { time: 2.4, freqs: [261.63, 329.63, 392.0, 523.25], dur: 1.5 }, // C Major Resolve
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, ctx.currentTime);
    masterGain.connect(ctx.destination);

    chords.forEach(({ time, freqs, dur }) => {
      const t = ctx.currentTime + time;
      freqs.forEach((freq) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        g.gain.setValueAtTime(0.001, t);
        g.gain.exponentialRampToValueAtTime(0.6, t + 0.08);
        g.gain.setValueAtTime(0.6, t + dur - 0.08);
        g.gain.exponentialRampToValueAtTime(0.001, t + dur);

        osc.connect(g);
        g.connect(masterGain);

        osc.start(t);
        osc.stop(t + dur);

        this.currentStopCallbacks.push(() => {
          try {
            osc.stop();
          } catch (_) {}
        });
      });
    });

    const timer = setTimeout(onEnd, 4100);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  public play(slug: string, onEnd?: () => void): boolean {
    this.stopAll();

    try {
      const ctx = this.getContext();
      this.activeSlug = slug;

      const handleEnd = () => {
        if (this.activeSlug === slug) {
          this.activeSlug = null;
        }
        if (onEnd) onEnd();
      };

      switch (slug.toLowerCase()) {
        case 'keyboard':
        case 'piano':
          this.playPiano(ctx, handleEnd);
          return true;
        case 'guitar':
          this.playGuitar(ctx, handleEnd);
          return true;
        case 'violin':
          this.playViolin(ctx, handleEnd);
          return true;
        case 'vocal':
          this.playVocal(ctx, handleEnd);
          return true;
        case 'bharatham':
          this.playBharatham(ctx, handleEnd);
          return true;
        case 'theory':
        case 'theory-of-music':
          this.playTheory(ctx, handleEnd);
          return true;
        default:
          this.playPiano(ctx, handleEnd);
          return true;
      }
    } catch (err) {
      console.warn('Audio synthesis failed:', err);
      if (onEnd) onEnd();
      return false;
    }
  }
}

export const instrumentAudio = new SoundEngine();
