// scripts/fetch_sass.ts

export async function fetchSass(versionArg?: string) {
  const defaultVersion = "1.87.0";
  const version = Deno.args[0] ?? defaultVersion;

  const baseUrl = `https://github.com/sass/dart-sass/releases/download/${version}`;

  const scriptDir = new URL(".", import.meta.url).pathname;
  const binDir = `${scriptDir}../bin`;
  const dartSassDir = `${binDir}/dart-sass`;
  const symlinkPath = `${binDir}/sass`;

  const platform = Deno.build.os;
  const arch = Deno.build.arch;

  let fileName: string;
  switch (platform) {
    case "windows":
      fileName = `dart-sass-${version}-windows-${arch === "x86_64" ? "x64" : arch}.zip`;
      break;
    case "darwin":
      fileName = `dart-sass-${version}-macos-${arch === "x86_64" ? "x64" : "arm64"}.tar.gz`;
      break;
    case "linux":
      fileName = `dart-sass-${version}-linux-${arch === "x86_64" ? "x64" : arch}.tar.gz`;
      break;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }

// Clean out old dart-sass dir if it exists
  try {
    await Deno.remove(dartSassDir, { recursive: true });
    console.log("🧨 Removed previous bin/dart-sass directory");
  } catch (_) {
    // It didn't exist — nothing to clean
  }
  await Deno.mkdir(dartSassDir, { recursive: true });

  const url = `${baseUrl}/${fileName}`;
  console.log(`📦 Downloading: ${url}`);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download Sass: ${res.statusText}`);
  const bytes = new Uint8Array(await res.arrayBuffer());

  await Deno.mkdir(binDir, { recursive: true });
  await Deno.mkdir(dartSassDir, { recursive: true });

  const archivePath = `${binDir}/${fileName}`;
  await Deno.writeFile(archivePath, bytes);
  console.log(`✅ Saved to ${archivePath}`);

// Extract archive
  const tempDir = `${binDir}/.dart-sass-tmp`;
  await Deno.mkdir(tempDir, { recursive: true });

  if (fileName.endsWith(".zip")) {
    const p = new Deno.Command("unzip", {
      args: [archivePath, "-d", tempDir],
    });
    const { success } = await p.output();
    if (!success) throw new Error("Failed to unzip Sass archive");
  } else if (fileName.endsWith(".tar.gz")) {
    const p = new Deno.Command("tar", {
      args: ["-xzf", archivePath, "-C", tempDir, "--strip-components=1"],
    });
    const { success } = await p.output();
    if (!success) throw new Error("Failed to extract Sass archive");
  }

  await Deno.remove(archivePath);
  console.log("🧹 Cleaned up archive file.");

// Move contents to dart-sass directory
  for await (const entry of Deno.readDir(tempDir)) {
    const from = `${tempDir}/${entry.name}`;
    const to = `${dartSassDir}/${entry.name}`;
    await Deno.rename(from, to);
  }
  await Deno.remove(tempDir, { recursive: true });
  console.log("📂 Dart Sass extracted to bin/dart-sass");

// Ensure binary is executable
  const sassBin = `${dartSassDir}/sass${platform === "windows" ? ".bat" : ""}`;
  await Deno.chmod(sassBin, 0o755);

// Create symlink: bin/sass → dart-sass/sass
  try {
    await Deno.remove(symlinkPath);
  } catch (_) {
    // ignore if doesn't exist
  }

  try {
    await Deno.symlink(sassBin, symlinkPath);
    console.log(`🔗 Created symlink: ${symlinkPath} → dart-sass/sass`);
  } catch (err) {
    // Windows fallback if symlink fails due to lack of privilege
    if (platform === "windows" && err instanceof Deno.errors.PermissionDenied) {
      console.warn("⚠️  Symlink creation failed (likely missing Developer Mode). Falling back to file copy.");
      await Deno.copyFile(sassBin, symlinkPath);
      console.log(`📄 Copied binary instead: ${symlinkPath}`);
    } else {
      throw err; // rethrow unexpected errors
    }
  }

  console.log("🎉 Dart Sass setup complete.");
}

// CLI entry point
if (import.meta.main) {
  await fetchSass();
}