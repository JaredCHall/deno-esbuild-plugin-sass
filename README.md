# deno-esbuild-plugin-sass

A lightweight, Deno-native esbuild plugin that compiles `.scss` or `.sass` files using the Dart Sass CLI, and transforms the output into Lit-compatible CSS modules using `css\`...\`` tagged template literals.

## ✨ Features

- ✅ No Node.js or npm dependencies
- ✅ Uses `Deno.Command` to invoke the Sass CLI
- ✅ Supports both `.scss` and `.sass` syntaxes
- ✅ Outputs Lit-compatible modules:
  ```ts
  import { css } from "lit";
  export default css`...`;
  ```
- ✅ Ideal for Shadow DOM + Sass projects (e.g., Lit, Shoelace)

## 📦 Installation

Make sure you have a working [Dart Sass binary](https://github.com/sass/dart-sass/releases). You can fetch it with:

```sh
deno task fetch:sass
```

### Windows Notes

On Windows, creating symlinks normally requires administrator privileges\. However:

- If you **enable Developer Mode**, symlink creation works without admin rights
- If Developer Mode is **not enabled**, the script will fall back to copying the binary instead of linking it

To enable Developer Mode:
1. Open **Settings**
2. Go to **Privacy & security → For developers**
3. Toggle **Developer Mode** to "On"

## 🚀 Usage

Example build script (`examples/build.ts`):

```ts
import { build } from "@esbuild";
import { denoPlugins } from "@deno-plugins";
import { sassToLitPlugin } from "sass-to-lit";

await build({
  entryPoints: ["./examples/main.ts"],
  bundle: true,
  plugins: [sassToLitPlugin(), ...denoPlugins()],
  format: "esm",
  target: "esnext",
  outfile: "./examples/out.js",
});

console.log(
  "%c✨ Build complete! Your styles are Lit and your Sass is sassy. ✨",
  "color: limegreen; font-weight: bold; padding: 2px;"
);
```

## 🛠 Example Input

### `style.scss`
```scss
body {
  background-color: #222;
  color: #fff;
}
```

### `main.ts`
```ts
import styles from "./style.scss";
console.log(styles);
```

### Output
```ts
import { css } from "lit";
export default css`
  body {
    background-color: #222;
    color: #fff;
  }
`;
```

## 🔒 .gitignore Recommendation
Add this to `bin/.gitignore`:
```gitignore
*
!.gitignore
```
To ignore the fetched Sass binary but keep the directory.

## 🧪 Testing
```sh
deno task build
```

## 📄 License
MIT
