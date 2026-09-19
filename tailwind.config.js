/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#090B10',
          card: '#121620',
          border: '#1F293D',
          accent: '#FF3366', // Zero Two crimson
          cyan: '#00F0FF',
          yellow: '#FFE600',
          muted: '#8B9BB4'
        },
        retro: {
          bg: '#F6F7F9',
          card: '#FFFFFF',
          border: '#E2E8F0',
          accent: '#E11D48',
          cyan: '#0284C7',
          muted: '#64748B'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
