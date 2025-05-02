import { Plugin, PluginBuild, OnLoadArgs, OnResolveArgs } from "@esbuild";
import { resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

function resolveSassBinary(): string {
  const local = new URL("./bin/sass", import.meta.url).pathname;
  try {
    Deno.statSync(local);
    return local;
  } catch {
    console.warn(
        "[sass-to-lit] Falling back to system 'sass' binary. Consider running 'deno task fetch:sass' to install a local one."
    );
    return "sass";
  }
}

export function sassToLitPlugin(): Plugin {
  return {
    name: "sass-to-lit",
    setup(build: PluginBuild) {
      build.onResolve({ filter: /\.s[ac]ss$/ }, (args: OnResolveArgs) => ({
        path: resolve(args.resolveDir, args.path),
        namespace: "sass-lit",
      }));

      build.onLoad({ filter: /.*/, namespace: "sass-lit" }, async (args: OnLoadArgs) => {
        const sassPath = resolveSassBinary();
        const inputFile = args.path;

        const proc = new Deno.Command(sassPath, {
          args: [inputFile, "--no-source-map"],
          stdout: "piped",
          stderr: "piped",
        });

        const { code, stdout, stderr } = await proc.output();
        if (code !== 0) {
          const errorMsg = new TextDecoder().decode(stderr);
          throw new Error(`Sass compilation failed:\n${errorMsg}`);
        }

        const css = new TextDecoder().decode(stdout);
        const contents = `import { css } from \"lit\";\nexport default css\`${css.replace(/`/g, "\\`")}\`;`;

        return {
          contents,
          loader: "js",
        };
      });
    },
  };
}
