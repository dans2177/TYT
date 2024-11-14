alias = function (name) {
  return path.resolve(__dirname, name);
};

module.exports = {
  entry: alias("src/index.jsx"),
  output: { path: alias("dist"), filename: "bundle.js" },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: "file-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
  devServer: {
    contentBase: alias("dist"),
    hot: true,
  },
};
// Compare this snippet from package.json:
// {
//   "name": "react-native-workout",
//   "version": "0.0.1",
//   "private": true,
