/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: '#ff2d95',
          blue: '#00d4ff',
          purple: '#9d4edd'
        },
        tower: {
          dark: '#0a0a0f',
          mid: '#15151f',
          light: '#1f1f2e'
        }
      }
    }
  },
  plugins: []
}
