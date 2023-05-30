/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        "brand-green-100": "#DDFFBB",
        "brand-green-200": "#99A98F",
        "brand-green-300": "#C1D0B5",
        "brand-neon-green-100": "#B6F2CA",
        "brand-neon-green-200": "#9CD9B0",
        "brand-medium-green-100": "#A7BC96",
        "brand-grayish-green-100": "#99A88C",
        "brand-dark-green-100": "#263A29",
        "brand-light-yellow-100": "#FFF8DE",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
