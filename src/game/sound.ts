// WebAudio tabanlı sentez ses efektleri — dosya gerektirmez.

const MUTE_KEY = "galeri-sim-muted";
let muted = localStorage.getItem(MUTE_KEY) === "1";
let ctx: AudioContext | null = null;

export function isMuted(): boolean {
  return muted;
}

export function setMuted(m: boolean): void {
  muted = m;
  localStorage.setItem(MUTE_KEY, m ? "1" : "0");
}

function ac(): AudioContext | null {
  if (muted) return null;
  try {
    if (!ctx) ctx = new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

interface ToneOpts {
  freq: number;
  dur: number;
  type?: OscillatorType;
  gain?: number;
  when?: number; // saniye cinsinden gecikme
  slideTo?: number; // frekans kayması
}

function tone({ freq, dur, type = "sine", gain = 0.12, when = 0, slideTo }: ToneOpts): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(Math.max(30, slideTo), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise(dur: number, gain = 0.2, when = 0, lowpass = 1200): void {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + when;
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lowpass;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(f).connect(g).connect(c.destination);
  src.start(t0);
}

export const sfx = {
  /** Buton/teklif tıkı */
  click(): void {
    tone({ freq: 600, dur: 0.06, type: "square", gain: 0.05 });
  },
  /** Para kazanıldı (satış) */
  cash(): void {
    tone({ freq: 880, dur: 0.09, type: "triangle", gain: 0.14 });
    tone({ freq: 1175, dur: 0.09, type: "triangle", gain: 0.14, when: 0.08 });
    tone({ freq: 1568, dur: 0.16, type: "triangle", gain: 0.14, when: 0.16 });
  },
  /** Araç satın alındı */
  buy(): void {
    tone({ freq: 523, dur: 0.1, type: "triangle", gain: 0.12 });
    tone({ freq: 784, dur: 0.18, type: "triangle", gain: 0.12, when: 0.1 });
  },
  /** Hata / olumsuz */
  error(): void {
    tone({ freq: 220, dur: 0.18, type: "sawtooth", gain: 0.08 });
    tone({ freq: 165, dur: 0.25, type: "sawtooth", gain: 0.08, when: 0.12 });
  },
  /** Gün sonu çanı */
  dayEnd(): void {
    tone({ freq: 659, dur: 0.4, type: "sine", gain: 0.1 });
    tone({ freq: 494, dur: 0.5, type: "sine", gain: 0.08, when: 0.18 });
  },
  /** Uyarı (arıza vb.) */
  warning(): void {
    tone({ freq: 392, dur: 0.12, type: "square", gain: 0.06 });
    tone({ freq: 392, dur: 0.12, type: "square", gain: 0.06, when: 0.16 });
  },
  /** Test sürüşünde ipucu bulundu */
  hint(): void {
    tone({ freq: 1047, dur: 0.12, type: "sine", gain: 0.12 });
    tone({ freq: 1319, dur: 0.18, type: "sine", gain: 0.1, when: 0.1 });
  },
  /** Kaza */
  crash(): void {
    noise(0.5, 0.35, 0, 900);
    tone({ freq: 110, dur: 0.4, type: "sawtooth", gain: 0.15, slideTo: 40 });
  },
  /** Seyahat */
  travel(): void {
    tone({ freq: 200, dur: 0.5, type: "sawtooth", gain: 0.05, slideTo: 420 });
  },
  /** Mezat tokmağı */
  gavel(): void {
    noise(0.08, 0.25, 0, 2500);
    noise(0.08, 0.25, 0.14, 2500);
  },
  /** Mezatta teklif */
  bid(): void {
    tone({ freq: 740, dur: 0.07, type: "square", gain: 0.06 });
  },
  /** Atölye işi (anahtar sesi) */
  wrench(): void {
    noise(0.06, 0.12, 0, 4000);
    tone({ freq: 1200, dur: 0.05, type: "square", gain: 0.04, when: 0.05 });
  },
};

/** Test sürüşü için sürekli motor sesi */
export class EngineSound {
  private osc: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private gain: GainNode | null = null;

  start(): void {
    const c = ac();
    if (!c) return;
    this.osc = c.createOscillator();
    this.osc2 = c.createOscillator();
    this.gain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 500;
    this.osc.type = "sawtooth";
    this.osc2.type = "square";
    this.osc.frequency.value = 55;
    this.osc2.frequency.value = 28;
    this.gain.gain.value = 0.03;
    this.osc.connect(filter);
    this.osc2.connect(filter);
    filter.connect(this.gain).connect(c.destination);
    this.osc.start();
    this.osc2.start();
  }

  update(speedKmh: number, stuttering: boolean): void {
    if (!this.osc || !this.osc2 || !this.gain) return;
    const base = 50 + speedKmh * 1.4;
    const wobble = stuttering ? (Math.random() - 0.5) * 40 : 0;
    this.osc.frequency.value = base + wobble;
    this.osc2.frequency.value = base / 2 + wobble / 2;
    this.gain.gain.value = muted ? 0 : Math.min(0.07, 0.02 + speedKmh / 4000) * (stuttering ? 0.5 : 1);
  }

  stop(): void {
    try {
      this.osc?.stop();
      this.osc2?.stop();
    } catch {
      // zaten durmuş olabilir
    }
    this.osc = this.osc2 = this.gain = null;
  }
}
