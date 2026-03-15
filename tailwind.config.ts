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
        // Twilight Serenity palette
        twilight: {
          bg: "#1A1B26",
          card: "#24283b",
          muted: "#565f89",
          text: "#C0CAF5",
          amber: "#F2C94C",
          violet: "#BB9AF7",
          riverStart: "#2AC3DE",
          riverEnd: "#7AA2F7",
          sos: "#8b2635",
        },
        // Backwards compat
        lofi: {
          bg: "#1A1B26",
          card: "#24283b",
          muted: "#565f89",
          warm: "#C0CAF5",
          accent: "#F2C94C",
          river: "#2d3a4a",
          sos: "#8b2635",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "var(--font-noto-sans-tc)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        soft: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        glow: "0 0 40px 12px rgba(242, 201, 76, 0.25)",
        "glow-violet": "0 0 40px 12px rgba(187, 154, 247, 0.25)",
      },
      animation: {
        "breathe-in": "breatheIn 4s ease-in-out forwards",
        "breathe-hold": "breatheHold 7s ease-in-out forwards",
        "breathe-out": "breatheOut 8s ease-in-out forwards",
        "river-wave": "riverWave 8s ease-in-out infinite",
        "river-wave-move": "riverWaveMove 12s linear infinite",
        "orb-breathe": "orbBreathe 3s ease-in-out infinite",
      },
      keyframes: {
        riverWaveMove: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
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
        riverWave: {
          "0%, 100%": { transform: "translateX(0) translateY(0) scaleY(1)" },
          "50%": { transform: "translateX(-10%) translateY(-2px) scaleY(1.02)" },
        },
        orbBreathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.9" },
          "50%": { transform: "scale(1.05)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
