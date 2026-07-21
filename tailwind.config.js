/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html"],
  theme: {
    extend: {
      colors: {
        cream: '#FBF6EA',
        paper: '#FFFDF8',
        ink: '#1B241E',
        muted: '#5D6B60',
        brand: {
          50:  '#EFFAF3',
          100: '#DCF3E3',
          200: '#B3E5C6',
          300: '#86D6A8',
          400: '#4FBE83',
          500: '#249C61',
          600: '#178050',
          700: '#106242',
          800: '#0C4A33',
          900: '#082F22',
          950: '#051D15',
        },
        clay: {
          50:  '#FBEEE2',
          100: '#F6DDC3',
          400: '#E79A66',
          500: '#DD7F45',
          600: '#C0632F',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
