// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <-- use new plugin
    autoprefixer: {},
  },
};