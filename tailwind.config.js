/** @type {import('tailwindcss').Config} */
const {
  colors,
  spacing,
  radius,
  shadow,
  gradients,
  fontFamily,
} = require('./src/styles/tailwind/tokens');

const brandJourneyGradient = `linear-gradient(120deg, ${gradients.brandJourney[0]} 0%, ${gradients.brandJourney[1]} 35%, ${gradients.brandJourney[2]} 73%, ${gradients.brandJourney[3]} 100%)`;
const brandWarmGradient = `linear-gradient(120deg, ${gradients.brandWarm[0]} 0%, ${gradients.brandWarm[1]} 100%)`;

module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      spacing,
      borderRadius: radius,
      boxShadow: shadow,
      backgroundImage: {
        'brand-journey': brandJourneyGradient,
        'brand-warm': brandWarmGradient,
      },

      fontFamily: {
        ...fontFamily, // Adicione sua nova fonte aqui
        poetsenone: ['PoetsenOne-Regular'], // O nome deve corresponder ao nome do arquivo da fonte
      },
    },
  },
  plugins: [],
};
