import { build } from "@esbuild";
import { denoPlugins } from "@deno-plugins";
import { sassToLitPlugin } from "sass-to-lit";

await build({
  entryPoints: ["./examples/main.ts"],
  bundle: true,
  plugins: [sassToLitPlugin({
    binPath: "./bin/sass",
  }), ...denoPlugins()],
  format: "esm",
  target: "esnext",
  outfile: "./examples/out.js",
});

console.log(
    "%c✨ Build complete! Your styles are Lit and your Sass is sassy. ✨",
    "color: limegreen; font-weight: bold; padding: 2px;"
);

Deno.exit(0);