import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── GMT Brand Palette ───────────────────────────────────────────
        // Primary: Black + White + GMT Yellow
        // GMT Yellow #F5C800 replaces #10B981 as brand accent
        bg:              "#F5F5F5",   // light grey page background (brand "off-white")
        surface:         "#FFFFFF",   // card / panel surface
        "surface-muted": "#F0F0F0",   // muted surface (inputs, subtle bg)
        border:          "#E0E0E0",   // borders
        "text-primary":  "#1A1A1A",   // near-black body text
        "text-secondary":"#666666",   // secondary text
        "text-tertiary": "#999999",   // placeholder / tertiary
        brand: {
          DEFAULT: "#F5C800",         // GMT Yellow — primary action
          light:   "#FFF9CC",         // yellow 10% tint (hover states, highlights)
          dark:    "#D4A900",         // yellow dark (pressed states)
        },
        danger: {
          DEFAULT: "#D93025",
          light:   "#FDECEA",
        },
        warning: {
          DEFAULT: "#F5C800",         // warning = brand yellow
          light:   "#FFF9CC",
        },
        success: {
          DEFAULT: "#1E7E34",         // dark green (positive delta)
          light:   "#E8F5E9",
        },
        sidebar: {
          bg:          "#000000",     // GMT black sidebar
          text:        "#999999",     // muted nav labels
          "text-muted":"#666666",
          active:      "#F5C800",     // GMT yellow active item
          "active-bg": "#F5C80018",   // yellow 10% tint
          border:      "#222222",     // subtle sidebar border
        },
      },
      fontFamily: {
        sans: ["DM Sans", "TP Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        md: "4px",   // tighter radius — brand is more geometric
        lg: "6px",
        xl: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
