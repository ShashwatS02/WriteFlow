module.exports = {
  plugins: {
    // Use the official PostCSS adapter for Tailwind so Next/PostCSS integration
    // doesn't try to use the raw `tailwindcss` package as a PostCSS plugin.
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
