/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066ff',
          accent: '#1a75ff',
          light: '#eef2ff',
        },
        success: '#22C55E',
        warning: '#F97316',
        error: '#f44336',
        medical: {
          bg: 'transparent',
          card: '#ffffff',
          input: '#f4f7fe',
        },
        heading: '#090f20',
        body: '#7a8293',
        'on-sky': '#090f20',
        'on-sky-muted': '#5a6578',
      },
      borderRadius: {
        card: '28px',
        btn: '24px',
        pill: '50px',
      },
      fontFamily: {
        sans: ['Inter_400Regular', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Inter_700Bold', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['Tajawal_400Regular', 'Tajawal', 'sans-serif'],
        'arabic-heading': ['Tajawal_700Bold', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        card: '0px 10px 30px rgba(0, 102, 255, 0.06)',
        glow: '0px 8px 20px rgba(0, 102, 255, 0.25)',
        nav: '0px 10px 30px rgba(0, 102, 255, 0.06)',
      },
      padding: {
        screen: '24px',
      },
    },
  },
  plugins: [],
};
