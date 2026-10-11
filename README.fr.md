# TW-Font-Manager

[English](README.md) · **Français**

![Status](https://img.shields.io/badge/status-experimental-orange)
![TiddlyWiki](https://img.shields.io/badge/TiddlyWiki-%E2%89%A55.2.0-blue)

Un plugin TiddlyWiki qui transforme les fichiers de police déposés en tiddlers de feuille de style prêts à l'emploi.

## Présentation

Déposez un fichier `.woff2`/`.woff`/`.ttf`/`.otf` sur le wiki : un hook `th-importing-file` (`modules/startup.js`) le transforme en tiddler `text/css` (`$:/fonts/<name>`) tagué `$:/tags/Stylesheet`, qui embarque la police sous forme de déclaration `@font-face` en base64, puis le passe à l'écran d'import normal. Aucune requête externe, aucun fichier de police séparé à gérer. Le plugin n'embarque aucune police ; le wiki de dev (`wiki/tiddlers/system/fonts/`) et la démo en ligne contiennent une collection d'exemple.

## Installation

**Démo en ligne** : [https://nikorion.github.io/TW-Font-Manager/](https://nikorion.github.io/TW-Font-Manager/) — pour essayer le plugin avant de l'installer.

**Depuis la bibliothèque de plugins nikorion** (TiddlyWiki propose ensuite chaque nouvelle version en mise à jour) :

1. Sur [nikorion.github.io/TW-Plugin-Library](https://nikorion.github.io/TW-Plugin-Library/), glisser le bouton **Bibliothèque de plugins nikorion** sur votre wiki (une fois par wiki).
2. Ouvrir *Panneau de configuration → Plugins → Obtenir d'autres plugins → Ouvrir la bibliothèque de plugins*, choisir l'onglet nikorion et installer **Fonts**.

**À la main** : télécharger [`TW-Font-Manager-Plugin.json`](https://nikorion.github.io/TW-Font-Manager/TW-Font-Manager-Plugin.json) et le glisser-déposer sur votre wiki.

Nécessite TiddlyWiki ≥ 5.2.0.

## Développement

Cloner [tw-dev](https://github.com/nikorion/tw-dev) à côté de ce dépôt : `pnpm dev` l'exécute, et il relie lui-même les plugins nikorion que charge le wiki de dev — depuis les clones placés à côté de celui-ci (`../TW-Math`…), pour que vos modifications y soient prises en direct, sinon depuis une copie en lecture seule qu'il récupère sur GitHub. Ni lien symbolique, ni `TIDDLYWIKI_PLUGIN_PATH`, ni droits administrateur. Seul `pnpm build` a encore besoin de `TIDDLYWIKI_PLUGIN_PATH` : le faire pointer sur `../tw-dev/.state/TW-Font-Manager/plugins`, créé par `pnpm dev`.

```
pnpm install
pnpm dev      # wiki de dev + rechargement à chaud ; l'URL (port libre aléatoire) s'affiche au démarrage
pnpm build    # dist/TW-Font-Manager-Plugin.json + docs/ (wiki de démo, publié par la CI)
```

Les sources sont dans `src/font-manager/`.

## Fichiers

| Fichier | Rôle |
|---|---|
| `src/font-manager/plugin.info` | Métadonnées du plugin |
| `src/font-manager/modules/startup.js` | Hook d'import des fichiers de police |
| `wiki/tiddlers/system/fonts/` | Polices de démo, un tiddler de feuille de style `@font-face` chacune (wiki de dev et démo seulement, hors plugin) |

## Historique des versions

**v0.4.0**

Les fichiers TTF/OTF sont convertis en WOFF2 à l'import (`woff2-encoder` vendoré, `pnpm vendor:woff2` ; réglage `convert-to-woff2`).

**v0.3.0**

Gestionnaire de polices : import des fichiers de police déposés ; les polices embarquées sortent du plugin.

**v0.1.0**

Première version — collection de polices extraite dans son propre plugin.

## Crédits

Développé avec l'aide d'Anthropic Claude pour le code, la revue et la documentation.

## Licence

Licence MIT — voir `LICENSE`
