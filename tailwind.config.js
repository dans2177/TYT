/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // or 'media'
  theme: {
    extend: {
      fontFamily: {
        handjet: ["Handjet", "sans-serif"],
        pixel: ['"Press Start 2P"', "cursive"],
      },
      colors: {
        retroPurple: "#4D4DFF",
        retroYellow: "#FFEB65",
        retroOrange: "#FFA94D",
        retroRed: "#FF6B6B",
        retroDark: "#1A1A1D",
      },
    },
  },
  plugins: [],
};