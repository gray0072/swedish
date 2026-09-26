import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

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
        'dala-rock': {
          '0%, 100%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(4deg)' },
        },
        // Entrances (SPEC §11.6: calm, ease-out). Run with `backwards` fill, never `both`: a
        // transform left on an element after it finishes would trap `position: fixed`
        // descendants (the fireworks canvas) inside it.
        // The end frames name no opacity, so they settle on the element's own (a matched pair
        // sits at 60%) instead of flashing to full and dropping back.
        'rise-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { transform: 'none' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { transform: 'none' },
        },
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '60%': { opacity: '1', transform: 'scale(1.12)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        // A value that just changed swells briefly — WalletBar's XP and coins.
        bump: {
          '0%, 100%': { transform: 'none' },
          '40%': { transform: 'scale(1.18)' },
        },
        // A medal lands on the achievement reveal: spun in from nothing, overshoots, settles.
        'medal-in': {
          '0%': { opacity: '0', transform: 'scale(0.2) rotate(-220deg)' },
          '55%': { opacity: '1', transform: 'scale(1.18) rotate(12deg)' },
          '75%': { transform: 'scale(0.94) rotate(-5deg)' },
          '100%': { opacity: '1', transform: 'none' },
        },
        // A coin thrown out of the result card on a perfect run; ResultPage sets --dx/--dy.
        'coin-fly': {
          '0%': { opacity: '0', transform: 'translate(0, 0) scale(0.6)' },
          '15%': { opacity: '1' },
          '100%': { opacity: '0', transform: 'translate(var(--dx), var(--dy)) scale(1) rotate(200deg)' },
        },
      },
      animation: {
        'aurora-sweep': 'aurora-sweep 1.2s ease-out',
        carve: 'carve 900ms ease-out',
        'dala-rock': 'dala-rock 1.6s ease-in-out infinite',
        'rise-in': 'rise-in 220ms ease-out backwards',
        'fade-in': 'fade-in 180ms ease-out backwards',
        'pop-in': 'pop-in 180ms ease-out backwards',
        'bounce-in': 'bounce-in 520ms cubic-bezier(0.2, 0.8, 0.3, 1.2) backwards',
        bump: 'bump 400ms ease-out',
        'coin-fly': 'coin-fly 1.1s ease-out forwards',
        'medal-in': 'medal-in 800ms cubic-bezier(0.2, 0.8, 0.3, 1.1) backwards',
      },
    },
  },
  plugins: [typography],
} satisfies Config;
