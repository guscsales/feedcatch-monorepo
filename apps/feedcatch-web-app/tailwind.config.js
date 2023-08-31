const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    `${__dirname}/{app,libs}/**/*!(*.stories|*.spec).{ts,tsx,html,css,svg,scss}`,
    ...createGlobPatternsForDependencies(__dirname),
  ],
  jit: true,
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '0.75rem',
      },
      screens: {
        DEFAULT: '100%',
        lg: '62.25rem',
      },
    },
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)'],
      },
      colors: {
        primary: '#18181b',
        secondary: '#e4e4e7',
        destructive: '#ef4444',
        'primary-foreground': '#fafafa',
        'secondary-foreground': '#27272a',
      },
    },
  },
  plugins: [],
};
