// scripts/fetch_sass.ts
const version = "1.87.0"; // You can update this as needed
const baseUrl = `https://github.com/sass/dart-sass/releases/download/${version}`;

const scriptDir = new URL(".", import.meta.url).pathname;
const destDir = `${scriptDir}../bin`;
const binPath = `${destDir}/sass`;

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

const url = `${baseUrl}/${fileName}`;
console.log(`📦 Downloading: ${url}`);

const res = await fetch(url);
if (!res.ok) throw new Error(`Failed to download Sass: ${res.statusText}`);
const bytes = new Uint8Array(await res.arrayBuffer());

await Deno.mkdir(destDir, { recursive: true });
const archivePath = `${destDir}/${fileName}`;
await Deno.writeFile(archivePath, bytes);
console.log(`✅ Saved to ${archivePath}`);

// Extract archive
const tempDir = `${destDir}/.dart-sass-tmp`;
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

// Delete archive
await Deno.remove(archivePath);
console.log("🧹 Cleaned up archive file.");

// Move sass binary to /bin
const binaryName = `sass${platform === "windows" ? ".bat" : ""}`;
const extractedBin = `${tempDir}/${binaryName}`;
await Deno.rename(extractedBin, binPath);
await Deno.chmod(binPath, 0o755);
console.log(`🚀 Moved sass binary to ${binPath}`);

// Move src folder to /bin/src if needed
const srcPath = `${tempDir}/src`;
const destSrcPath = `${destDir}/src`;
try {
  const stat = await Deno.stat(srcPath);
  if (stat.isDirectory) {
    await Deno.rename(srcPath, destSrcPath);
    console.log("📁 Moved src directory to bin/src");
  }
} catch (_) {
  console.warn("⚠️  No src directory found to move");
}

// Clean up temp directory
await Deno.remove(tempDir, { recursive: true });
console.log("🧼 Removed temporary files.");

console.log("🎉 Dart Sass setup complete.");
