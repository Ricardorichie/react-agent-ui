// tsup.config.ts
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"], // Entry point of the library
  format: ["cjs", "esm"],
  dts: true, // Generate .d.ts files
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom"], // Peer deps
  banner: {
    js: '"use client";', //all components are client-side
  },
});
