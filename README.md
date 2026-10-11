# TW-Font-Manager

**English** · [Français](README.fr.md)

![Status](https://img.shields.io/badge/status-experimental-orange)
![TiddlyWiki](https://img.shields.io/badge/TiddlyWiki-%E2%89%A55.2.0-blue)

A TiddlyWiki plugin that turns dropped font files into ready-to-use stylesheet tiddlers.

## Overview

Drop a `.woff2`/`.woff`/`.ttf`/`.otf` file onto the wiki: a `th-importing-file` hook (`modules/startup.js`) turns it into a `text/css` tiddler (`$:/fonts/<name>`) tagged `$:/tags/Stylesheet`, embedding the font as a base64 `@font-face` declaration, then hands it to the normal import screen. No external requests, no separate font files to manage. The plugin ships no font; the dev wiki (`wiki/tiddlers/system/fonts/`) and the online demo hold a sample collection.

## Installation

**Live demo**: [https://nikorion.github.io/TW-Font-Manager/](https://nikorion.github.io/TW-Font-Manager/) — try the plugin before installing it.

**From the nikorion plugin library** (TiddlyWiki then offers each new version as an update):

1. On [nikorion.github.io/TW-Plugin-Library](https://nikorion.github.io/TW-Plugin-Library/), drag the **nikorion plugin library** button onto your wiki (once per wiki).
2. Open *Control Panel → Plugins → Get more plugins → Open plugin library*, choose the nikorion tab and install **Fonts**.

**By hand**: download [`TW-Font-Manager-Plugin.json`](https://nikorion.github.io/TW-Font-Manager/TW-Font-Manager-Plugin.json) and drag it onto your wiki.

Requires TiddlyWiki ≥ 5.2.0.

## Development

Clone [tw-dev](https://github.com/nikorion/tw-dev) next to this repository: `pnpm dev` runs it, and it links by itself the nikorion plugins the dev wiki loads — from clones sitting next to this one (`../TW-Math`…), so your edits to them are live, otherwise from a read-only copy it fetches from GitHub. No symlink, no `TIDDLYWIKI_PLUGIN_PATH`, no admin rights. `pnpm build` alone still needs `TIDDLYWIKI_PLUGIN_PATH`: point it to `../tw-dev/.state/TW-Font-Manager/plugins`, created by `pnpm dev`.

```
pnpm install
pnpm dev      # dev wiki + hot reload; the URL (random free port) is printed on start
pnpm build    # dist/TW-Font-Manager-Plugin.json + docs/ (demo wiki, published by CI)
```

Sources are in `src/font-manager/`.

## Files

| File | Role |
|---|---|
| `src/font-manager/plugin.info` | Plugin metadata |
| `src/font-manager/modules/startup.js` | Font-file import hook |
| `wiki/tiddlers/system/fonts/` | Demo fonts, one `@font-face` stylesheet tiddler each (dev wiki and demo only, not in the plugin) |

## Version history

**v0.4.0**

TTF/OTF files are converted to WOFF2 on import (vendored `woff2-encoder`, `pnpm vendor:woff2`; setting `convert-to-woff2`).

**v0.3.0**

Font manager: import of dropped font files; the bundled fonts moved out of the plugin.

**v0.1.0**

Initial release — font collection extracted into its own plugin.

## Credits

Developed with assistance from Anthropic Claude for code, review, and documentation.

## License

MIT License — see `LICENSE`
