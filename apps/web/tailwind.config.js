/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#f4f1de',
        'primary-text': '#3d405b',
        'primary-highlight': '#e07a5f',
        'primary-navy': '#3d405b',
        'primary-cream': '#f2cc8f',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        'slide-up': 'slide-up 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
};