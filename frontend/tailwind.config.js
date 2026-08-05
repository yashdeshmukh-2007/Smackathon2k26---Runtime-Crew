/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Libre Caslon Text"', 'serif'],
        sans: ['"Hanken Grotesk"', 'sans-serif'],
      },
      colors: {
        // Custom theme colors matching your design system
        primary: {
          DEFAULT: '#1E293B',
          light: '#334155',
        },
        accent: {
          DEFAULT: '#0F766E',
          light: '#14B8A6',
        },
        background: '#F8FAFC',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}