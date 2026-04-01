/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: '#0A0F1C',       // Deepest navy/black for main background
          surface: '#121A2F',  // Slightly lighter navy for sections
          card: '#1E293B',     // Slate 800 for cards
          border: '#334155',   // Slate 700 for borders
          primary: '#F97316',  // Orange 500 for primary buttons/accents
          primaryHover: '#EA580C', // Orange 600
          text: '#F8FAFC',     // Slate 50 for main text
          muted: '#94A3B8',    // Slate 400 for secondary text
          blue: '#3B82F6',     // Secondary blue accent
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
