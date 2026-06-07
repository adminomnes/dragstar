// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default <Config>{
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'deep-black': '#000000',
        'metallic-gold': '#D4AF37',
        'neon-fuchsia': '#FF1493',
        'electric-purple': '#7B2CBF',
        'bright-white': '#FFFFFF',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'sans-serif'],
        brush: ['"Pacifico"', 'cursive'],
      },
      animation: {
        'pulse-fade': 'pulseFade 3s infinite',
      },
      keyframes: {
        pulseFade: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};
