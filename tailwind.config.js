/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          main: 'var(--bg-main)',
          surface: 'var(--bg-surface)',
          elevated: 'var(--bg-surface-elevated)',
          crimson: 'var(--color-red-primary)',
          dark: 'var(--color-red-dark)',
          hover: 'var(--color-red-hover)',
          bright: 'var(--color-red-bright)',
          glow: 'var(--color-red-glow)',
          border: 'var(--border-color)',
        },
      },
    },
  },
  plugins: [],
};