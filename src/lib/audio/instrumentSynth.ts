// ============================================
// Web Audio API — Real-time Instrument Synthesizer
// Generates authentic acoustic audio previews for each discipline
// Extended ~15-20 second performances per instrument
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

  // Helper: schedule oscillators with cleanup
  private scheduleNote(
    ctx: AudioContext,
    masterGain: GainNode,
    config: {
      type: OscillatorType;
      freq: number;
      startTime: number;
      dur: number;
      attack?: number;
      decay?: number;
      sustain?: number;
      filterType?: BiquadFilterType;
      filterFreq?: number;
      filterDecay?: number;
      vibratoRate?: number;
      vibratoDepth?: number;
      harmonics?: { type: OscillatorType; freqMul: number; gain: number }[];
    }
  ) {
    const {
      type, freq, startTime: t, dur,
      attack = 0.02, decay = 0.2, sustain = 0.3,
      filterType, filterFreq, filterDecay,
      vibratoRate, vibratoDepth,
      harmonics,
    } = config;

    const noteGain = ctx.createGain();
    let destination: AudioNode = masterGain;

    // Optional filter
    if (filterType && filterFreq) {
      const filter = ctx.createBiquadFilter();
      filter.type = filterType;
      filter.frequency.setValueAtTime(filterFreq, t);
      if (filterDecay) {
        filter.frequency.exponentialRampToValueAtTime(Math.max(filterDecay, 20), t + dur);
      }
      filter.connect(masterGain);
      destination = filter;
    }

    // Envelope
    noteGain.gain.setValueAtTime(0.0001, t);
    noteGain.gain.exponentialRampToValueAtTime(0.8, t + attack);
    noteGain.gain.exponentialRampToValueAtTime(sustain, t + decay);
    noteGain.gain.setValueAtTime(sustain, t + dur - 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    noteGain.connect(destination);

    // Main oscillator
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

    // Optional vibrato
    if (vibratoRate && vibratoDepth) {
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(vibratoRate, t);
      lfoGain.gain.setValueAtTime(vibratoDepth, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur + 0.05);
      this.currentStopCallbacks.push(() => { try { lfo.stop(); } catch (_) {} });
    }

    osc.connect(noteGain);
    osc.start(t);
    osc.stop(t + dur + 0.05);
    this.currentStopCallbacks.push(() => { try { osc.stop(); } catch (_) {} });

    // Optional harmonics
    if (harmonics) {
      harmonics.forEach(({ type: hType, freqMul, gain: hGain }) => {
        const h = ctx.createOscillator();
        const hg = ctx.createGain();
        h.type = hType;
        h.frequency.setValueAtTime(freq * freqMul, t);
        hg.gain.setValueAtTime(hGain, t);
        hg.gain.setValueAtTime(hGain, t + dur - 0.05);
        hg.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        h.connect(hg);
        hg.connect(noteGain);
        h.start(t);
        h.stop(t + dur + 0.05);
        this.currentStopCallbacks.push(() => { try { h.stop(); } catch (_) {} });
      });
    }
  }

  // ==============================
  // KEYBOARD / GRAND PIANO — ~18 seconds
  // Full classical-style piece: C major warm arpeggio → melodic phrase → chord resolution
  // ==============================
  private playPiano(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Section 1: Opening arpeggio (0s-4s)
    const arp1 = [
      { freq: 261.63, time: 0.0, dur: 2.0 },   // C4
      { freq: 329.63, time: 0.35, dur: 1.8 },   // E4
      { freq: 392.0, time: 0.7, dur: 1.6 },     // G4
      { freq: 523.25, time: 1.05, dur: 1.5 },   // C5
      { freq: 659.25, time: 1.4, dur: 2.0 },    // E5
      { freq: 523.25, time: 1.8, dur: 2.5 },    // C5 sustain
    ];

    // Section 2: Melodic phrase (4s-9s)
    const melody = [
      { freq: 523.25, time: 3.5, dur: 1.0 },   // C5
      { freq: 587.33, time: 4.5, dur: 0.8 },   // D5
      { freq: 659.25, time: 5.3, dur: 1.2 },   // E5
      { freq: 587.33, time: 6.5, dur: 0.6 },   // D5
      { freq: 523.25, time: 7.1, dur: 1.5 },   // C5
      { freq: 493.88, time: 8.6, dur: 0.8 },   // B4
      { freq: 440.0, time: 9.4, dur: 1.2 },    // A4
    ];

    // Section 3: Second arpeggio descent (10s-13s)
    const arp2 = [
      { freq: 392.0, time: 10.8, dur: 1.0 },   // G4
      { freq: 440.0, time: 11.3, dur: 0.9 },   // A4
      { freq: 493.88, time: 11.8, dur: 0.8 },  // B4
      { freq: 523.25, time: 12.3, dur: 1.5 },  // C5
      { freq: 659.25, time: 13.0, dur: 1.8 },  // E5
    ];

    // Section 4: Final chord resolution (14s-18s)
    const finale = [
      { freq: 261.63, time: 14.8, dur: 3.0 },  // C4
      { freq: 329.63, time: 14.85, dur: 3.0 }, // E4
      { freq: 392.0, time: 14.9, dur: 3.0 },   // G4
      { freq: 523.25, time: 14.95, dur: 3.5 }, // C5
    ];

    [...arp1, ...melody, ...arp2, ...finale].forEach(({ freq, time, dur }) => {
      this.scheduleNote(ctx, masterGain, {
        type: 'triangle',
        freq, startTime: ctx.currentTime + time, dur,
        attack: 0.015, decay: 0.15, sustain: 0.2,
        harmonics: [
          { type: 'sine', freqMul: 2, gain: 0.15 },
          { type: 'sine', freqMul: 3, gain: 0.06 },
        ],
      });
    });

    const timer = setTimeout(onEnd, 18500);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // ==============================
  // ACOUSTIC GUITAR — ~17 seconds
  // Fingerpicking pattern → strum chords → melodic solo → final strum
  // ==============================
  private playGuitar(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Section 1: Fingerpicking Em arpeggio (0s-4s)
    const pick1 = [
      { freq: 164.81, time: 0.0, dur: 1.5 },    // E3
      { freq: 246.94, time: 0.3, dur: 1.3 },    // B3
      { freq: 329.63, time: 0.6, dur: 1.2 },    // E4
      { freq: 392.0, time: 0.9, dur: 1.1 },     // G4
      { freq: 329.63, time: 1.2, dur: 1.0 },    // E4
      { freq: 246.94, time: 1.5, dur: 1.0 },    // B3
      // Repeat with Am
      { freq: 220.0, time: 2.0, dur: 1.5 },     // A3
      { freq: 261.63, time: 2.3, dur: 1.3 },    // C4
      { freq: 329.63, time: 2.6, dur: 1.2 },    // E4
      { freq: 440.0, time: 2.9, dur: 1.1 },     // A4
      { freq: 329.63, time: 3.2, dur: 1.0 },    // E4
      { freq: 261.63, time: 3.5, dur: 1.0 },    // C4
    ];

    // Section 2: Strummed chords G-C-D (4s-8.5s)
    const strums = [
      // G chord
      { freq: 196.0, time: 4.2, dur: 1.8 },     // G3
      { freq: 246.94, time: 4.25, dur: 1.7 },   // B3
      { freq: 293.66, time: 4.3, dur: 1.6 },    // D4
      { freq: 392.0, time: 4.35, dur: 1.5 },    // G4
      // C chord
      { freq: 261.63, time: 5.8, dur: 1.8 },    // C4
      { freq: 329.63, time: 5.85, dur: 1.7 },   // E4
      { freq: 392.0, time: 5.9, dur: 1.6 },     // G4
      { freq: 523.25, time: 5.95, dur: 1.5 },   // C5
      // D chord
      { freq: 293.66, time: 7.3, dur: 1.5 },    // D4
      { freq: 369.99, time: 7.35, dur: 1.4 },   // F#4
      { freq: 440.0, time: 7.4, dur: 1.3 },     // A4
      { freq: 587.33, time: 7.45, dur: 1.3 },   // D5
    ];

    // Section 3: Solo melody (9s-13s)
    const solo = [
      { freq: 329.63, time: 9.0, dur: 0.6 },    // E4
      { freq: 369.99, time: 9.6, dur: 0.5 },    // F#4
      { freq: 392.0, time: 10.1, dur: 0.8 },    // G4
      { freq: 493.88, time: 10.9, dur: 0.5 },   // B4
      { freq: 440.0, time: 11.4, dur: 0.7 },    // A4
      { freq: 392.0, time: 12.1, dur: 0.6 },    // G4
      { freq: 329.63, time: 12.7, dur: 1.2 },   // E4
    ];

    // Section 4: Final Em strum (13.5s-17s)
    const finalStrum = [
      { freq: 164.81, time: 14.0, dur: 3.0 },   // E3
      { freq: 246.94, time: 14.08, dur: 3.0 },  // B3
      { freq: 329.63, time: 14.16, dur: 3.0 },  // E4
      { freq: 392.0, time: 14.24, dur: 3.0 },   // G4
      { freq: 493.88, time: 14.32, dur: 3.0 },  // B4
      { freq: 659.25, time: 14.4, dur: 3.0 },   // E5
    ];

    [...pick1, ...strums, ...solo, ...finalStrum].forEach(({ freq, time, dur }) => {
      this.scheduleNote(ctx, masterGain, {
        type: 'sawtooth',
        freq, startTime: ctx.currentTime + time, dur,
        attack: 0.012, decay: 0.08, sustain: 0.15,
        filterType: 'lowpass', filterFreq: 2800, filterDecay: 400,
      });
    });

    const timer = setTimeout(onEnd, 17500);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // ==============================
  // BOWED VIOLIN — ~18 seconds
  // Lyrical legato melody with expressive vibrato, slow phrases, and sustained tones
  // ==============================
  private playViolin(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.25, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Long lyrical melody in D minor with generous sustain
    const melody = [
      // Phrase 1: Opening (0s-5s)
      { freq: 293.66, dur: 1.8 },   // D4
      { freq: 349.23, dur: 1.5 },   // F4
      { freq: 440.0, dur: 2.2 },    // A4 (long sustain)
      // Phrase 2: Climbing (4.5s-9s)
      { freq: 493.88, dur: 1.2 },   // B♭4
      { freq: 440.0, dur: 1.0 },    // A4
      { freq: 392.0, dur: 1.5 },    // G4
      { freq: 349.23, dur: 2.0 },   // F4 (long)
      // Phrase 3: Emotional peak (9s-14s)
      { freq: 523.25, dur: 2.0 },   // C5
      { freq: 587.33, dur: 2.5 },   // D5 (peak, long vibrato)
      { freq: 523.25, dur: 1.2 },   // C5
      // Phrase 4: Resolution (13.5s-18s)
      { freq: 440.0, dur: 1.2 },    // A4
      { freq: 349.23, dur: 1.0 },   // F4
      { freq: 293.66, dur: 3.0 },   // D4 (final sustained)
    ];

    let offset = 0;
    melody.forEach(({ freq, dur }) => {
      this.scheduleNote(ctx, masterGain, {
        type: 'sawtooth',
        freq, startTime: ctx.currentTime + offset, dur,
        attack: 0.12, decay: 0.3, sustain: 0.7,
        filterType: 'bandpass', filterFreq: freq * 1.5,
        vibratoRate: 5.5, vibratoDepth: 4.5,
      });
      offset += dur - 0.08; // legato overlap
    });

    const timer = setTimeout(onEnd, 18500);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // ==============================
  // VOCAL / TANPURA — ~20 seconds
  // Sa-Pa-Sa' tanpura drone backdrop with an extended vocal aalap phrase
  // ==============================
  private playVocal(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.22, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const TOTAL_DUR = 19;

    // Continuous Tanpura drone (Sa, Pa, Sa') for full duration
    const droneFreqs = [130.81, 196.0, 261.63]; // C3, G3, C4
    droneFreqs.forEach((freq, idx) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const level = 0.35 / (idx + 1);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(level, t + 1.0);
      g.gain.setValueAtTime(level, t + TOTAL_DUR - 1.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + TOTAL_DUR);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(t);
      osc.stop(t + TOTAL_DUR + 0.1);
      this.currentStopCallbacks.push(() => { try { osc.stop(); } catch (_) {} });
    });

    // Extended vocal aalap (Sa - Ri - Ga - Ma - Pa - Dha - Pa - Ma - Ga - Ri - Sa)
    const aalap = [
      { freq: 261.63, time: 1.0, dur: 2.0 },   // Sa
      { freq: 293.66, time: 2.8, dur: 1.5 },   // Ri
      { freq: 329.63, time: 4.1, dur: 2.0 },   // Ga
      { freq: 349.23, time: 5.9, dur: 1.5 },   // Ma
      { freq: 392.0, time: 7.2, dur: 2.5 },    // Pa (sustain)
      { freq: 440.0, time: 9.5, dur: 2.0 },    // Dha
      { freq: 392.0, time: 11.3, dur: 1.5 },   // Pa
      { freq: 349.23, time: 12.6, dur: 1.2 },  // Ma
      { freq: 329.63, time: 13.6, dur: 1.5 },  // Ga
      { freq: 293.66, time: 15.0, dur: 1.2 },  // Ri
      { freq: 261.63, time: 16.0, dur: 3.0 },  // Sa (final)
    ];

    aalap.forEach(({ freq, time, dur }) => {
      const t = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const formant = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Voice formant "Aaa"
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(800, t);
      formant.Q.setValueAtTime(3.0, t);

      // Smooth vocal glide
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.65, t + 0.2);
      g.gain.setValueAtTime(0.65, t + dur - 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      // Gentle vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, t);
      lfoGain.gain.setValueAtTime(3.5, t);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(t);
      lfo.stop(t + dur);

      osc.connect(formant);
      formant.connect(g);
      g.connect(masterGain);
      osc.start(t);
      osc.stop(t + dur);

      this.currentStopCallbacks.push(() => { try { lfo.stop(); osc.stop(); } catch (_) {} });
    });

    const timer = setTimeout(onEnd, 20000);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // ==============================
  // THEORY OF MUSIC — ~16 seconds
  // Structured academic demonstration: scales → intervals → 4-part chorale cadences
  // ==============================
  private playTheory(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Section 1: C Major ascending scale (0s-4s)
    const scale = [
      { freq: 261.63, time: 0.0 },   // C4
      { freq: 293.66, time: 0.5 },   // D4
      { freq: 329.63, time: 1.0 },   // E4
      { freq: 349.23, time: 1.5 },   // F4
      { freq: 392.0, time: 2.0 },    // G4
      { freq: 440.0, time: 2.5 },    // A4
      { freq: 493.88, time: 3.0 },   // B4
      { freq: 523.25, time: 3.5 },   // C5
    ];

    scale.forEach(({ freq, time }) => {
      this.scheduleNote(ctx, masterGain, {
        type: 'triangle', freq,
        startTime: ctx.currentTime + time, dur: 0.6,
        attack: 0.02, decay: 0.1, sustain: 0.4,
      });
    });

    // Section 2: Intervals demonstration (4.5s-8s)
    const intervals = [
      // Perfect 5th
      { freqs: [261.63, 392.0], time: 4.5, dur: 1.0 },
      // Major 3rd
      { freqs: [261.63, 329.63], time: 5.7, dur: 1.0 },
      // Perfect Octave
      { freqs: [261.63, 523.25], time: 6.9, dur: 1.2 },
    ];

    intervals.forEach(({ freqs, time, dur }) => {
      freqs.forEach(freq => {
        this.scheduleNote(ctx, masterGain, {
          type: 'triangle', freq,
          startTime: ctx.currentTime + time, dur,
          attack: 0.03, decay: 0.15, sustain: 0.5,
        });
      });
    });

    // Section 3: 4-Part Chorale Chord Progression I-IV-V7-vi-ii-V-I (8.5s-16s)
    const chords = [
      { time: 8.5, freqs: [261.63, 329.63, 392.0, 523.25], dur: 1.2 },   // I  (C)
      { time: 9.7, freqs: [261.63, 349.23, 440.0, 523.25], dur: 1.2 },   // IV (F)
      { time: 10.9, freqs: [246.94, 293.66, 392.0, 493.88], dur: 1.0 },  // V7 (G7)
      { time: 11.9, freqs: [220.0, 261.63, 329.63, 440.0], dur: 1.2 },   // vi (Am)
      { time: 13.1, freqs: [293.66, 349.23, 440.0, 587.33], dur: 1.0 },  // ii (Dm)
      { time: 14.1, freqs: [246.94, 293.66, 392.0, 493.88], dur: 1.0 },  // V  (G)
      { time: 15.1, freqs: [261.63, 329.63, 392.0, 523.25], dur: 2.0 },  // I  (C, final)
    ];

    chords.forEach(({ time, freqs, dur }) => {
      freqs.forEach(freq => {
        this.scheduleNote(ctx, masterGain, {
          type: 'triangle', freq,
          startTime: ctx.currentTime + time, dur,
          attack: 0.06, decay: 0.2, sustain: 0.55,
        });
      });
    });

    const timer = setTimeout(onEnd, 17200);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // ==============================
  // PUBLIC API
  // ==============================
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
        case 'theory':
        case 'theory-of-music':
          this.playTheory(ctx, handleEnd);
          return true;
        case 'bharatham':
          // Bharatham is dance — no audio, handled by video instead
          if (onEnd) onEnd();
          return false;
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

  /** Returns true if this slug supports audio playback (not Bharatham) */
  public hasAudio(slug: string): boolean {
    return slug.toLowerCase() !== 'bharatham';
  }
}

export const instrumentAudio = new SoundEngine();
