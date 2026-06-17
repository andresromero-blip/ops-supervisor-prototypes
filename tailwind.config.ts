import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#FFFFFF",
        surface: "#FFFFFF",
        "surface-muted": "#F9FAFB",
        border: "#E5E7EB",
        "text-primary": "#111827",
        "text-secondary": "#6B7280",
        "text-tertiary": "#9CA3AF",
        brand: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        danger: {
          DEFAULT: "#EF4444",
          light: "#FEE2E2",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#FEF3C7",
        },
        success: {
          DEFAULT: "#10B981",
          light: "#D1FAE5",
        },
        sidebar: {
          bg: "#1A1D23",
          text: "#8B8FA8",
          "text-muted": "#6B7280",
          active: "#10B981",
          "active-bg": "#10B98114",
          border: "#2D3148",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        md: "6px",
        lg: "8px",
      },
    },
  },
  plugins: [],
};
export default config;
