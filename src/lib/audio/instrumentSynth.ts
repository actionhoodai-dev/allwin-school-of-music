// ============================================
// Web Audio API — Real-time Famous Musical Masterpieces Synthesizer
// Plays iconic, globally recognizable pieces for each discipline:
// 🎹 Piano: Beethoven's "Für Elise"
// 🎸 Guitar: "Romance de Amor" (Spanish Classical Guitar Anthem)
// 🎻 Violin: Vivaldi's "The Four Seasons — Spring"
// 🎤 Vocal: Classical Sacred Invocation "Vatapi Ganapatim" (Hamsadhwani Raga)
// 🎼 Theory: Beethoven's "Ode to Joy" (4-Part SATB Harmonized Chorale)
// NOTE: Bharatham is dance — has NO audio, handled exclusively via video.
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

  // Helper to schedule a note with full envelope
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

    noteGain.gain.setValueAtTime(0.0001, t);
    noteGain.gain.exponentialRampToValueAtTime(0.8, t + attack);
    noteGain.gain.exponentialRampToValueAtTime(sustain, t + decay);
    noteGain.gain.setValueAtTime(sustain, t + dur - 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    noteGain.connect(destination);

    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);

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

  // =========================================================================
  // 🎹 PIANO: Beethoven's "Für Elise" (WoO 59) — Iconic Theme & Left-Hand Arpeggios
  // =========================================================================
  private playPiano(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.32, ctx.currentTime);
    masterGain.connect(ctx.destination);

    // Tempo: ~130 bpm 16th note triplets
    const tempo = 0.22; // beat unit

    // Für Elise Opening Theme: E5-D#5-E5-D#5-E5-B4-D5-C5-A4
    const notes = [
      // Measure 1: Iconic hook
      { freq: 659.25, time: 0 * tempo, dur: 0.35 },    // E5
      { freq: 622.25, time: 1 * tempo, dur: 0.35 },    // D#5
      { freq: 659.25, time: 2 * tempo, dur: 0.35 },    // E5
      { freq: 622.25, time: 3 * tempo, dur: 0.35 },    // D#5
      { freq: 659.25, time: 4 * tempo, dur: 0.35 },    // E5
      { freq: 493.88, time: 5 * tempo, dur: 0.35 },    // B4
      { freq: 587.33, time: 6 * tempo, dur: 0.35 },    // D5
      { freq: 523.25, time: 7 * tempo, dur: 0.35 },    // C5
      { freq: 440.0,  time: 8 * tempo, dur: 0.8 },     // A4

      // Left hand accompaniment A minor: A2 - E3 - A3
      { freq: 110.0,  time: 8 * tempo, dur: 1.5 },     // A2
      { freq: 164.81, time: 9 * tempo, dur: 1.2 },     // E3
      { freq: 220.0,  time: 10 * tempo, dur: 1.2 },    // A3
      { freq: 261.63, time: 11 * tempo, dur: 0.4 },    // C4
      { freq: 329.63, time: 12 * tempo, dur: 0.4 },    // E4
      { freq: 440.0,  time: 13 * tempo, dur: 0.4 },    // A4
      { freq: 493.88, time: 14 * tempo, dur: 0.8 },    // B4

      // Left hand E major accompaniment: E2 - G#3 - E4
      { freq: 82.41,  time: 14 * tempo, dur: 1.5 },    // E2
      { freq: 207.65, time: 15 * tempo, dur: 1.2 },    // G#3
      { freq: 329.63, time: 16 * tempo, dur: 1.2 },    // E4
      { freq: 329.63, time: 17 * tempo, dur: 0.4 },    // E4
      { freq: 415.30, time: 18 * tempo, dur: 0.4 },    // G#4
      { freq: 493.88, time: 19 * tempo, dur: 0.4 },    // B4
      { freq: 523.25, time: 20 * tempo, dur: 0.8 },    // C5

      // Left hand A minor
      { freq: 110.0,  time: 20 * tempo, dur: 1.5 },    // A2
      { freq: 164.81, time: 21 * tempo, dur: 1.2 },    // E3
      { freq: 220.0,  time: 22 * tempo, dur: 1.2 },    // A3
      { freq: 329.63, time: 23 * tempo, dur: 0.4 },    // E4

      // Repetition of Hook (Measure 2)
      { freq: 659.25, time: 24 * tempo, dur: 0.35 },   // E5
      { freq: 622.25, time: 25 * tempo, dur: 0.35 },   // D#5
      { freq: 659.25, time: 26 * tempo, dur: 0.35 },   // E5
      { freq: 622.25, time: 27 * tempo, dur: 0.35 },   // D#5
      { freq: 659.25, time: 28 * tempo, dur: 0.35 },   // E5
      { freq: 493.88, time: 29 * tempo, dur: 0.35 },   // B4
      { freq: 587.33, time: 30 * tempo, dur: 0.35 },   // D5
      { freq: 523.25, time: 31 * tempo, dur: 0.35 },   // C5
      { freq: 440.0,  time: 32 * tempo, dur: 0.8 },    // A4

      // Left hand A minor resolution
      { freq: 110.0,  time: 32 * tempo, dur: 1.5 },    // A2
      { freq: 164.81, time: 33 * tempo, dur: 1.2 },    // E3
      { freq: 220.0,  time: 34 * tempo, dur: 1.2 },    // A3
      { freq: 261.63, time: 35 * tempo, dur: 0.4 },    // C4
      { freq: 329.63, time: 36 * tempo, dur: 0.4 },    // E4
      { freq: 440.0,  time: 37 * tempo, dur: 0.4 },    // A4
      { freq: 493.88, time: 38 * tempo, dur: 0.8 },    // B4

      // Second ending
      { freq: 329.63, time: 39 * tempo, dur: 0.4 },    // E4
      { freq: 523.25, time: 40 * tempo, dur: 0.4 },    // C5
      { freq: 493.88, time: 41 * tempo, dur: 0.4 },    // B4
      { freq: 440.0,  time: 42 * tempo, dur: 2.2 },    // A4 (Final resolved sustain)
      { freq: 110.0,  time: 42 * tempo, dur: 2.5 },    // A2
      { freq: 220.0,  time: 42.1 * tempo, dur: 2.5 },  // A3
    ];

    notes.forEach(({ freq, time, dur }) => {
      this.scheduleNote(ctx, masterGain, {
        type: 'triangle',
        freq,
        startTime: ctx.currentTime + time,
        dur,
        attack: 0.015,
        decay: 0.12,
        sustain: 0.25,
        harmonics: [
          { type: 'sine', freqMul: 2, gain: 0.18 },
          { type: 'sine', freqMul: 3, gain: 0.08 },
        ],
      });
    });

    const timer = setTimeout(onEnd, (42 * tempo + 3.0) * 1000);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // =========================================================================
  // 🎸 GUITAR: "Romance de Amor" (Spanish Classical Romance) — Most Famous Guitar Piece
  // =========================================================================
  private playGuitar(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const beat = 0.38; // 3/4 triplet pace

    // Romance melody (high notes) with bass accompaniment (E minor)
    const melody = [
      // Measure 1: B4 triplets + Bass E2
      { melody: 493.88, bass: 82.41, time: 0 * beat },
      { melody: 493.88, bass: null,  time: 1 * beat },
      { melody: 493.88, bass: null,  time: 2 * beat },

      // Measure 2: B4 - A4 - G4 + Bass E3
      { melody: 493.88, bass: 164.81, time: 3 * beat },
      { melody: 440.0,  bass: null,   time: 4 * beat },
      { melody: 392.0,  bass: null,   time: 5 * beat },

      // Measure 3: G4 - F#4 - E4 + Bass E2
      { melody: 392.0,  bass: 82.41,  time: 6 * beat },
      { melody: 369.99, bass: null,   time: 7 * beat },
      { melody: 329.63, bass: null,   time: 8 * beat },

      // Measure 4: E4 - G4 - B4 + Bass E3
      { melody: 329.63, bass: 164.81, time: 9 * beat },
      { melody: 392.0,  bass: null,   time: 10 * beat },
      { melody: 493.88, bass: null,   time: 11 * beat },

      // Measure 5: High E5 peak triplets + Bass E2
      { melody: 659.25, bass: 82.41,  time: 12 * beat },
      { melody: 659.25, bass: null,   time: 13 * beat },
      { melody: 659.25, bass: null,   time: 14 * beat },

      // Measure 6: E5 - D#5 - E5 + Bass E3
      { melody: 659.25, bass: 164.81, time: 15 * beat },
      { melody: 622.25, bass: null,   time: 16 * beat },
      { melody: 659.25, bass: null,   time: 17 * beat },

      // Measure 7: D5 - C5 - B4 + Bass A2 (A minor transition)
      { melody: 587.33, bass: 110.0,  time: 18 * beat },
      { melody: 523.25, bass: null,   time: 19 * beat },
      { melody: 493.88, bass: null,   time: 20 * beat },

      // Measure 8: B4 - A4 - G4 + Bass E2
      { melody: 493.88, bass: 82.41,  time: 21 * beat },
      { melody: 440.0,  bass: null,   time: 22 * beat },
      { melody: 392.0,  bass: null,   time: 23 * beat },

      // Measure 9: Final Em chord resolve
      { melody: 329.63, bass: 82.41,  time: 24 * beat, dur: 2.8 },
    ];

    melody.forEach(({ melody: mFreq, bass: bFreq, time, dur }) => {
      const t = ctx.currentTime + time;
      const noteDur = dur || (beat * 1.8);

      // Melody string (Nylon guitar pluck)
      this.scheduleNote(ctx, masterGain, {
        type: 'sawtooth',
        freq: mFreq,
        startTime: t,
        dur: noteDur,
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        filterType: 'lowpass',
        filterFreq: 3000,
        filterDecay: 350,
      });

      // Arpeggiated inner strings (G3 / B3)
      this.scheduleNote(ctx, masterGain, {
        type: 'sawtooth',
        freq: 392.0, // G4
        startTime: t + 0.12,
        dur: 0.6,
        attack: 0.01,
        decay: 0.08,
        sustain: 0.1,
        filterType: 'lowpass',
        filterFreq: 2200,
        filterDecay: 300,
      });

      // Bass note if present
      if (bFreq) {
        this.scheduleNote(ctx, masterGain, {
          type: 'sawtooth',
          freq: bFreq,
          startTime: t,
          dur: 1.8,
          attack: 0.02,
          decay: 0.2,
          sustain: 0.35,
          filterType: 'lowpass',
          filterFreq: 1200,
          filterDecay: 150,
        });
      }
    });

    const timer = setTimeout(onEnd, (25 * beat + 2.5) * 1000);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // =========================================================================
  // 🎻 VIOLIN: Vivaldi's "The Four Seasons — Spring (La Primavera)" — Baroque Masterpiece
  // =========================================================================
  private playViolin(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.28, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const b = 0.28; // upbeat tempo

    // Spring opening theme (E major): E5 - G#5 - G#5 - G#5 - F#5 - E5 - B4
    const melody = [
      // Phrase 1 (Joyful opening)
      { freq: 659.25, time: 0 * b, dur: 0.5 },    // E5
      { freq: 830.61, time: 2 * b, dur: 0.45 },   // G#5
      { freq: 830.61, time: 3 * b, dur: 0.45 },   // G#5
      { freq: 830.61, time: 4 * b, dur: 0.55 },   // G#5
      { freq: 739.99, time: 6 * b, dur: 0.25 },   // F#5
      { freq: 659.25, time: 7 * b, dur: 0.35 },   // E5
      { freq: 493.88, time: 8 * b, dur: 1.1 },    // B4 (sustain)

      // Repetition of motif
      { freq: 659.25, time: 12 * b, dur: 0.5 },   // E5
      { freq: 830.61, time: 14 * b, dur: 0.45 },  // G#5
      { freq: 830.61, time: 15 * b, dur: 0.45 },  // G#5
      { freq: 830.61, time: 16 * b, dur: 0.55 },  // G#5
      { freq: 739.99, time: 18 * b, dur: 0.25 },  // F#5
      { freq: 659.25, time: 19 * b, dur: 0.35 },  // E5
      { freq: 493.88, time: 20 * b, dur: 1.1 },   // B4

      // High climbing phrase (Climax)
      { freq: 987.77, time: 24 * b, dur: 0.45 },  // B5
      { freq: 987.77, time: 25 * b, dur: 0.45 },  // B5
      { freq: 987.77, time: 26 * b, dur: 0.55 },  // B5
      { freq: 880.0,  time: 28 * b, dur: 0.25 },  // A5
      { freq: 830.61, time: 29 * b, dur: 0.35 },  // G#5
      { freq: 739.99, time: 30 * b, dur: 1.0 },   // F#5

      // Final cadence resolve
      { freq: 830.61, time: 33 * b, dur: 0.3 },   // G#5
      { freq: 880.0,  time: 34 * b, dur: 0.3 },   // A5
      { freq: 830.61, time: 35 * b, dur: 0.3 },   // G#5
      { freq: 739.99, time: 36 * b, dur: 0.3 },   // F#5
      { freq: 659.25, time: 37 * b, dur: 2.2 },   // E5 (Final resonant resolution)
    ];

    melody.forEach(({ freq, time, dur }) => {
      this.scheduleNote(ctx, masterGain, {
        type: 'sawtooth',
        freq,
        startTime: ctx.currentTime + time,
        dur,
        attack: 0.08,
        decay: 0.15,
        sustain: 0.7,
        filterType: 'bandpass',
        filterFreq: freq * 1.6,
        vibratoRate: 5.8,
        vibratoDepth: 4.5,
      });
    });

    const timer = setTimeout(onEnd, (38 * b + 2.5) * 1000);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // =========================================================================
  // 🎤 VOCAL: Sacred Classical Invocation "Vatapi Ganapatim Bhajeham" (Hamsadhwani Raga)
  // Accompanied by authentic Tanpura drone (Sa-Pa-Sa')
  // =========================================================================
  private playVocal(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.24, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const TOTAL_DUR = 18;

    // Continuous Indian Tanpura Drone (Sa: C3, Pa: G3, Sa': C4)
    const droneFreqs = [130.81, 196.0, 261.63];
    droneFreqs.forEach((freq, idx) => {
      const t = ctx.currentTime;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      const level = 0.35 / (idx + 1);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(level, t + 0.8);
      g.gain.setValueAtTime(level, t + TOTAL_DUR - 1.5);
      g.gain.exponentialRampToValueAtTime(0.001, t + TOTAL_DUR);

      osc.connect(g);
      g.connect(masterGain);
      osc.start(t);
      osc.stop(t + TOTAL_DUR + 0.1);
      this.currentStopCallbacks.push(() => { try { osc.stop(); } catch (_) {} });
    });

    // "Vatapi Ganapatim Bhajeham" in Hamsadhwani (Sa: 261.63, Ri: 293.66, Ga: 329.63, Pa: 392.0, Ni: 493.88, Sa': 523.25)
    const aalap = [
      // "Va-ta-pi" (Sa - Ri - Ga - Pa)
      { freq: 261.63, time: 1.0, dur: 1.2 },  // Sa ("Va-")
      { freq: 293.66, time: 2.2, dur: 0.9 },  // Ri ("-ta-")
      { freq: 329.63, time: 3.1, dur: 1.4 },  // Ga ("-pi")

      // "Ga-na-pa-tim" (Ga - Ri - Sa - Ri - Ga)
      { freq: 392.0,  time: 4.8, dur: 1.5 },  // Pa ("Ga-")
      { freq: 329.63, time: 6.3, dur: 0.9 },  // Ga ("-na-")
      { freq: 293.66, time: 7.2, dur: 0.9 },  // Ri ("-pa-")
      { freq: 261.63, time: 8.1, dur: 1.6 },  // Sa ("-tim")

      // "Bha-je-ham" (Ri - Ga - Pa - Ni - Sa')
      { freq: 293.66, time: 10.0, dur: 0.9 }, // Ri ("Bha-")
      { freq: 329.63, time: 10.9, dur: 0.9 }, // Ga ("-je-")
      { freq: 392.0,  time: 11.8, dur: 1.2 }, // Pa
      { freq: 493.88, time: 13.0, dur: 1.2 }, // Ni
      { freq: 523.25, time: 14.2, dur: 3.0 }, // Sa' ("-ham", sustained high note)
    ];

    aalap.forEach(({ freq, time, dur }) => {
      const t = ctx.currentTime + time;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const formant = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      // Formant vowel resonance "Aaa / Ooo"
      formant.type = 'bandpass';
      formant.frequency.setValueAtTime(850, t);
      formant.Q.setValueAtTime(3.2, t);

      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.7, t + 0.18);
      g.gain.setValueAtTime(0.7, t + dur - 0.15);
      g.gain.exponentialRampToValueAtTime(0.001, t + dur);

      // Vocal Meend vibrato
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(5.2, t);
      lfoGain.gain.setValueAtTime(3.8, t);
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

    const timer = setTimeout(onEnd, 17800);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // =========================================================================
  // 🎼 THEORY OF MUSIC: Beethoven's "Ode to Joy" (4-Part SATB Harmonized Chorale)
  // Demonstrates key signatures, scale progression, and 4-voice polyphonic harmony
  // =========================================================================
  private playTheory(ctx: AudioContext, onEnd: () => void) {
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.24, ctx.currentTime);
    masterGain.connect(ctx.destination);

    const b = 0.48; // chorale beat

    // 4-Part SATB Chords for "Ode to Joy"
    const chorale = [
      // Measure 1: E - E - F - G
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 0 * b }, // E5 (C major)
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 1 * b }, // E5
      { freqs: [174.61, 261.63, 349.23, 698.46], time: 2 * b }, // F5 (F major)
      { freqs: [196.0,  293.66, 392.0,  783.99], time: 3 * b }, // G5 (G major)

      // Measure 2: G - F - E - D
      { freqs: [196.0,  293.66, 392.0,  783.99], time: 4 * b }, // G5
      { freqs: [174.61, 261.63, 349.23, 698.46], time: 5 * b }, // F5
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 6 * b }, // E5
      { freqs: [146.83, 293.66, 369.99, 587.33], time: 7 * b }, // D5 (G/D)

      // Measure 3: C - C - D - E
      { freqs: [130.81, 261.63, 329.63, 523.25], time: 8 * b }, // C5
      { freqs: [130.81, 261.63, 329.63, 523.25], time: 9 * b }, // C5
      { freqs: [146.83, 293.66, 369.99, 587.33], time: 10 * b }, // D5
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 11 * b }, // E5

      // Measure 4: E . D - D
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 12 * b, dur: 0.65 }, // E5
      { freqs: [146.83, 293.66, 392.0,  587.33], time: 13.5 * b, dur: 1.4 }, // D5 (Half note cadence)

      // Measure 5: E - E - F - G (Repeat phrase)
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 16 * b }, // E5
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 17 * b }, // E5
      { freqs: [174.61, 261.63, 349.23, 698.46], time: 18 * b }, // F5
      { freqs: [196.0,  293.66, 392.0,  783.99], time: 19 * b }, // G5

      // Measure 6: G - F - E - D
      { freqs: [196.0,  293.66, 392.0,  783.99], time: 20 * b }, // G5
      { freqs: [174.61, 261.63, 349.23, 698.46], time: 21 * b }, // F5
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 22 * b }, // E5
      { freqs: [146.83, 293.66, 369.99, 587.33], time: 23 * b }, // D5

      // Measure 7: C - C - D - E
      { freqs: [130.81, 261.63, 329.63, 523.25], time: 24 * b }, // C5
      { freqs: [130.81, 261.63, 329.63, 523.25], time: 25 * b }, // C5
      { freqs: [146.83, 293.66, 369.99, 587.33], time: 26 * b }, // D5
      { freqs: [130.81, 261.63, 329.63, 659.25], time: 27 * b }, // E5

      // Measure 8: D . C - C (Final cadence resolve)
      { freqs: [146.83, 293.66, 392.0,  587.33], time: 28 * b, dur: 0.65 }, // D5
      { freqs: [130.81, 261.63, 329.63, 523.25], time: 29.5 * b, dur: 2.4 }, // C5 (Resolved C major triad)
    ];

    chorale.forEach(({ freqs, time, dur }) => {
      const t = ctx.currentTime + time;
      const chordDur = dur || (b * 1.1);

      freqs.forEach((freq) => {
        this.scheduleNote(ctx, masterGain, {
          type: 'triangle',
          freq,
          startTime: t,
          dur: chordDur,
          attack: 0.04,
          decay: 0.15,
          sustain: 0.6,
          harmonics: [
            { type: 'sine', freqMul: 2, gain: 0.1 },
          ],
        });
      });
    });

    const timer = setTimeout(onEnd, (30 * b + 2.5) * 1000);
    this.currentStopCallbacks.push(() => clearTimeout(timer));
  }

  // =========================================================================
  // PUBLIC API
  // =========================================================================
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
          // Bharatham is classical dance — strictly NO audio
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

  /** Returns true if this slug supports audio playback (Bharatham is strictly excluded) */
  public hasAudio(slug: string): boolean {
    return slug.toLowerCase() !== 'bharatham';
  }
}

export const instrumentAudio = new SoundEngine();
