import { InstrumentType } from '../types/game';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private activeTimeouts: Set<number> = new Set();

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.72;

      // Gentle soft limiter/compressor so rapid chords never clip
      const compressor = this.ctx.createDynamicsCompressor();
      compressor.threshold.value = -12;
      compressor.knee.value = 18;
      compressor.ratio.value = 4;
      compressor.attack.value = 0.005;
      compressor.release.value = 0.15;

      this.masterGain.connect(compressor);
      compressor.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }

    return this.ctx;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : 0.72, this.ctx.currentTime, 0.02);
    }
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public clearScheduled(): void {
    this.activeTimeouts.forEach((id) => window.clearTimeout(id));
    this.activeTimeouts.clear();
  }

  public schedule(fn: () => void, delayMs: number): number {
    const id = window.setTimeout(() => {
      this.activeTimeouts.delete(id);
      fn();
    }, delayMs);
    this.activeTimeouts.add(id);
    return id;
  }

  public playNote(freq: number, instrument: InstrumentType = 'marimba', duration = 0.75): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    if (instrument === 'marimba') {
      this.playMarimbaNote(ctx, this.masterGain, freq, now, duration);
    } else {
      this.playPianoNote(ctx, this.masterGain, freq, now, duration);
    }
  }

  public playChord(
    freqs: number[],
    instrument: InstrumentType = 'piano',
    duration = 1.45
  ): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted || freqs.length === 0) return;

    const now = ctx.currentTime;
    // Balanced gain trim for multi-note polyphony so piano & marimba chords ring warmly
    const chordBus = ctx.createGain();
    chordBus.gain.value = Math.min(0.92, 1.45 / Math.sqrt(freqs.length));
    chordBus.connect(this.masterGain);

    freqs.forEach((freq, idx) => {
      const start = now + idx * 0.02; // gentle acoustic piano chord roll
      if (instrument === 'marimba') {
        this.playMarimbaNote(ctx, chordBus, freq, start, duration);
      } else {
        this.playPianoNote(ctx, chordBus, freq, start, duration);
      }
    });
  }

  private playMarimbaNote(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    duration: number
  ): void {
    // 1. Warm wooden fundamental
    const fundOsc = ctx.createOscillator();
    const fundGain = ctx.createGain();
    fundOsc.type = 'sine';
    fundOsc.frequency.setValueAtTime(freq, startTime);

    fundGain.gain.setValueAtTime(0.0001, startTime);
    fundGain.gain.linearRampToValueAtTime(0.55, startTime + 0.008);
    fundGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    fundOsc.connect(fundGain);
    fundGain.connect(dest);
    fundOsc.start(startTime);
    fundOsc.stop(startTime + duration + 0.05);

    // 2. Characteristic marimba 4th harmonic overtone (short percussive ring)
    const overOsc = ctx.createOscillator();
    const overGain = ctx.createGain();
    overOsc.type = 'sine';
    overOsc.frequency.setValueAtTime(freq * 4, startTime);

    overGain.gain.setValueAtTime(0.0001, startTime);
    overGain.gain.linearRampToValueAtTime(0.16, startTime + 0.004);
    overGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.085);

    overOsc.connect(overGain);
    overGain.connect(dest);
    overOsc.start(startTime);
    overOsc.stop(startTime + 0.12);

    // 3. Soft felt mallet strike transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(freq * 2.5, startTime);
    clickOsc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + 0.025);

    clickGain.gain.setValueAtTime(0.18, startTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.03);

    clickOsc.connect(clickGain);
    clickGain.connect(dest);
    clickOsc.start(startTime);
    clickOsc.stop(startTime + 0.04);
  }

  private playPianoNote(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    duration: number
  ): void {
    const totalDur = Math.max(duration, 1.35);

    // Warm resonant piano body lowpass filter that brightens on hammer strike then softens
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(freq * 12, 6400), startTime);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(freq * 2.0, 560),
      startTime + totalDur * 0.72
    );
    filter.Q.value = 0.85;

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0.0001, startTime);
    noteGain.gain.linearRampToValueAtTime(0.54, startTime + 0.005);
    noteGain.gain.exponentialRampToValueAtTime(0.24, startTime + 0.22);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + totalDur);

    filter.connect(noteGain);
    noteGain.connect(dest);

    // Felt hammer strike thump (gives authentic acoustic key attack)
    const hammerOsc = ctx.createOscillator();
    const hammerGain = ctx.createGain();
    hammerOsc.type = 'triangle';
    hammerOsc.frequency.setValueAtTime(Math.min(freq * 3.2, 1600), startTime);
    hammerOsc.frequency.exponentialRampToValueAtTime(Math.max(freq * 0.9, 140), startTime + 0.026);
    hammerGain.gain.setValueAtTime(0.0001, startTime);
    hammerGain.gain.linearRampToValueAtTime(0.24, startTime + 0.002);
    hammerGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.032);
    hammerOsc.connect(hammerGain);
    hammerGain.connect(dest);
    hammerOsc.start(startTime);
    hammerOsc.stop(startTime + 0.045);

    // Rich piano string harmonics with individual natural decay rates
    const partials: Array<{
      ratio: number;
      type: OscillatorType;
      amp: number;
      detune: number;
      decayFactor: number;
    }> = [
      { ratio: 1, type: 'triangle', amp: 0.62, detune: -1.8, decayFactor: 1.0 },
      { ratio: 1, type: 'sine', amp: 0.52, detune: 1.8, decayFactor: 1.0 },
      { ratio: 2, type: 'sine', amp: 0.34, detune: 0.6, decayFactor: 0.75 },
      { ratio: 3, type: 'sine', amp: 0.16, detune: -0.8, decayFactor: 0.52 },
      { ratio: 4, type: 'sine', amp: 0.07, detune: 0.4, decayFactor: 0.36 },
    ];

    partials.forEach((p) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const partialDur = Math.max(0.2, totalDur * p.decayFactor);

      osc.type = p.type;
      osc.frequency.setValueAtTime(freq * p.ratio, startTime);
      osc.detune.setValueAtTime(p.detune, startTime);

      g.gain.setValueAtTime(p.amp, startTime);
      g.gain.exponentialRampToValueAtTime(Math.max(0.001, p.amp * 0.05), startTime + partialDur);

      osc.connect(g);
      g.connect(filter);
      osc.start(startTime);
      osc.stop(startTime + totalDur + 0.05);
    });
  }

  public playTapPop(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.055);

    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playCorrectChime(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6 sparkle
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.075;
      this.playMarimbaNote(ctx, this.masterGain!, freq, t, 0.45);
    });
  }

  public playGentleOops(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(190, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(215, now + 0.28);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playVictoryFanfare(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const melody = [
      { freq: 523.25, offset: 0, dur: 0.3 },     // C5
      { freq: 659.25, offset: 0.11, dur: 0.3 },  // E5
      { freq: 783.99, offset: 0.22, dur: 0.3 },  // G5
      { freq: 1046.5, offset: 0.34, dur: 0.9 },  // C6
      { freq: 783.99, offset: 0.34, dur: 0.8 },  // Harmony G5
      { freq: 659.25, offset: 0.34, dur: 0.8 },  // Harmony E5
    ];

    melody.forEach((item) => {
      this.playMarimbaNote(ctx, this.masterGain!, item.freq, now + item.offset, item.dur);
      this.playPianoNote(ctx, this.masterGain!, item.freq, now + item.offset, item.dur);
    });
  }

  public playMagicWand(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const sparkles = [783.99, 987.77, 1174.66, 1318.51, 1567.98, 2093.0];
    sparkles.forEach((freq, idx) => {
      const t = now + idx * 0.045;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.18, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.38);
    });
  }

  public playOwlHoot(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const hoots = [
      { start: 0, freqStart: 520, freqEnd: 460, dur: 0.14 },
      { start: 0.18, freqStart: 580, freqEnd: 490, dur: 0.24 },
    ];
    hoots.forEach((h) => {
      const t = now + h.start;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(h.freqStart, t);
      osc.frequency.exponentialRampToValueAtTime(h.freqEnd, t + h.dur);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.24, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + h.dur);

      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + h.dur + 0.03);
    });
  }

  public playUnlockFanfare(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.065;
      this.playMarimbaNote(ctx, this.masterGain!, freq, t, 0.5);
    });
  }

  public playFlySparkle(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const notes = [659.25, 783.99, 987.77, 1174.66, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      const t = now + idx * 0.07;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.06, t + 0.16);

      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.11, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.27);
    });
  }

  public playCollapseThud(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    // Cartoon stumble slide + soft cushion bounce
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(85, now + 0.22);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.26, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.28);

    // Secondary soft bounce
    const bOsc = ctx.createOscillator();
    const bGain = ctx.createGain();
    bOsc.type = 'triangle';
    bOsc.frequency.setValueAtTime(140, now + 0.22);
    bOsc.frequency.exponentialRampToValueAtTime(95, now + 0.34);

    bGain.gain.setValueAtTime(0.001, now + 0.22);
    bGain.gain.linearRampToValueAtTime(0.14, now + 0.24);
    bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);

    bOsc.connect(bGain);
    bGain.connect(this.masterGain);
    bOsc.start(now + 0.22);
    bOsc.stop(now + 0.38);
  }

  public playRunnerJump(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(760, now + 0.19);

    g.gain.setValueAtTime(0.0001, now);
    g.gain.linearRampToValueAtTime(0.22, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.24);

    osc.connect(g);
    g.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playRunnerCheer(): void {
    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain || this.muted) return;

    const now = ctx.currentTime;
    const tones = [
      { f1: 523.25, f2: 659.25, delay: 0, dur: 0.12 },
      { f1: 659.25, f2: 880.0, delay: 0.11, dur: 0.18 },
    ];
    tones.forEach((t) => {
      const start = now + t.delay;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(t.f1, start);
      osc.frequency.exponentialRampToValueAtTime(t.f2, start + t.dur);

      g.gain.setValueAtTime(0.0001, start);
      g.gain.linearRampToValueAtTime(0.22, start + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, start + t.dur);

      osc.connect(g);
      g.connect(this.masterGain!);
      osc.start(start);
      osc.stop(start + t.dur + 0.03);
    });
  }
}

export const soundEngine = new SoundEngine();
