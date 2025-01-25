import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  target: "es2024",
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: false,
  treeshake: false,
  external: ["@prisma/client"],
});
