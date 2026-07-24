/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#643518',
        secondary: '#EABE32',
        background: '#F5F2EB',
        card: '#DFD9C0',
        'neutral-dark': '#1E1B15',
        success: '#15803d',
        danger: '#dc2626',
      }
    },
  },
  plugins: [],
}
