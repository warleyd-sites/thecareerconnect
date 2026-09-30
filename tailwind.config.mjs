/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,ts,tsx,md}"],
  theme: {
    extend: {
      colors: {
        brand: "var(--color-brand)",
        "brand-dark": "var(--color-brand-dark)",
        navy: "var(--color-navy)",
        accent: "var(--color-accent)",
        gold: "var(--color-gold)",
        ink: "var(--color-ink)",
        mist: "var(--color-mist)",
      },
      fontFamily: {
        display: ["'Montserrat'", "system-ui", "sans-serif"],
        body: ["'Libre Baskerville'", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
