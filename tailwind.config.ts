import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── TP Brand Palette — Essential Guidelines 2026 ──────────────
        bg:              "#F5F5F5",   // neutral page bg
        surface:         "#FFFFFF",
        "surface-muted": "#F0F1F4",   // TP Pastel Sand-ish
        border:          "#E2E3E8",
        "text-primary":  "#1A1A2E",   // near Dark Slate for body
        "text-secondary":"#6B6C80",
        "text-tertiary": "#9A9BAD",

        // Primary structural: TP Dark Slate
        brand: {
          DEFAULT: "#4B4C6A",   // TP Dark Slate — base/structural
          light:   "#EEEEF4",   // Dark Slate 8% tint — hover bg
          dark:    "#35364E",   // Dark Slate pressed
        },

        // Accent: TP Pink — CTAs, active states, highlights
        accent: {
          DEFAULT: "#FF0082",   // TP Pink
          light:   "#FFF0F7",   // Pink 5% tint
          dark:    "#CC0068",   // Pink pressed
        },

        // Semantic
        danger: {
          DEFAULT: "#E53935",
          light:   "#FDECEA",
        },
        warning: {
          DEFAULT: "#F5A623",
          light:   "#FFF3E0",
        },
        success: {
          DEFAULT: "#1E7E34",
          light:   "#E8F5E9",
        },

        // Sidebar: TP Dark Slate as structural bg
        sidebar: {
          bg:           "#4B4C6A",   // TP Dark Slate
          text:         "#B8B9CC",
          "text-muted": "#8A8B9E",
          active:       "#FF0082",   // TP Pink active
          "active-bg":  "#FF008214", // Pink 8% tint
          border:       "#5A5B7A",
        },
      },
      fontFamily: {
        sans: ["DM Sans", "TP Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        md: "4px",
        lg: "6px",
        xl: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
