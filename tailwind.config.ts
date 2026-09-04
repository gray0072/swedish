import type { Config } from 'tailwindcss';

// Palette and type scale from SPEC.md §11 (Visual identity — Swedish national style).
// Do not add ad-hoc colors elsewhere — everything routes through these tokens.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'blue-flag': '#006AA7',
        'yellow-flag': '#FECC00',
        falu: '#7C3228',
        birch: '#F6F2EA',
        midnight: '#0E2438',
        'midnight-surface': '#16324B',
        granite: '#4A5259',
        pine: '#2F4A3C',
        gold: '#C8A24A',
        lingon: '#C0392B',
        aurora: '#3FBF9F',
        'aurora-violet': '#7B6CD9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      keyframes: {
        'aurora-sweep': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '30%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-4px)' },
        },
        carve: {
          '0%': { strokeDashoffset: '1', fillOpacity: '0' },
          '70%': { strokeDashoffset: '0', fillOpacity: '0' },
          '100%': { strokeDashoffset: '0', fillOpacity: '1' },
        },
      },
      animation: {
        'aurora-sweep': 'aurora-sweep 1.2s ease-out',
        carve: 'carve 900ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
