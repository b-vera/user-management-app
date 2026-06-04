/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        'brand-indigo': '#2C048C',
        'brand-crimson': '#EB1453',
        indigo: {
          50: '#F0EAFF',
          100: '#D9C8FF',
          500: '#5B21E8',
          700: '#2C048C',
          900: '#160047',
        },
        crimson: {
          400: '#F5537B',
          600: '#EB1453',
          800: '#A00038',
        },
        dark: {
          bg: '#0D0221',
          surface: '#1A0440',
          border: '#2C048C',
        },
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
          300: '#D1D5DB',
          600: '#52525B',
          700: '#3F3F46',
          800: '#27272A',
          900: '#18181B',
        },
      },
      borderRadius: {
        DEFAULT: '6px',
        lg: '10px',
        xl: '16px',
      },
    },
  },
  plugins: [],
};
