import { build } from "@esbuild";
import { denoPlugins } from "@deno-plugins";
import { sassToLitPlugin, createInternalEsbuildTsconfig } from "deno-esbuild-plugin-sass";

const tsconfig = await createInternalEsbuildTsconfig();

await build({
  entryPoints: ["./examples/main.ts"],
  tsconfig,
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