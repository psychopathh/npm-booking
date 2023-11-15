import resolve from "@rollup/plugin-node-resolve";
import babel from "rollup-plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import image from "@rollup/plugin-image";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import tailwindcss from "tailwindcss";
import postcss from "rollup-plugin-postcss";
import json from "@rollup/plugin-json";
import autoprefixer from "autoprefixer";
import { DEFAULT_EXTENSIONS as DEFAULT_BABEL_EXTENSIONS } from "@babel/core";

// eslint-disable-next-line no-undef
const tailwindConfig = require("./tailwind.config.js");
// eslint-disable-next-line no-undef
const packageJson = require("./package.json");

export default [
  {
    input: "src/index.tsx",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      postcss({
        extensions: [".css", ".module.css"],
        plugins: [autoprefixer(), tailwindcss(tailwindConfig)],
        inject: {
          insertAt: "top",
        },
      }),
      resolve({
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      }),
      typescript({ tsconfig: "./tsconfig.json" }),
      json(),
      commonjs({
        include: "node_modules/**",
      }),
      peerDepsExternal(),
      babel({
        extensions: [...DEFAULT_BABEL_EXTENSIONS, ".ts", ".tsx"],
        exclude: /^(.+\/)?node_modules\/.+$/,
      }),
      image(),
    ],
    external: ["react", "react-dom"],
  },
  // {
  //   input: "src/index.tsx",
  //   output: [{ file: packageJson.types, format: "es" }],
  //   plugins: [dts.default()],
  // },
];
