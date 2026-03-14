import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lo-fi: {
          bg: "#1a1a1c",
          card: "#252528",
          muted: "#3d3d42",
          warm: "#e8d5c4",
          accent: "#c9a86c",
          river: "#2d3a4a",
          sos: "#8b2635",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      animation: {
        "breathe-in": "breatheIn 4s ease-in-out forwards",
        "breathe-hold": "breatheHold 7s ease-in-out forwards",
        "breathe-out": "breatheOut 8s ease-in-out forwards",
      },
      keyframes: {
        breatheIn: {
          "0%": { transform: "scale(0.85)", opacity: "0.7" },
          "100%": { transform: "scale(1.15)", opacity: "1" },
        },
        breatheHold: {
          "0%, 100%": { transform: "scale(1.15)", opacity: "1" },
        },
        breatheOut: {
          "0%": { transform: "scale(1.15)", opacity: "1" },
          "100%": { transform: "scale(0.85)", opacity: "0.7" },
        },
        riverFlow: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
