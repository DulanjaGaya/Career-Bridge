/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#26408a',
        accent: '#FF8C00',
        'dark-blue': '#21375f',
      }
    },
  },
  plugins: [],
}
