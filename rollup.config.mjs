import dts from "rollup-plugin-dts";

const config = [
  {
    input: "build/es6/roostr.js",
    external: ["@1pizzateam/spock"],
    output: {
      file: "build/roostr.mjs",
      format: "es",
      generatedCode: "es2015",
    },
  },
  {
    input: "build/es6/roostr.d.ts",
    output: {
      file: "build/roostr.d.mts",
      format: "es",
    },
    plugins: [dts()],
  },
];

export default config;
