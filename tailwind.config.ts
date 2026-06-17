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
        purple: {
          950: "#1a0a2e",
          900: "#2d1054",
          800: "#3d1570",
          700: "#4a1a8a",
          600: "#6d28d9",
          400: "#a855f7",
          300: "#c084fc",
          200: "#e9d5ff",
          100: "#f3e8ff",
          50:  "#faf5ff",
        },
        gold: {
          DEFAULT: "#d9a521",
          light: "#f3d88a",
          dark: "#a07010",
        }
      },
      boxShadow: {
        card: "0 2px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.06)",
        glow: "0 0 20px rgba(168, 85, 247, 0.3)",
      }
    },
  },
  plugins: [],
};
export default config;
