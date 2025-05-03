const res = await fetch("https://api.github.com/repos/sass/dart-sass/releases/latest");

if (!res.ok) {
  console.error("❌ Failed to fetch latest Dart Sass version:", res.statusText);
  Deno.exit(1);
}

const json = await res.json();
const version = json.tag_name;

if (!version || typeof version !== "string") {
  console.error("❌ Unexpected response format from GitHub.");
  Deno.exit(1);
}

console.log(version); // e.g., 1.87.0
