module.exports = {
  plugins: [
    // your PostCSS plugins
    require("postcss-plugin")({
      asyncOption: true,
    }),
    // Example async plugin
    require("postcss-async-plugin")().process().then(cb),
  ],
};
