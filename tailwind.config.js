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
          bg: '#0E0D14',
          surface: '#15131F',
          border: '#252336',
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
  safelist: [
    // AvatarComponent dot
    'dark:ring-dark-surface',
    // BadgeComponent dynamic dark variants
    'dark:bg-indigo-500/20',
    'dark:text-indigo-200',
    'dark:border-indigo-500/40',
    'dark:bg-blue-500/20',
    'dark:text-blue-200',
    'dark:border-blue-500/40',
    'dark:bg-green-500/20',
    'dark:text-green-200',
    'dark:border-green-500/40',
    'dark:bg-neutral-500/20',
    'dark:text-neutral-300',
    'dark:border-neutral-500/40',
  ],
  plugins: [],
};
