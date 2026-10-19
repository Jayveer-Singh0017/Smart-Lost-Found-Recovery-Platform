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
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6D5EF7',
          600: '#5B4CE6',
          700: '#4D3ED6',
          800: '#3D31B0',
          900: '#312E81',
          950: '#1E1B4B',
        },
        dark: {
          bg: '#0B1020',
          surface: '#121A2B',
          card: '#182338',
          border: '#2B3850',
          hover: '#1F2C45',
        },
        cyan: {
          DEFAULT: '#2DD4BF',
          hover: '#14B8A6',
          subtle: 'rgba(45, 212, 191, 0.12)',
        },
        navy: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.2), 0 1px 2px 0 rgba(0, 0, 0, 0.1)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
        'premium': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
        'glow-indigo': '0 0 25px rgba(109, 94, 247, 0.25)',
        'glow-cyan': '0 0 20px rgba(45, 212, 191, 0.2)',
      }
    },
  },
  plugins: [],
}
