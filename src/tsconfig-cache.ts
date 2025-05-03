// internal/esbuild/tsconfig_cache.ts

import { parse } from "https://deno.land/std@0.224.0/jsonc/parse.ts";


/**
 * Writes a fresh esbuild-compatible tsconfig.json to a namespaced cache directory,
 * mirroring Deno's compilerOptions while ensuring decorator support.
 */
export async function createInternalEsbuildTsconfig(): Promise<string> {

  const tsconfigDir = ".cache/deno-esbuild-plugin-sass";
  const tsconfigPath = `${tsconfigDir}/tsconfig.json`;

  await Deno.mkdir(tsconfigDir, { recursive: true });

  let compilerOptions: Record<string, unknown> = {};

  try {
    const configFile = await findDenoConfig();
    if (configFile) {
      const text = await Deno.readTextFile(configFile);
      const parsed = parse(text);
      compilerOptions = parsed.compilerOptions ?? {};
    }
  } catch {
    // fail silently — fallback below handles it
  }

  const merged = {
    target: "ESNext",
    module: "ESNext",
    experimentalDecorators: true,
    emitDecoratorMetadata: false,
    useDefineForClassFields: false,
    ...compilerOptions
  };

  await Deno.writeTextFile(
      tsconfigPath,
      JSON.stringify({ compilerOptions: merged }, null, 2)
  );

  return tsconfigPath;
}

/**
 * Resolves the first available config file: deno.jsonc or deno.json
 */
async function findDenoConfig(): Promise<string | null> {
  const candidates = ["deno.jsonc", "deno.json"];
  for (const file of candidates) {
    try {
      const stat = await Deno.stat(file);
      if (stat.isFile) return file;
    } catch {
      // try next
    }
  }
  return null;
}
