/**
 * STUDYAI PRO - QUANTUM PROCEDURAL AMBIENT SYNTHESIZER V2
 * Engineered with pure Web Audio API for a zero-bandwidth, endless cognitive flow.
 * Consists of real-time multi-oscillator chord pads, LFO sweepers, white-noise rain waves,
 * and randomized high-frequency crystal chimes.
 */

class ProceduralSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private noiseGain: GainNode | null = null;
  private padGains: GainNode[] = [];
  private padOscillators: OscillatorNode[] = [];
  private chimeTimer: any = null;
  private isRunning: boolean = false;
  private isMuted: boolean = false;
  private baseFrequency: number = 220; // A2 pitch (highly resonant 432Hz-aligned)

  // Pure mathematical scales for high-order focal concentration (Minor Pentatonic & Lydian)
  private scales = [
    [1.0, 1.2, 1.333, 1.5, 1.8], // Pentatonic Cozy roots
    [1.0, 1.125, 1.25, 1.414, 1.5, 1.875] // Cosmic Lydian Lift-off
  ];

  constructor() {}

  public start() {
    if (this.isRunning) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      this.isRunning = true;

      // Master audio pathway
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.45, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // 1. Cozy Soft Ocean/Rain Waves Generator
      this.initRainWaveSource();

      // 2. Continuous Sub-Ambient Celestial Pad Chords
      this.initCelestialPads();

      // 3. Staggered Cosmic Star Chimes Scheduler
      this.scheduleCelestialChimesToInfinity();

      console.log("🌌 Quantum Procedural Synth Engine engaged successfully at 432Hz.");
    } catch (e) {
      console.error("Failed to start procedural synthesis engine:", e);
    }
  }

  public stop() {
    this.isRunning = false;
    if (this.chimeTimer) {
      clearTimeout(this.chimeTimer);
      this.chimeTimer = null;
    }

    // Terminate and clean up all oscillators
    this.padOscillators.forEach((osc) => {
      try { osc.stop(); } catch (e) {}
    });
    this.padOscillators = [];
    this.padGains = [];

    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
    console.log("🌌 Quantum Procedural Synth Engine disengaged safely.");
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(vol, this.ctx.currentTime);
    }
  }

  public toggleMute(muted: boolean) {
    this.isMuted = muted;
    this.setVolume(muted ? 0 : 0.45);
  }

  /**
   * Safe pink noise simulation for retro rain acoustic backdrop
   */
  private initRainWaveSource() {
    if (!this.ctx || !this.masterGain) return;

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Filter algorithm for soothing brownian/pink noise waves
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut * 0.985 + white * 0.015);
      lastOut = output[i];
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Filter for underwater feel
    const waveFilter = this.ctx.createBiquadFilter();
    waveFilter.type = "lowpass";
    waveFilter.frequency.setValueAtTime(750, this.ctx.currentTime);

    this.noiseGain = this.ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // Soft background whisper

    noiseSource.connect(waveFilter);
    waveFilter.connect(this.noiseGain);
    this.noiseGain.connect(this.masterGain);

    noiseSource.start();

    // LFO modulation to simulate ocean waves rolling in and out
    const waveLfo = this.ctx.createOscillator();
    waveLfo.type = "sine";
    waveLfo.frequency.setValueAtTime(0.08, this.ctx.currentTime); // 12-second wavelength

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

    waveLfo.connect(lfoGain);
    lfoGain.connect(this.noiseGain.gain);
    waveLfo.start();
  }

  /**
   * Warm, slow-cycling tri-tone ambient pads aligned to golden ratios
   */
  private initCelestialPads() {
    if (!this.ctx || !this.masterGain) return;

    // Golden intervals for study concentration: Root, Fifth, Minor Seventh, Ninth, Eleven
    const intervals = [1.0, 1.5, 1.78, 2.25, 2.666];

    intervals.forEach((ratio, idx) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = "sine";
      const pitch = this.baseFrequency * ratio;
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);

      // Individual lowpass filters to cut out digital fizz and keep it analog-warm
      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(450, this.ctx.currentTime);

      gain.gain.setValueAtTime(0, this.ctx.currentTime);

      // Connect components
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start();

      // Store references for disassembly
      this.padOscillators.push(osc);
      this.padGains.push(gain);

      // Modulate the pad volume slowly to produce a complex, evolving harmonic cloud
      this.modulatePadVolume(gain, idx);
    });
  }

  private modulatePadVolume(gainNode: GainNode, index: number) {
    if (!this.ctx || !this.isRunning) return;

    const baseVal = 0.04 + index * 0.01;
    const now = this.ctx.currentTime;
    const duration = 6 + index * 2.5; // Staggered periods for polyrhythmic waves

    gainNode.gain.linearRampToValueAtTime(baseVal, now + duration / 2);
    gainNode.gain.linearRampToValueAtTime(0.01, now + duration);

    // Recursive trigger that lives forever
    setTimeout(() => {
      if (this.isRunning && gainNode && this.ctx) {
        this.modulatePadVolume(gainNode, index);
      }
    }, duration * 1000);
  }

  /**
   * Randomized shooting-star crystalline bells to fuel dopamine
   */
  private scheduleCelestialChimesToInfinity() {
    if (!this.isRunning) return;

    // Random timeframe between 5 and 10 seconds per starry bell
    const nextTick = 4000 + Math.random() * 6000;

    this.chimeTimer = setTimeout(() => {
      if (!this.isRunning) return;
      this.playSingleChime();
      this.scheduleCelestialChimesToInfinity();
    }, nextTick);
  }

  private playSingleChime() {
    if (!this.ctx || !this.masterGain) return;

    const activeScale = this.scales[Math.floor(Math.random() * this.scales.length)];
    const randomRatio = activeScale[Math.floor(Math.random() * activeScale.length)];
    
    // Play bells high on registers for dreamy clarity (A4 to A6 range)
    const multiplier = [4, 8, 12][Math.floor(Math.random() * 3)];
    const freq = this.baseFrequency * randomRatio * multiplier;

    const osc = this.ctx.createOscillator();
    const chimeGain = this.ctx.createGain();
    
    // Triangle wave has beautiful cozy woodwind/metal bell properties
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm highpass/lowpass filter to make it sound vintage and spacey
    const bellFilter = this.ctx.createBiquadFilter();
    bellFilter.type = "bandpass";
    bellFilter.frequency.setValueAtTime(freq, this.ctx.currentTime);
    bellFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    chimeGain.gain.setValueAtTime(0, this.ctx.currentTime);
    // Instant attack, ultra long release for starry feedback decay trail
    chimeGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 0.03);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.8);

    osc.connect(bellFilter);
    bellFilter.connect(chimeGain);
    chimeGain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 4.0);
  }
}

export const QuantumSynth = new ProceduralSynthEngine();
