/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        medieval: {
          dark: '#0f172a',
          slate: '#1e293b',
          gold: '#d97706',
          goldLight: '#fbbf24',
          forest: '#15803d',
          forestLight: '#22c55e',
          ruby: '#dc2626',
          rubyLight: '#ef4444'
        }
      }
    },
  },
  plugins: [],
}
