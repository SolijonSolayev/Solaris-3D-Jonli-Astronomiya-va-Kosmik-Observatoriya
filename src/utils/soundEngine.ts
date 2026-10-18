/**
 * Cosmic Sound Engine for Solaris 3D
 * Generates an ethereal, calming space ambient soundscape and cosmic sound effects
 * using the native Web Audio API (zero external assets, 100% reliable, zero latency).
 */

class CosmicSoundEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;

  // Master Gain Nodes
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // Ambient Drone Nodes
  private droneOscs: OscillatorNode[] = [];
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private noiseSource: AudioBufferSourceNode | null = null;

  // Chime timer
  private chimeTimer: ReturnType<typeof setInterval> | null = null;

  // State
  private _isMuted = true;
  private _ambientVolume = 0.4;
  private _sfxVolume = 0.5;
  private _preset: 'deep-space' | 'celestial' | 'stellar-wind' = 'celestial';

  constructor() {
    // Lazy initialize on first user gesture
  }

  private initContext() {
    if (this.ctx) return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    this.ctx = new AudioCtx();

    // Master bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this._isMuted ? 0 : 1, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // Ambient bus
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this._ambientVolume, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    // SFX bus
    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this._sfxVolume, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);

    this.isInitialized = true;
  }

  /**
   * Resume audio context on user interaction (resolves browser autoplay policy)
   */
  public async ensureContext(): Promise<boolean> {
    if (!this.ctx) {
      this.initContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return Boolean(this.ctx && this.ctx.state === 'running');
  }

  /**
   * Start cosmic generative ambient soundscape
   */
  public async startAmbient() {
    await this.ensureContext();
    if (!this.ctx || !this.ambientGain) return;

    this.stopAmbient();

    const now = this.ctx.currentTime;

    // 1. Resonant Low-Pass Filter
    this.filterNode = this.ctx.createBiquadFilter();
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(260, now);
    this.filterNode.Q.setValueAtTime(2.5, now);
    this.filterNode.connect(this.ambientGain);

    // 2. Slow breathing LFO for filter cutoff frequency modulation
    this.lfoOsc = this.ctx.createOscillator();
    this.lfoOsc.type = 'sine';
    this.lfoOsc.frequency.setValueAtTime(0.06, now); // 16 second cycle

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.setValueAtTime(140, now);

    this.lfoOsc.connect(this.lfoGain);
    this.lfoGain.connect(this.filterNode.frequency);
    this.lfoOsc.start(now);

    // 3. Multi-harmonic ethereal cosmic chords (A major 9th / suspended ethereal chord)
    // Frequencies: 55Hz (A1), 82.4Hz (E2), 110Hz (A2), 164.8Hz (E3), 220Hz (A3), 277.18Hz (C#4)
    const baseFreqs = [55.0, 82.4, 110.0, 164.8, 220.0, 277.2];
    this.droneOscs = [];

    baseFreqs.forEach((freq, idx) => {
      if (!this.ctx || !this.filterNode) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();

      // Mix of warm sine and soft triangle
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      // Slight detune for lush cosmic chorusing
      const detuneCents = (idx - 2.5) * 4.5;
      osc.frequency.setValueAtTime(freq, now);
      osc.detune.setValueAtTime(detuneCents, now);

      // Relative balance: deeper bass lower in level, mid harmonics soft
      const amp = idx === 0 ? 0.35 : idx <= 2 ? 0.22 : 0.12;
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(amp, now + 3.0); // smooth 3s fade in

      osc.connect(oscGain);
      oscGain.connect(this.filterNode);
      osc.start(now);
      this.droneOscs.push(osc);
    });

    // 4. Filtered Solar Wind Pink Noise Generator
    this.startSolarWindNoise();

    // 5. Periodic Celestial Bell/Chime Harmonics (every 4-8 seconds)
    this.startCelestialChimes();
  }

  /**
   * Generates very gentle, warm solar wind noise buffer
   */
  private startSolarWindNoise() {
    if (!this.ctx || !this.ambientGain) return;

    try {
      const bufferSize = this.ctx.sampleRate * 4; // 4 seconds loop
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = buffer;
      this.noiseSource.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      this.noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ambientGain);
      this.noiseSource.start();
    } catch {
      // Audio buffer creation safe fallback
    }
  }

  /**
   * Random ethereal bell chime tones floating in the cosmos
   */
  private startCelestialChimes() {
    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
    }

    const pentatonicFrequencies = [440.0, 528.0, 660.0, 792.0, 880.0, 1056.0, 1320.0];

    this.chimeTimer = setInterval(() => {
      if (this._isMuted || !this.ctx || !this.ambientGain) return;

      const freq = pentatonicFrequencies[Math.floor(Math.random() * pentatonicFrequencies.length)];
      this.playEtherealBell(freq, 0.08);
    }, 4500);
  }

  private playEtherealBell(freq: number, volume = 0.08) {
    if (!this.ctx || !this.ambientGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Soft celestial envelope: gentle attack, long 3.5s ringing decay
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

    osc.connect(gain);
    gain.connect(this.ambientGain);

    osc.start(now);
    osc.stop(now + 4.0);
  }

  /**
   * Stop ambient soundscape
   */
  public stopAmbient() {
    this.droneOscs.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.droneOscs = [];

    if (this.lfoOsc) {
      try {
        this.lfoOsc.stop();
        this.lfoOsc.disconnect();
      } catch {}
      this.lfoOsc = null;
    }

    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {}
      this.noiseSource = null;
    }

    if (this.chimeTimer) {
      clearInterval(this.chimeTimer);
      this.chimeTimer = null;
    }
  }

  // --- SOUND EFFECTS (SFX) ---

  /**
   * SFX: Station selected in 3D or list (soft resonant cosmic chime)
   */
  public playStationSelect() {
    if (this._isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.35); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(293.66, now); // D4

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.75);
    osc2.stop(now + 0.75);
  }

  /**
   * SFX: Custom Pin dropped on 3D globe (sonar cosmic ping)
   */
  public playPinDrop() {
    if (this._isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1046.5, now); // C6
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.45); // C5

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.85);
  }

  /**
   * SFX: Camera reset or space warp (gentle cosmic sweep)
   */
  public playCameraReset() {
    if (this._isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, now);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(1800, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(250, now + 0.7);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.8);
  }

  /**
   * SFX: UI button micro-tick (crisp, subtle)
   */
  public playClick() {
    if (this._isMuted || !this.ctx || !this.sfxGain) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // --- CONTROLS & GETTERS ---

  public toggleMute(): boolean {
    this._isMuted = !this._isMuted;
    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this._isMuted ? 0 : 1, now + 0.2);
    }
    if (!this._isMuted && this.droneOscs.length === 0) {
      this.startAmbient();
    }
    return this._isMuted;
  }

  public setMuted(muted: boolean) {
    if (this._isMuted === muted) return;
    this.toggleMute();
  }

  public setAmbientVolume(val: number) {
    this._ambientVolume = Math.max(0, Math.min(1, val));
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setValueAtTime(this._ambientVolume, this.ctx.currentTime);
    }
  }

  public setSfxVolume(val: number) {
    this._sfxVolume = Math.max(0, Math.min(1, val));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this._sfxVolume, this.ctx.currentTime);
    }
  }

  public get isMuted(): boolean {
    return this._isMuted;
  }

  public get ambientVolume(): number {
    return this._ambientVolume;
  }

  public get sfxVolume(): number {
    return this._sfxVolume;
  }
}

// Global Singleton Export
export const soundEngine = new CosmicSoundEngine();
