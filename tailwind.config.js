/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.html", "./js/*.js"],
  theme: {
    extend: {
      colors: {
        'heritage-red': '#4B0000',
        'heritage-gold': '#BFA14A',
        'heritage-cream': '#fff8f0',
        'heritage-light-gold': '#d4af37',
        'heritage-dark-gold': '#f9e6b1'
      },
      fontFamily: {
        'serif': ['Georgia', 'serif'],
        'number': ['EB Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
