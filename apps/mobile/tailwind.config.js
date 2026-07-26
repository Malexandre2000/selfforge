/**
 * Mirrors packages/design-tokens/src/index.ts — kept in sync by hand since
 * NativeWind's Tailwind v3 config is a plain Node/CJS file and can't import
 * the TS source directly (see apps/web/src/app/globals.css for the web-side
 * mirror using Tailwind v4's native @theme instead).
 */
module.exports = {
  darkMode: "class",
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
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
        success: "#1F7A4D",
        error: "#B3261E",
      },
      borderRadius: {
        sm: "10px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};
