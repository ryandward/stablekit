import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/eslint.ts", "src/stylelint.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  jsx: "automatic",
  external: ["react", "react-dom"],
  loader: { ".css": "text" },
});
