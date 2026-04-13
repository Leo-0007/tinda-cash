import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans:  ["var(--font-sans)",  "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia",   "serif"],
      },
      colors: {
        // ── Blues (primary gradient spectrum) ──
        blue: {
          900: "#0A1628",
          800: "#0F2042",
          700: "#133063",
          600: "#1A4B8C",
          500: "#2563EB",
          400: "#3B82F6",
          300: "#60A5FA",
          200: "#93C5FD",
          100: "#DBEAFE",
          50:  "#EFF6FF",
        },
        // ── Cyan accent (CTAs, success) ──
        cyan: {
          500: "#06D6C1",
          400: "#22D3EE",
          300: "#67E8F9",
          200: "#A5F3FC",
          muted: "rgba(6,214,193,0.12)",
        },
        // ── Surfaces ──
        surface: {
          DEFAULT: "#FFFFFF",
          alt:     "#F8FAFC",
          input:   "#F1F5F9",
          dark:    "#0A1628",
        },
        // ── Text ──
        ink: {
          DEFAULT: "#0F172A",
          2:       "#64748B",
          3:       "#94A3B8",
          4:       "#CBD5E1",
        },
        // ── Semantic status ──
        ok:   { DEFAULT: "#10B981", bg: "rgba(16,185,129,0.10)"  },
        warn: { DEFAULT: "#F59E0B", bg: "rgba(245,158,11,0.10)" },
        bad:  { DEFAULT: "#EF4444", bg: "rgba(239,68,68,0.10)"  },
      },

      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
        "4xl": "32px",
      },

      boxShadow: {
        cyan:      "0 4px 16px rgba(6,214,193,0.30)",
        "cyan-lg": "0 8px 32px rgba(6,214,193,0.35)",
        blue:      "0 4px 16px rgba(37,99,235,0.25)",
        "blue-lg": "0 12px 40px rgba(37,99,235,0.30)",
        card:      "0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.04)",
        "card-lg": "0 12px 40px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)",
        "card-xl": "0 20px 60px rgba(0,0,0,0.20)",
        glass:     "0 8px 32px rgba(0,0,0,0.12)",
        "inset-t": "inset 0 1px 0 rgba(255,255,255,0.08)",
      },

      backgroundImage: {
        "gradient-main":  "linear-gradient(160deg, #1A4B8C 0%, #0F2042 50%, #0A1628 100%)",
        "gradient-hero":  "linear-gradient(160deg, #2563EB 0%, #1A4B8C 40%, #0F2042 80%, #0A1628 100%)",
        "gradient-blue":  "linear-gradient(135deg, #1A4B8C 0%, #133063 100%)",
        "gradient-cyan":  "linear-gradient(135deg, #06D6C1 0%, #22D3EE 100%)",
        "gradient-btn":   "linear-gradient(135deg, #06D6C1 0%, #0ABEA9 50%, #22D3EE 100%)",
        "glow-cyan":      "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(6,214,193,0.12), transparent)",
        "glow-blue":      "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(37,99,235,0.15), transparent)",
      },

      keyframes: {
        fadeUp: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        slideRight: {
          from: { opacity: "0", transform: "translateX(-14px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.88)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        pulseCyan: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(6,214,193,0.4)" },
          "60%":      { boxShadow: "0 0 0 12px rgba(6,214,193,0)" },
        },
        spinSlow: { to: { transform: "rotate(360deg)" } },
        countUp: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
      },

      animation: {
        "fade-up":     "fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in":     "fadeIn 0.4s ease both",
        "slide-right": "slideRight 0.4s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in":    "scaleIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        shimmer:       "shimmer 2.2s linear infinite",
        float:         "floatY 4s ease-in-out infinite",
        "pulse-cyan":  "pulseCyan 2.5s ease infinite",
        "spin-slow":   "spinSlow 10s linear infinite",
        "count-up":    "countUp 0.35s ease both",
      },
    },
  },
  plugins: [],
};

export default config;
