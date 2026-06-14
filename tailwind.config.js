/** @type {import('tailwindcss').Config} */
// NOTE: these values mirror src/design/tokens.ts (JS source of truth for charts/three)
// and the CSS variables in src/index.css. Keep the three in sync.
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: '#F7F7F2',
          dim: '#EFEFE7',
          raised: '#FCFCF9',
        },
        ink: {
          DEFAULT: '#0B0F14',
          soft: '#262B31',
          mute: '#586068',
          faint: '#8B939B',
          line: '#E4E3DA',
        },
        brand: {
          DEFAULT: '#0D9488',
          dark: '#0A6E64',
          light: '#5FC9C0',
          wash: '#E3F0EE',
        },
        signal: '#B3261E',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Cambria', 'serif'],
        sans: ['"IBM Plex Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      letterSpacing: {
        eyebrow: '0.22em',
      },
      maxWidth: {
        prose: '68ch',
        wide: '88rem',
      },
      borderRadius: {
        card: '14px',
        pill: '999px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,15,20,0.04), 0 12px 32px -16px rgba(11,15,20,0.18)',
        float: '0 18px 50px -24px rgba(11,15,20,0.45)',
        inset: 'inset 0 0 0 1px rgba(11,15,20,0.06)',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.7' },
          '70%': { transform: 'scale(1.8)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.7s cubic-bezier(0.22,1,0.36,1) both',
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.22,1,0.36,1) infinite',
        marquee: 'marquee 38s linear infinite',
      },
    },
  },
  plugins: [],
};
