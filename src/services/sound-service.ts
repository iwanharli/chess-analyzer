/**
 * Chess Sound Service using Web Audio API
 * Generates all sounds programmatically — no external audio files needed.
 */

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  // Resume if suspended (browser autoplay policy)
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.15,
  attackTime: number = 0.01,
  decayTime?: number
) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + attackTime);

  const decay = decayTime ?? duration * 0.7;
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export type SoundType = 'move' | 'capture' | 'check' | 'castle' | 'gameOver' | 'illegal';

let _enabled = true;

export const SoundService = {
  get enabled() {
    return _enabled;
  },

  setEnabled(val: boolean) {
    _enabled = val;
  },

  play(type: SoundType) {
    if (!_enabled) return;

    switch (type) {
      case 'move':
        // Quick woody click
        playTone(800, 0.08, 'triangle', 0.12, 0.005, 0.06);
        playTone(600, 0.05, 'square', 0.04, 0.005, 0.04);
        break;

      case 'capture':
        // Heavier thud
        playTone(300, 0.15, 'triangle', 0.18, 0.005, 0.1);
        playTone(150, 0.12, 'sine', 0.1, 0.005, 0.08);
        setTimeout(() => playTone(500, 0.06, 'square', 0.06, 0.005, 0.05), 30);
        break;

      case 'check':
        // Sharp alert double-beep
        playTone(880, 0.1, 'square', 0.1, 0.005, 0.08);
        setTimeout(() => playTone(1100, 0.12, 'square', 0.12, 0.005, 0.1), 120);
        break;

      case 'castle':
        // Double wooden click
        playTone(700, 0.08, 'triangle', 0.12, 0.005, 0.06);
        setTimeout(() => playTone(900, 0.08, 'triangle', 0.12, 0.005, 0.06), 100);
        break;

      case 'gameOver':
        // Dramatic descending chord
        playTone(523, 0.6, 'sine', 0.12, 0.02, 0.5);     // C5
        playTone(440, 0.6, 'sine', 0.1, 0.02, 0.5);       // A4
        playTone(349, 0.8, 'sine', 0.08, 0.02, 0.6);      // F4
        setTimeout(() => {
          playTone(262, 1.0, 'sine', 0.12, 0.05, 0.8);    // C4
          playTone(330, 1.0, 'sine', 0.08, 0.05, 0.8);    // E4
        }, 400);
        break;

      case 'illegal':
        // Buzzer
        playTone(200, 0.15, 'sawtooth', 0.08, 0.005, 0.12);
        break;
    }
  }
};
