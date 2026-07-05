/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './App.js',
    './mobile/App.tsx',
    './mobile/src/**/*.{js,jsx,ts,tsx}',
  ],
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
        'on-sky': '#f4f7fe',
        'on-sky-muted': '#b8c0d0',
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
        card: '0px 6px 16px rgba(9, 15, 32, 0.08)',
        glow: '0px 8px 20px rgba(0, 102, 255, 0.25)',
        'glow-lg': '0px 10px 24px rgba(0, 102, 255, 0.32)',
        nav: '0px 6px 16px rgba(9, 15, 32, 0.08)',
      },
      padding: {
        screen: '24px',
      },
    },
  },
  plugins: [],
};
