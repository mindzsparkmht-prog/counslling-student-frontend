/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1a1f36',
          50: '#f0f1f8',
          100: '#d8daf0',
          200: '#b0b5e1',
          300: '#8890d2',
          400: '#606bc3',
          500: '#4050b4',
          600: '#2d3990',
          700: '#1a226c',
          800: '#0b1048',
          900: '#040824',
        },
        brand: {
          orange: '#ff6b35',
          navy: '#1a1f36',
        }
      },
      fontFamily: {
        sans: ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        mobile: '480px',
      }
    },
  },
  plugins: [],
}
