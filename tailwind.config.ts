import type { Config } from "tailwindcss";

const withOpacity = (varName: string) => `rgb(var(${varName}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: withOpacity("--bg"),
        surface: withOpacity("--surface"),
        "surface-muted": withOpacity("--surface-muted"),
        border: withOpacity("--border"),
        "text-primary": withOpacity("--text-primary"),
        "text-secondary": withOpacity("--text-secondary"),
        "text-tertiary": withOpacity("--text-tertiary"),
        brand: {
          DEFAULT: withOpacity("--brand"),
          light: withOpacity("--brand-light"),
          dark: withOpacity("--brand-dark"),
        },
        accent: {
          DEFAULT: withOpacity("--accent"),
          light: withOpacity("--accent-light"),
        },
        danger: {
          DEFAULT: withOpacity("--danger"),
          light: withOpacity("--danger-light"),
        },
        warning: {
          DEFAULT: withOpacity("--warning"),
          light: withOpacity("--warning-light"),
        },
        success: {
          DEFAULT: withOpacity("--success"),
          light: withOpacity("--success-light"),
        },
        sidebar: {
          bg: withOpacity("--sidebar-bg"),
          text: withOpacity("--sidebar-text"),
          "text-muted": withOpacity("--sidebar-text-muted"),
          active: withOpacity("--sidebar-active"),
          "active-bg": withOpacity("--sidebar-active-bg"),
          border: withOpacity("--sidebar-border"),
        },
      },
      fontFamily: {
        sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
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
