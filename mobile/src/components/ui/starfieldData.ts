/** Deterministic star positions for the night-sky background (Uiverse-style). */

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildBoxShadow(count: number, seed: number, extent = 2000): string {
  const rand = mulberry32(seed);
  const parts: string[] = [];
  for (let i = 0; i < count; i++) {
    const x = Math.floor(rand() * extent);
    const y = Math.floor(rand() * extent);
    parts.push(`${x}px ${y}px #fff`);
  }
  return parts.join(', ');
}

export interface StarDot {
  left: number;
  top: number;
  size: number;
  opacity: number;
}

function buildDots(count: number, seed: number, size: number, extent = 2000): StarDot[] {
  const rand = mulberry32(seed);
  const dots: StarDot[] = [];
  for (let i = 0; i < count; i++) {
    dots.push({
      left: rand() * extent,
      top: rand() * extent,
      size,
      opacity: 0.55 + rand() * 0.45,
    });
  }
  return dots;
}

/** Web: box-shadow star fields (mirrored for seamless scroll animation). */
export const STAR_SHADOWS = {
  small: buildBoxShadow(700, 11),
  medium: buildBoxShadow(200, 29),
  large: buildBoxShadow(100, 47),
} as const;

/** Native: lighter star set for performance. */
export const NATIVE_STARS: StarDot[] = [
  ...buildDots(48, 11, 1.5),
  ...buildDots(24, 29, 2),
  ...buildDots(12, 47, 3),
];
