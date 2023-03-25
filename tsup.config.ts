import { exec, execSync } from "child_process";
import path from "path";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["example/src/main.ts"],
  treeshake: true,
  minify: true,
  sourcemap: false,
  clean: true,
  watch: "example",
  /* watch: path.resolve(__dirname, "example"), */
  onSuccess: "node dist/main.js",
});
