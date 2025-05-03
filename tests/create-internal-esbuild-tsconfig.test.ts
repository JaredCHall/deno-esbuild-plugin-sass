import {
  tsconfigCache,
} from "deno-esbuild-plugin-sass";
import {
  assertEquals,
  assertMatch,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

function withTempDir(testFn: (cwd: string) => Promise<void>): () => Promise<void> {
  return async () => {
    const temp = await Deno.makeTempDir();
    const prevCwd = Deno.cwd();
    Deno.chdir(temp);

    try {
      await testFn(temp);
    } finally {
      Deno.chdir(prevCwd);
      await Deno.remove(temp, { recursive: true });
    }
  };
}

const CONFIG_DIR = ".cache/deno-esbuild-plugin-sass";
const CONFIG_PATH = `${CONFIG_DIR}/tsconfig.json`;

Deno.test("writes a default tsconfig if no deno config exists", withTempDir(async () => {
  const path = await tsconfigCache();
  const result = JSON.parse(await Deno.readTextFile(path));

  assertEquals(path, CONFIG_PATH);
  assertEquals(result.compilerOptions.target, "ESNext");
  assertEquals(result.compilerOptions.experimentalDecorators, true);
}));

Deno.test("merges compilerOptions from deno.json", withTempDir(async () => {
  await Deno.writeTextFile("deno.json", JSON.stringify({
    compilerOptions: {
      emitDecoratorMetadata: true,
      strict: true
    }
  }));

  const path = await tsconfigCache();
  const result = JSON.parse(await Deno.readTextFile(path));

  assertEquals(result.compilerOptions.emitDecoratorMetadata, true);
  assertEquals(result.compilerOptions.strict, true);
  assertEquals(result.compilerOptions.experimentalDecorators, true);
}));

Deno.test("merges compilerOptions from deno.jsonc", withTempDir(async () => {
  await Deno.writeTextFile("deno.jsonc", `{
    // Use metadata
    "compilerOptions": {
      "emitDecoratorMetadata": true
    }
  }`);

  const path = await tsconfigCache();
  const result = JSON.parse(await Deno.readTextFile(path));

  assertEquals(result.compilerOptions.emitDecoratorMetadata, true);
  assertEquals(result.compilerOptions.experimentalDecorators, true);
}));

Deno.test("writes output to expected .cache location", withTempDir(async () => {
  const path = await tsconfigCache();
  assertMatch(path, new RegExp(`^${CONFIG_DIR}/tsconfig\\.json$`));

  const stat = await Deno.stat(path);
  assertEquals(stat.isFile, true);
}));
