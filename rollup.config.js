import {babel} from "@rollup/plugin-babel"
import eslint from "@rollup/plugin-eslint"
import {terser} from "rollup-plugin-terser"

export default {
  input: "src/index.js",
  output: [
    {
      file: "dist/adaptive.cjs.js",
      format: "umd",
      name: "Adaptive",
      plugins: [terser()]
    },
    {
      file: "dist/adaptive.esm.js",
      format: "es"
    }
  ],
  external: [/@babel\/runtime/, /lodash\..+/, /classlist/i],
  plugins: [
    eslint({
      throwOnError: true
    }),
    babel({
      exclude: "node_modules/**",
      babelHelpers: "runtime"
    })
  ]
}
