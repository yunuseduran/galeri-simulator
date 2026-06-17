// Basit yardımcı rastgelelik fonksiyonları (Math.random tabanlı)

export function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function randInt(min: number, max: number): number {
  return Math.floor(rand(min, max + 1));
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function pickWeighted<T>(arr: readonly T[], weightFn: (t: T) => number): T {
  const total = arr.reduce((s, t) => s + weightFn(t), 0);
  let r = Math.random() * total;
  for (const t of arr) {
    r -= weightFn(t);
    if (r <= 0) return t;
  }
  return arr[arr.length - 1];
}

export function chance(p: number): boolean {
  return Math.random() < p;
}

let idCounter = 0;
export function uid(prefix: string): string {
  idCounter++;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}_${Math.floor(Math.random() * 1e6).toString(36)}`;
}

/** Tutarı binliklere yuvarla */
export function roundMoney(n: number, step = 1000): number {
  return Math.round(n / step) * step;
}
