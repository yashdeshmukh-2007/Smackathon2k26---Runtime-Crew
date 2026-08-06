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
        canvas: '#F5F3ED',
        forest: {
          DEFAULT: '#182B22',
          light: '#2C4035',
          hover: '#0F1E19',
        },
        badge: {
          bg: '#E3E8E3',
          text: '#4A5E53',
        },
        card: {
          DEFAULT: '#FFFFFF',
          border: '#E5E0D8',
        },
        muted: '#5C6660',
        subtext: '#7C8781',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}