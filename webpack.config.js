/* eslint-disable no-undef */
import NodePolyfillPlugin from "node-polyfill-webpack-plugin";

export const module = {
  plugins: [new NodePolyfillPlugin()],
  rules: [
    {
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ["@svgr/webpack"],
    },
    {
      test: path.join(__dirname, "."),
      exclude: /(node_modules)/,
      loader: "babel-loader",
      options: {
        presets: [
          "@babel/preset-env",
          "@babel/react",
          {
            plugins: ["@babel/plugin-proposal-class-properties"],
          },
        ],
      },
    },
  ],
  // resolve: {
  //   fallback: {
  //     zlib: false,
  //     crypto: false,
  //     http: false,
  //     fs: false,
  //   },
  // },
};
