/**
 * Single source of truth for SelfForge's visual language.
 * Consumed by apps/web (Tailwind preset) and apps/mobile (NativeWind config)
 * so both apps render from the same numbers, not just "similar" ones.
 *
 * Palette is a warm-neutral scale (never pure #000/#fff/#gray) —
 * black/white/gray as instructed, but with enough warmth to read as
 * crafted rather than default-Tailwind gray.
 */

export const color = {
  white: "#FFFFFF",
  black: "#0A0908",

  ink: {
    50: "#FAFAF9",
    100: "#F4F3F1",
    200: "#E7E5E2",
    300: "#D3D0CB",
    400: "#A8A29A",
    500: "#78746C",
    600: "#57534A",
    700: "#403D37",
    800: "#292724",
    900: "#171614",
    950: "#0A0908",
  },

  // Reserved for rare, functional-only use (destructive confirms, error
  // states) — never for decoration. The product stays grayscale.
  functional: {
    success: "#1F7A4D",
    error: "#B3261E",
  },
} as const;

export const font = {
  display: "Fraunces, ui-serif, Georgia, serif",
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
} as const;

export const type = {
  display: { size: 56, lineHeight: 60, tracking: -1.5, weight: 500 },
  h1: { size: 40, lineHeight: 46, tracking: -1, weight: 500 },
  h2: { size: 30, lineHeight: 36, tracking: -0.5, weight: 500 },
  h3: { size: 22, lineHeight: 28, tracking: -0.2, weight: 600 },
  body: { size: 16, lineHeight: 26, tracking: 0, weight: 400 },
  bodySm: { size: 14, lineHeight: 22, tracking: 0, weight: 400 },
  caption: { size: 12, lineHeight: 16, tracking: 0.2, weight: 500 },
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
} as const;

export const space = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
} as const;

export const motion = {
  easeOut: [0.16, 1, 0.3, 1],
  easeInOut: [0.65, 0, 0.35, 1],
  duration: {
    fast: 0.15,
    base: 0.3,
    slow: 0.6,
  },
} as const;

export const shadow = {
  card: "0 1px 2px rgba(10,9,8,0.04), 0 8px 24px rgba(10,9,8,0.06)",
  raised: "0 2px 4px rgba(10,9,8,0.06), 0 16px 40px rgba(10,9,8,0.10)",
} as const;
