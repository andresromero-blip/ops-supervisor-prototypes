import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FBFAF7",
        surface: "#FFFFFF",
        "surface-muted": "#F3F1EA",
        border: "#E5E1D6",
        "text-primary": "#1A1D1E",
        "text-secondary": "#6B6A63",
        "text-tertiary": "#A6A398",
        brand: {
          DEFAULT: "#2D5A4A",
          light: "#E3EDE8",
        },
        danger: {
          DEFAULT: "#C2462E",
          light: "#FBE9E5",
        },
        warning: {
          DEFAULT: "#B8860B",
          light: "#FBF1DC",
        },
        success: {
          DEFAULT: "#3D7A5C",
          light: "#E5F1EB",
        },
      },
      fontFamily: {
        serif: ["Fraunces", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        md: "8px",
        lg: "12px",
      },
    },
  },
  plugins: [],
};
export default config;
