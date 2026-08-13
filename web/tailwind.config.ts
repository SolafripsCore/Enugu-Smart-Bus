import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: { DEFAULT: "1.25rem", lg: "2rem" },
      screens: { "2xl": "1200px" },
    },
    extend: {
      colors: {
        navy: {
          50: "#eef1fb",
          100: "#d6ddf5",
          200: "#adbaeb",
          300: "#7f92dd",
          400: "#4f66c6",
          500: "#2f45a3",
          600: "#1f2b6c",
          700: "#182258",
          800: "#101844",
          900: "#0a1030",
          950: "#050919",
        },
        grass: {
          50: "#eefcf1",
          100: "#d6f7de",
          200: "#aeeec1",
          300: "#75df9b",
          400: "#3fcb72",
          500: "#1fb955",
          600: "#129443",
          700: "#0f7538",
          800: "#105c30",
          900: "#0e4c2a",
        },
        sand: "#f6f7fb",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-inter)", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(10,16,48,0.04), 0 12px 32px -12px rgba(10,16,48,0.18)",
        lift: "0 24px 60px -24px rgba(10,16,48,0.35)",
      },
      backgroundImage: {
        "grid-navy":
          "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        marquee: "marquee 40s linear infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
