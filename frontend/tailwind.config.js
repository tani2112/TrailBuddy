/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          950: '#0C1E14',
          900: '#14281D',
          850: '#173626',
          800: '#1B4332',
          700: '#2D6A4F',
          600: '#40916C',
          500: '#52B788',
          400: '#74C69D',
          300: '#95D5B2',
          200: '#B7E4C7',
          100: '#D8F3DC',
          50: '#EFF9F0',
        },
        cream: {
          50: '#FCFBF7',
          100: '#FBF9F4',
          200: '#F5F1E8',
          300: '#EFE7DA',
          400: '#E3D7C3',
        },
        earth: {
          800: '#4A2810',
          700: '#6B3E18',
          600: '#8C5320',
          500: '#B06E2E',
          100: '#F8EFE6',
        },
        sun: {
          500: '#D97706',
          400: '#F59E0B',
          100: '#FEF3C7',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.8' },
          '50%': { transform: 'scale(1.08)', opacity: '1' },
        },
        gentleFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        breathe: 'breathe 4s ease-in-out infinite',
        float: 'gentleFloat 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
