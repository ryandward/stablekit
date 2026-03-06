import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// The library's inject-styles.ts does `import css from "../styles.css"` which
// tsup handles (returns a string), but Vite needs the `?inline` suffix to
// return CSS as a string instead of injecting it as a side-effect.
function stablekitCssInline(): Plugin {
  const stylesPath = path.resolve(__dirname, "../src/styles.css");
  return {
    name: "stablekit-css-inline",
    enforce: "pre",
    resolveId(source, importer) {
      if (
        source === "../styles.css" &&
        importer &&
        importer.includes(path.join("src", "internal", "inject-styles"))
      ) {
        return stylesPath + "?inline";
      }
    },
  };
}

export default defineConfig({
  base: "/stablekit/",
  plugins: [stablekitCssInline(), react(), tailwindcss()],
  server: {
    fs: {
      allow: [
        path.resolve(__dirname, ".."),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      stablekit: path.resolve(__dirname, "../src/index.ts"),
    },
  },
});
