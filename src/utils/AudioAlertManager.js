// SentinelEye AI - Tactical Web Audio & Voice Alert Manager

class AudioAlertManager {
  constructor() {
    this.audioCtx = null;
    this.isMuted = false;
    this.sirenOsc1 = null;
    this.sirenOsc2 = null;
    this.sirenGain = null;
    this.isSirenActive = false;
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    if (muted && this.isSirenActive) {
      this.stopIntruderSiren();
    }
  }

  playClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn("Audio playClick error:", e);
    }
  }

  playTargetLock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, this.audioCtx.currentTime);
      osc.frequency.setValueAtTime(1800, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio playTargetLock error:", e);
    }
  }

  playAuthMatch() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc2.frequency.setValueAtTime(659.25, now + 0.1); // E5

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start(now);
      osc1.stop(now + 0.15);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.35);
    } catch (e) {
      console.warn("Audio playAuthMatch error:", e);
    }
  }

  startIntruderSiren() {
    if (this.isMuted || this.isSirenActive) return;
    this.initContext();
    if (!this.audioCtx) return;

    try {
      this.isSirenActive = true;
      const now = this.audioCtx.currentTime;
      this.sirenGain = this.audioCtx.createGain();
      this.sirenGain.gain.setValueAtTime(0.1, now);

      this.sirenOsc1 = this.audioCtx.createOscillator();
      this.sirenOsc1.type = 'sawtooth';
      
      // Frequency sweep siren effect (700Hz to 1400Hz)
      const lfo = this.audioCtx.createOscillator();
      lfo.frequency.value = 2.5; // 2.5 Hz siren cycle speed
      const lfoGain = this.audioCtx.createGain();
      lfoGain.gain.value = 400; // Sweep depth

      this.sirenOsc1.frequency.value = 900;
      lfo.connect(lfoGain);
      lfoGain.connect(this.sirenOsc1.frequency);

      this.sirenOsc1.connect(this.sirenGain);
      this.sirenGain.connect(this.audioCtx.destination);

      lfo.start(now);
      this.sirenOsc1.start(now);
    } catch (e) {
      console.warn("Audio startIntruderSiren error:", e);
    }
  }

  stopIntruderSiren() {
    if (!this.isSirenActive) return;
    try {
      if (this.sirenGain && this.audioCtx) {
        this.sirenGain.gain.linearRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
      }
      setTimeout(() => {
        if (this.sirenOsc1) {
          try { this.sirenOsc1.stop(); } catch(e){}
          this.sirenOsc1 = null;
        }
        this.isSirenActive = false;
      }, 120);
    } catch (e) {
      this.isSirenActive = false;
    }
  }

  speakVoiceAlert(text) {
    if (this.isMuted || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // Clear pending speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.9;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  }
}

export const audioAlerts = new AudioAlertManager();
