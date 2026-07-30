// Web Audio API Sound Synthesizer for Ludo Game

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private customCaptureSoundUrl: string | null = null;

  constructor() {
    // Lazy initialization on first user interaction
  }

  public setCustomCaptureSoundUrl(url: string | null) {
    this.customCaptureSoundUrl = url;
  }

  public getCustomCaptureSoundUrl(): string | null {
    return this.customCaptureSoundUrl;
  }

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Play dice rolling sound (rattling noise + thud)
   */
  public playDiceRoll() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Create rapid rattling clicks
    for (let i = 0; i < 7; i++) {
      const time = now + i * 0.035;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(300 + Math.random() * 400, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.025);

      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.025);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.025);
    }

    // Final dice land thud
    const landTime = now + 0.26;
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(180, landTime);
    thud.frequency.exponentialRampToValueAtTime(40, landTime + 0.08);

    thudGain.gain.setValueAtTime(0.25, landTime);
    thudGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.08);

    thud.connect(thudGain);
    thudGain.connect(ctx.destination);

    thud.start(landTime);
    thud.stop(landTime + 0.08);
  }

  /**
   * Play step hop sound when token moves to a tile
   * Pitch slightly rises with step index for satisfying feedback
   */
  public playStepHop(stepInTurn: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Base pitch around 320Hz, pitch increases with step count
    const baseFreq = 300 + Math.min(stepInTurn, 6) * 35;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, now + 0.03);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, now + 0.07);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    // Subtle wooden impact thud underneath
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'triangle';
    sub.frequency.setValueAtTime(140, now);
    sub.frequency.exponentialRampToValueAtTime(50, now + 0.05);

    subGain.gain.setValueAtTime(0.15, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    sub.connect(subGain);
    subGain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
    sub.start(now);
    sub.stop(now + 0.05);
  }

  /**
   * Sound played when token exits Yard (rolls a 6)
   */
  public playYardExit() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    
    // Upward chime slide
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(261.63, now); // C4
    osc.frequency.exponentialRampToValueAtTime(523.25, now + 0.12); // C5

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  /**
   * Capture hit impact sound (when capturing opponent's token)
   */
  public playCaptureHit() {
    if (this.isMuted) return;

    if (this.customCaptureSoundUrl) {
      try {
        const audio = new Audio(this.customCaptureSoundUrl);
        audio.volume = 0.9;
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('Failed playing custom capture audio, falling back to synth:', err);
            this.playCaptureHitSynth();
          });
        }
      } catch (e) {
        console.warn('Error initiating custom capture sound:', e);
        this.playCaptureHitSynth();
      }
    } else {
      this.playCaptureHitSynth();
    }
  }

  /**
   * Preview / Test capture sound effect regardless of mute state
   */
  public testCaptureSound() {
    if (this.customCaptureSoundUrl) {
      try {
        const audio = new Audio(this.customCaptureSoundUrl);
        audio.volume = 0.9;
        const p = audio.play();
        if (p !== undefined) {
          p.catch(() => this.playCaptureHitSynthForce());
        }
      } catch (_) {
        this.playCaptureHitSynthForce();
      }
    } else {
      this.playCaptureHitSynthForce();
    }
  }

  private playCaptureHitSynthForce() {
    const wasMuted = this.isMuted;
    this.isMuted = false;
    this.playCaptureHitSynth();
    this.isMuted = wasMuted;
  }

  private playCaptureHitSynth() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Heavy impact bass drop
    const bass = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bass.type = 'sawtooth';
    bass.frequency.setValueAtTime(220, now);
    bass.frequency.exponentialRampToValueAtTime(40, now + 0.2);

    bassGain.gain.setValueAtTime(0.35, now);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    // Crunch noise hit
    const crunch = ctx.createOscillator();
    const crunchGain = ctx.createGain();
    crunch.type = 'square';
    crunch.frequency.setValueAtTime(800, now);
    crunch.frequency.exponentialRampToValueAtTime(100, now + 0.1);

    crunchGain.gain.setValueAtTime(0.25, now);
    crunchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    bass.connect(bassGain);
    bassGain.connect(ctx.destination);

    crunch.connect(crunchGain);
    crunchGain.connect(ctx.destination);

    bass.start(now);
    bass.stop(now + 0.22);
    crunch.start(now);
    crunch.stop(now + 0.12);
  }

  /**
   * Sound played during token rewind (sent back to yard)
   */
  public playRewindStep() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Fast descending pitch laser chirp
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  /**
   * Sound played when token reaches Home Finish
   */
  public playHomeFinish() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const time = now + idx * 0.08;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.25, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 0.25);
    });
  }

  /**
   * Sound played when a player wins the game!
   */
  public playVictoryFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Triumphant fanfare motif: C4 - E4 - G4 - C5 - G4 - C5
    const notes = [
      { f: 523.25, d: 0.15 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.15 },
      { f: 1046.5, d: 0.35 },
      { f: 880.0, d: 0.15 },
      { f: 1046.5, d: 0.5 },
    ];

    let timeOffset = 0;
    notes.forEach((n) => {
      const startTime = now + timeOffset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, startTime);

      gain.gain.setValueAtTime(0.3, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + n.d);

      timeOffset += n.d * 0.85;
    });
  }

  /**
   * Sound played when turn passes due to no valid moves
   */
  public playNoMove() {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.15);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.15);
  }
}

export const soundFx = new SoundManager();
