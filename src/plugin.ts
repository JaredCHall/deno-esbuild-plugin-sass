import { Plugin, PluginBuild, OnLoadArgs, OnResolveArgs } from "@esbuild";
import { resolve } from "https://deno.land/std@0.224.0/path/mod.ts";

interface SassPluginOptions {
  wrapper?: "lit" | "raw" | ((css: string) => string);
  binPath: string; // Required
}

export function sassToLitPlugin(options: SassPluginOptions): Plugin {

  const { binPath } = options;
  const wrap = typeof options.wrapper === "function"
      ? options.wrapper
      : options.wrapper === "raw"
          ? (css: string) => `export default \`${css.replace(/`/g, "\\`")}\`;`
          : (css: string) => `import { css } from \"lit\";\nexport default css\`${css.replace(/`/g, "\\`")}\`;`;

  return {
    name: "sass-to-lit",
    setup(build: PluginBuild) {

      build.onResolve({ filter: /\.s[ac]ss$/ }, (args: OnResolveArgs) => ({
        path: resolve(args.resolveDir, args.path),
        namespace: "sass-lit",
      }));

      build.onLoad({ filter: /.*/, namespace: "sass-lit" }, async (args: OnLoadArgs) => {
        const inputFile = args.path;
        // build with dart-sass in subprocess
        const command = new Deno.Command(binPath, {
          args: [inputFile, "--no-source-map"],
          stdin: "null",
          stdout: "piped",
          stderr: 'piped',
        });

        // spawn the process and save references to the input readers
        const child = command.spawn();
        const stdoutReader = child.stdout.getReader()
        const stderrReader = child.stderr.getReader()

        // wait for the process to finish and resolve input streams
        const status = await child.status
        const [stdoutChunk, stderrChunk] = await Promise.all([
          stdoutReader.read(),
          stderrReader.read(),
        ]);
        const stdout = new TextDecoder().decode(stdoutChunk.value);
        const stderr = new TextDecoder().decode(stderrChunk.value);

        // cleanup and close the input streams
        stdoutReader.releaseLock()
        stderrReader.releaseLock()
        await child.stdout.cancel()
        await child.stderr.cancel()

        if (status.code !== 0) {
          throw new Error(`Sass compilation failed:\n${stderr}`);
        }

        const contents = wrap(stdout);

        return {
          contents,
          loader: "js",
        };
      });
    },
  };
}
