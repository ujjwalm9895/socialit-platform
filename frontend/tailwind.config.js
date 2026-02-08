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
    },
  },
  plugins: [],
};
