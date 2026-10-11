#!/usr/bin/env node
"use strict";

// Re-vendors woff2-encoder's prebuilt, self-contained bundle (WASM inlined, no fetch,
// no import.meta) into src/font-manager/modules/woff2-encoder.min.js, whenever the
// `woff2-encoder` devDependency is bumped. The source is already minified ESM with one
// trailing `export{I as compress,Q as decompress}`: this script strips it and appends
// CommonJS `exports.*` assignments, since TiddlyWiki's module sandbox
// (`function(module, exports, require)`) chokes on top-level `export`. A fresh TW header
// + name/version/licence block is written in front. The module is `module-type: library`:
// it only runs (and the WASM only loads) on the first `require()`, i.e. the first
// TTF/OTF import with conversion enabled.

const fs = require("fs");
const path = require("path");

const packageJsonPath = require.resolve("woff2-encoder/package.json");
const packageRoot = path.dirname(packageJsonPath);
const SOURCE = path.join(packageRoot, "dist", "index.js");
const TARGET = path.join(__dirname, "..", "src", "font-manager", "modules", "woff2-encoder.min.js");

const pkg = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const vendoredDate = new Date().toISOString().slice(0, 10);

let source = fs.readFileSync(SOURCE, "utf8");

const match = source.match(/export\s*\{([^}]*)\}\s*;?\s*$/);
if(!match) {
	console.error("Trailing `export { … }` not found in " + SOURCE + ": woff2-encoder's build layout changed.");
	process.exit(1);
}
if(/\bimport\s*\(|import\.meta|\bfetch\s*\(/.test(source)) {
	console.error("woff2-encoder's build is no longer self-contained (dynamic import / import.meta / fetch): review before vendoring.");
	process.exit(1);
}

const assignments = match[1].split(",").map(function(part) {
	const bits = part.trim().split(/\s+as\s+/);
	return "exports." + (bits[1] || bits[0]) + " = " + bits[0] + ";";
});
source = source.slice(0, match.index).replace(/;?\s*$/, ";") + "\n" + assignments.join("\n") + "\n";

const HEADER = [
	"/*\\",
	"title: $:/plugins/nikorion/font-manager/modules/woff2-encoder.min.js",
	"type: application/javascript",
	"module-type: library",
	"\\*/",
	"",
	"/**",
	" * woff2-encoder.min.js",
	" * " + (pkg.repository && pkg.repository.url ? pkg.repository.url.replace(/^git\+/, "").replace(/\.git$/, "") : "https://github.com/itskyedo/woff2-encoder"),
	" *",
	" * WOFF2 encoder/decoder (Google woff2 + Brotli compiled to WebAssembly, inlined).",
	" * Exposes `compress(Uint8Array) -> Promise<Uint8Array>` (TTF/OTF -> WOFF2)",
	" * and `decompress`.",
	" */",
	"",
	"/**",
	" * @version " + pkg.version,
	" * @date    " + vendoredDate + " (vendoring date)",
	" */",
	"",
	"/**",
	" * @license",
	" * MIT License",
	" * Copyright (c) 2023-PRESENT Kyedo <https://github.com/itskyedo>",
	" * Includes Google woff2 and Brotli (MIT).",
	" */",
	"",
	""
].join("\n");

fs.writeFileSync(TARGET, HEADER + source, "utf8");
console.log("Wrote " + path.relative(process.cwd(), TARGET) + " (" + Math.round((HEADER.length + source.length) / 1024) + " KB, woff2-encoder " + pkg.version + ")");
