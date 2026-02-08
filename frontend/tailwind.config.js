/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0066B3",
          light: "#3385C4",
          dark: "#004C8A",
        },
        zensar: {
          blue: "#0066B3",
          dark: "#1A1A2E",
          surface: "#F5F7FA",
          muted: "#5A6178",
        },
      },
      animation: {
        "fade-in-up": "fadeInUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      boxShadow: {
        glow: "0 0 24px -4px rgba(0, 102, 179, 0.25)",
        "glow-lg": "0 0 40px -8px rgba(0, 102, 179, 0.3)",
      },
    },
  },
  plugins: [],
};
