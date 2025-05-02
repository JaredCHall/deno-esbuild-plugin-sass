import { build } from "@esbuild";
import { denoPlugins } from "@deno-plugins";
import { sassToLitPlugin } from "sass-to-lit";

await build({
  entryPoints: ["./examples/main.ts"],
  bundle: true,
  plugins: [sassToLitPlugin(), ...denoPlugins()],
  format: "esm",
  target: "esnext",
  outfile: "./examples/out.js",
});