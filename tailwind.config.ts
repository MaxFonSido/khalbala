import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#0E0B14",
        surface: "#211A2A",
        "surface-border": "#332940",
        "surface-btn": "#332940",
        gold: {
          DEFAULT: "#E8B74A",
          light: "#FAD888",
          dark: "#412402",
          dim: "#BA7517",
        },
        ember: "#D4574A",
        "ink-text": "#F2EDE4",
        muted: "#8A8290",
        "muted-dim": "#5F5E5A",
        accent: {
          green: "#639922",
          purple: "#a855f7",
        },
      },
      boxShadow: {
        card: "0 4px 16px rgba(0,0,0,0.35)",
        "card-glow": "0 3px 12px rgba(0,0,0,0.3), 0 0 0 1px rgba(232,183,74,0.25)",
      }
    },
  },
  plugins: [],
};
export default config;
