/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Tajawal', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        stone: {
          50: '#faf8f5',
          100: '#f5f1ea',
          200: '#e8e0d2',
          300: '#d6c9b3',
          400: '#c4b5a0',
          500: '#a89878',
          600: '#8a7a5c',
          700: '#6b5d44',
          800: '#4a4030',
          900: '#2a2520',
          950: '#1a1612',
        },
        accent: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
      },
    },
  },
  plugins: [],
};
