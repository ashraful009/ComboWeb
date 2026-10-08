/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F0F8FF', // water-white/ice-white
        primary: {
          DEFAULT: '#2E9E5B', // fresh-green
          hover: '#26874B',
        },
        accent: '#7FD6E8', // aqua
        highlight: '#FFB84D', // warm
        surface: 'rgba(255, 255, 255, 0.7)', // glassmorphism base
      },
      fontFamily: {
        bn: ['"Hind Siliguri"', 'sans-serif'],
        en: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-hover': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'pill': '0 4px 14px 0 rgba(46, 158, 91, 0.39)',
        'pill-hover': '0 6px 20px rgba(46, 158, 91, 0.23)',
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      backdropBlur: {
        'md': '10px',
        'lg': '20px',
      }
    },
  },
  plugins: [],
}
