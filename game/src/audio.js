// Spot the Difference — synthesized sound effects.
// Every sound is built with the Web Audio API at play time; the game ships
// no audio files. Audio starts only after a user gesture (browser policy).
let audioCtx = null;
let muted = false;

function ensureContext() {
  if (!audioCtx) {
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    } catch (err) {
      return null;
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
  return audioCtx;
}

function tone(freq, startAt, dur, type, vol) {
  const ctx = ensureContext();
  if (!ctx || muted) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime + startAt);
  gain.gain.exponentialRampToValueAtTime(vol, ctx.currentTime + startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startAt + dur);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(ctx.currentTime + startAt);
  osc.stop(ctx.currentTime + startAt + dur + 0.05);
}

// A bright two-note chime when a difference is found.
export function playFound() {
  tone(880, 0, 0.16, 'sine', 0.22);
  tone(1318, 0.09, 0.24, 'sine', 0.2);
}

// A soft low buzz for a wrong click.
export function playWrong() {
  tone(160, 0, 0.18, 'sawtooth', 0.1);
  tone(120, 0.05, 0.2, 'sawtooth', 0.08);
}

// A gentle pluck when a hint is spent.
export function playHint() {
  tone(660, 0, 0.2, 'triangle', 0.16);
  tone(990, 0.08, 0.22, 'triangle', 0.14);
}

// A rising fanfare when a scene is cleared.
export function playClear() {
  [523, 659, 784, 1047].forEach((freq, i) => tone(freq, i * 0.11, 0.26, 'triangle', 0.2));
}

// A descending sigh when time runs out.
export function playTimeout() {
  [392, 330, 262].forEach((freq, i) => tone(freq, i * 0.16, 0.3, 'sine', 0.16));
}

// A short click for buttons and menu moves.
export function playClick() {
  tone(520, 0, 0.07, 'square', 0.07);
}

export function setMuted(value) {
  muted = value;
}
export function isMuted() {
  return muted;
}
// Unlock the audio context from a real user gesture.
export function unlockAudio() {
  ensureContext();
}
