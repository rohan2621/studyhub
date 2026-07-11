/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        navy:     '#0E2A4D',
        primary:  '#2F6FED',
        secondary:'#5B8DEF',
        sky:      '#38BDF8',
        amber:    '#F5B843',
        success:  '#10B981',
        error:    '#EF4444',
        warning:  '#F59E0B',
      },
      fontFamily: {
        heading: ['PlusJakartaSans_700Bold'],
        body:    ['Inter_400Regular'],
        mono:    ['JetBrainsMono_400Regular'],
      },
    },
  },
  plugins: [],
};
