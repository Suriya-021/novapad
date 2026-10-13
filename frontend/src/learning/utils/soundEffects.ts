/**
 * Procedural paper turn sound effect generator using Web Audio API.
 * Requires 0 external audio assets and executes instantaneously.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function playPageFlipSound(enabled: boolean = true): void {
  if (!enabled) return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const duration = 0.14; // 140ms
    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Generate gentle pink-noise envelope simulating soft paper rubbing & leaf turn
    for (let i = 0; i < data.length; i++) {
      const progress = i / data.length;
      // Envelope: smooth attack, gentle decay
      const envelope = Math.sin(progress * Math.PI) * Math.exp(-progress * 2.5);
      const white = Math.random() * 2 - 1;
      data[i] = white * envelope;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Bandpass filter to sculpt rustling frequencies
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + duration);
    filter.Q.setValueAtTime(1.8, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    source.start();
    source.stop(ctx.currentTime + duration);
  } catch (err) {
    // Graceful fallback if audio is not permitted or unsupported
    console.debug('Page flip audio skipped:', err);
  }
}
