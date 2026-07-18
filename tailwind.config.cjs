/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        marca: 'var(--sst-color-marca)',
        fondo: 'var(--sst-color-fondo)',
        superficie: 'var(--sst-color-superficie)',
      },
      fontFamily: {
        sans: ['var(--sst-fuente-sans)'],
        mono: ['var(--sst-fuente-mono)'],
      },
      borderRadius: {
        control: 'var(--sst-radio-control)',
        panel: 'var(--sst-radio-panel)',
      },
      boxShadow: {
        panel: 'var(--sst-sombra-panel)',
      },
    },
  },
  plugins: [],
};
