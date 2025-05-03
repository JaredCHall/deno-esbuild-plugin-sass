# 📂️ Project Structure Overview

This document describes the layout of the project directory and the purpose of each major folder and file.

## Root

* `deno.jsonc` – Deno configuration (includes import map, tasks, and compiler options)
* `mod.ts` – Entry point for JSR module consumers; re-exports the main plugin from `src/plugin.ts`
* `README.md` – Project overview and usage instructions
* `LICENSE` – Licensing information
* `deps.ts` *(optional)* – Re-exports for third-party modules (if used)

## Directories

### `src/`

* Contains the actual plugin implementation (`plugin.ts`)
* Internal logic separated from public API

### `scripts/`

* Utility scripts to build and test examples
* Invoked via `deno task`

### `examples/`

* Minimal working examples for supported front-end CSS frameworks
* Demonstrates real-world usage of this tool

### `tests/`

* Contains Deno test cases
* All test files use standard `Deno.test()` format
* Includes `plugin.test.ts` which tests `src/plugin.ts`

### `docs/`

* `project-structure.md` – This file
* `ai-instructions.md` – Guide for AI assistance and tooling integration

### `vendor/`

* Stores the Dart Sass binary
* Not tracked by Git (should be listed in `.gitignore`)
* Internal use only
