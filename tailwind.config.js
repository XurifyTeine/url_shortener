/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "brand-green-200": "#99A98F",
        "brand-green-300": "#C1D0B5",
        "brand-green-400": "#DAEACD",
        "brand-neon-green-100": "#B6F2CA",
        "brand-neon-green-200": "#9CD9B0",
        "brand-medium-green-100": "#A7BC96",
        "brand-grayish-green-100": "#BACAB0",
        "brand-grayish-green-200": "#99A88C",
        "brand-grayish-green-300": "#5B6453",
        "brand-dark-green-100": "#263A29",
        "brand-light-yellow-100": "#FFF8DE",
        "light-danger": "#ff3d3d",
      },
      keyframes: {
        "left-to-right": {
          "0%": { right: "0.5rem", opacity: "1" },
          "100%": { right: "-20rem", opacity: "0" },
        },
        "right-to-left": {
          "0%": { right: "-20rem", opacity: "0" },
          "100%": { right: "0.5rem", opacity: "1" },
        },
      },
      animation: {
        "slide-in": "right-to-left 0.6s ease",
        "slide-out": "left-to-right 0.6s ease",
      },
    },
  },
  plugins: [],
};
