/*\
title: $:/plugins/nikorion/font-manager/modules/startup.js
type: application/javascript
module-type: startup

Registers the `th-importing-file` hook so that a dropped (or imported) font
file becomes a ready-to-use stylesheet tiddler instead of a binary tiddler.

Core's `wiki.readFile()` invokes the hook before its default processing. When
the hook returns `true`, the default is skipped and the hook must call
`callback(arrayOfTiddlerFields)` itself. The result then goes through the
normal import screen (list, checkboxes, renaming).

The tiddler format is the one the plugin already ships: `$:/fonts/<Name>`,
tagged `$:/tags/Stylesheet`, holding a `@font-face` rule with a base64 data URI.
TTF and OTF files are converted to WOFF2 on the way in (bundled WASM encoder,
loaded lazily; `$:/config/nikorion/font-manager/convert-to-woff2`).
Pure browser JS: identical behaviour standalone and client/server.
\*/

"use strict";

exports.name = "nikorion-font-manager-import";
exports.platforms = ["browser"];
exports.after = ["load-modules"];
exports.synchronous = true;

// Core registers these four as base64 file types (boot.js)
const FORMATS = {
	"font/woff2": "woff2",
	"font/woff": "woff",
	"font/ttf": "truetype",
	"font/otf": "opentype"
};

// Formats the bundled encoder turns into WOFF2 (WOFF v1 gains too little)
const CONVERTIBLE = ["font/ttf", "font/otf"];
const CONFIG_CONVERT = "$:/config/nikorion/font-manager/convert-to-woff2";
const ENCODER = "$:/plugins/nikorion/font-manager/modules/woff2-encoder.min.js";

function familyFromFileName(name) {
	return (name || "Untitled font")
		.replace(/\.[^.]+$/, "")
		.replace(/[_]+/g, " ")
		.replace(/[\\/'"{}]+/g, "")
		.trim() || "Untitled font";
}

function bytesToBase64(bytes) {
	let binary = "";
	const chunk = 0x8000;
	for(let i = 0; i < bytes.length; i += chunk) {
		binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
	}
	return btoa(binary);
}

function buildFields(family, mime, format, base64) {
	return {
		title: "$:/fonts/" + family,
		type: "text/css",
		tags: "$:/tags/Stylesheet",
		"font-family": family,
		text: "@font-face {\n" +
			"\tfont-family: '" + family + "';\n" +
			"\tfont-weight: normal;\n" +
			"\tfont-style: normal;\n" +
			"\tsrc: url(data:" + mime + ";base64," + base64 + ") format('" + format + "');\n" +
			"}\n"
	};
}

exports.startup = function() {
	$tw.hooks.addHook("th-importing-file", function(info) {
		const format = FORMATS[info.type];
		if(!format) {
			return false;
		}
		const file = info.file,
			family = familyFromFileName(file.name),
			convert = CONVERTIBLE.indexOf(info.type) !== -1 &&
				$tw.wiki.getTiddlerText(CONFIG_CONVERT, "yes").trim() === "yes",
			reader = new FileReader();
		reader.onerror = function() {
			info.callback([]);
		};
		if(convert) {
			reader.onload = function(event) {
				const original = new Uint8Array(event.target.result),
					asIs = function(reason) {
						// eslint-disable-next-line no-console
						console.warn("font-manager: " + reason);
						return buildFields(family, info.type, format, bytesToBase64(original));
					};
				let encoder;
				try {
					encoder = require(ENCODER);
				} catch(e) {
					info.callback([asIs("WOFF2 conversion unavailable: " + e.message)]);
					return;
				}
				encoder.compress(original).then(function(woff2) {
					info.callback([buildFields(family, "font/woff2", "woff2", bytesToBase64(woff2))]);
				}, function(error) {
					info.callback([asIs("WOFF2 conversion failed (" + (error && error.message || error) + "), original kept.")]);
				});
			};
			reader.readAsArrayBuffer(file);
		} else {
			reader.onload = function(event) {
				const dataUri = event.target.result;
				info.callback([buildFields(family, info.type, format, dataUri.substring(dataUri.indexOf(",") + 1))]);
			};
			reader.readAsDataURL(file);
		}
		return true;
	});
};
