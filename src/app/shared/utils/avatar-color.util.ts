export function hueFor(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return Math.abs(h);
}

export function avatarColors(
  seed: string,
  dark: boolean,
): { bg: string; fg: string; ring: string } {
  const hue = hueFor(seed);
  return dark
    ? {
        bg: `oklch(0.34 0.06 ${hue})`,
        fg: `oklch(0.86 0.10 ${hue})`,
        ring: `oklch(0.42 0.08 ${hue})`,
      }
    : {
        bg: `oklch(0.93 0.055 ${hue})`,
        fg: `oklch(0.46 0.14 ${hue})`,
        ring: `oklch(0.88 0.07 ${hue})`,
      };
}
