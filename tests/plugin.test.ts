import { sassToLitPlugin } from "../mod.ts";
import { assertStringIncludes } from "https://deno.land/std@0.224.0/assert/mod.ts";
import type { OnLoadArgs, OnLoadResult, PluginBuild, Plugin } from "@esbuild";

const compileWithPlugin = async (plugin: Plugin, path: string): Promise<string> => {
  const onLoadFn = await new Promise<(args: OnLoadArgs) => Promise<OnLoadResult>>((resolveLoad) => {
    plugin.setup({
      onResolve() {},
      onLoad(_filter: { filter: RegExp; namespace?: string }, callback: (args: OnLoadArgs) => Promise<OnLoadResult>) {
        resolveLoad(callback);
      },
    } as unknown as PluginBuild);
  });

  const result = await onLoadFn({
    path: path,
    namespace: "sass-lit",
    suffix: "",
    pluginData: undefined,
    with: {}
  });

  return typeof result.contents === "string"
      ? result.contents
      : new TextDecoder().decode(result.contents);
}

Deno.test("sassToLitPlugin wraps .scss in Lit module format", async () => {
  const plugin = sassToLitPlugin({
    binPath: "./bin/sass",
  });
  const contentsText = await compileWithPlugin(plugin, "tests/fixtures/style.scss");

  assertStringIncludes(contentsText, "export default css`");
  assertStringIncludes(contentsText, "background-color: #444;");
});

Deno.test("sassToLitPlugin wraps .scss in raw string format", async () => {
  const plugin = sassToLitPlugin({ wrapper: "raw", binPath: "./bin/sass" });
  const contentsText = await compileWithPlugin(plugin, "tests/fixtures/style.scss");

  assertStringIncludes(contentsText, "export default `body {");
  assertStringIncludes(contentsText, "background-color: #444;");
});