# TW-Font-Manager — contexte projet pour Claude

> **Avant toute tâche sur ce plugin, consulter d'abord le `CLAUDE.md` du workspace** (`../CLAUDE.md`) et ses `guides/` : outillage de dev commun (pnpm, `dev.cjs`/HMR, Ctrl+C, git push), pièges PowerShell/Windows, `publishFilter`, symlink. Ci-dessous : uniquement le spécifique à TW-Font-Manager.

## Ce que c'est
Plugin TiddlyWiki (`$:/plugins/nikorion/font-manager`) = gestionnaire de polices (v0.5.0, 2026-10-12) : un fichier de police déposé sur le wiki devient un tiddler stylesheet base64. Le plugin **n'embarque plus aucune police**. Auteur : nikorion. Décisions et état : section « Décisions de conception » ci-dessous (ex-`BRIEF-gestionnaire-polices.md`, 2026-10-10, supprimé).

## Structure
```
src/font-manager/                       ← sources du plugin (seul dossier à toucher)
  modules/startup.js             ← hook th-importing-file (import des fichiers de police)
  plugin.info                    ← métadonnées du plugin (v0.5.0)

wiki/                            ← wiki TW de développement
  tiddlers/system/fonts/         ← 38 polices de démo (base64), réelles — pas dans le plugin ; gardées par la démo publiée, à piocher ensuite pour les wikis de prod (glisser-déposer)
  tiddlywiki.info                ← plugins actifs (filesystem, tiddlyweb, nikorion/font-manager), build plugin-json + html
  tiddlers/
    $__StoryList.tid (non versionné)
    system/$__config_SyncFilter.tid
    system/plugins/               ← plugins tiers installés par glisser-déposé du .json (commander, shiraz, tweaks, utility, katex, codemirror-6, link-to-tabs, langue fr-FR, highlight.js) — tiddlers plugin normaux, non liés au plugin fonts lui-même

dist/                            ← généré par pnpm build, gitignored
docs/                            ← démo générée par `pnpm build` (`index.html` + moteur externe), gitignorée, publiée par la CI
```

## Ce que fait le plugin
Chaque police est un tiddler `text/css` titré `$:/fonts/<Nom>` (sans suffixe `.css`), taggé `$:/tags/Stylesheet`, contenant un `@font-face` en base64. Un seul mécanisme : **base64 en tiddler, jamais « binaire dans `files/` + stub »** (route `/files/` absente en standalone). Les polices sont de **vrais tiddlers** (désactivation = retrait du tag, suppression possible) : ne pas les remettre en shadows dans `src/`, la surcharge d'une shadow dupliquerait le base64. Hook : `modules/startup.js` (ESLint : `pnpm lint`).

## Spécificités dev
- `pnpm build` → `dist/TW-Font-Manager-Plugin.json` + démo `docs/` (publiée par la CI : `../guides/publication.md`). Démo `publishFilter` (`../guides/build-html-publishfilter.md`) : exclu `link-to-tabs` ; gardés `utility` (bouton « Edit fields » de la barre latérale, copié de TW-Utility 3.2.3), `lucide-core` (icônes, copié de kms-prod, commun à tous les wikis de dev) et langue `fr-FR`. `tiddlywiki/highlight` gardé (demande utilisateur 2026-10-11) avec sa feuille de style perso `$:/styles/highlight.css` (« Obsidian », identique dans tous les wikis de dev ; le thème pkm-theme en a sa propre version à variables) ; plus de math/katex/commander/codemirror dans ce wiki.
- HMR : un `.js` (dont `startup.js`) ou `plugin.info` reboote le wiki ; les polices de `wiki/tiddlers` sont poussées à chaud.

## Décisions de conception (ex-brief 2026-10-10)

Objectif : gestionnaire central des polices d'un wiki, standalone **et** serveur/client (listes, aperçu, glisser-déposer, polices du plugin/d'autres plugins/ajoutées à la main).

- **Un seul mécanisme : base64 en tiddler stylesheet** (`@font-face` + data URI, tag `$:/tags/Stylesheet`). **Ne jamais réintroduire « binaire dans `files/` + stub »** : dépend de la route serveur `/files/` (absente en standalone, binaire servi hors store donc non embarqué dans le monofichier) et exigerait une conversion stub→base64 à l'export, donc des commandes serveur.
- **Un seul namespace `$:/fonts/<Nom>`** (sans `.css`). Ancien `$:/nikorion/font-manager/<Nom>.css` (wiki Pi5) à migrer vers `$:/fonts/<Nom>`.
- **Hook d'import** (vérifié dans TW 5.4) : `core/modules/wiki.js` `readFile()` appelle `$tw.hooks.invokeHook("th-importing-file", {file, type, isBinary, callback})` avant le traitement par défaut ; si le hook renvoie `true`, le défaut est court-circuité et il doit appeler `callback(tiddlerFieldsArray)`. `boot/boot.js` (~l.2491) enregistre déjà `font/woff|woff2|ttf|otf` en base64 → `type` commence par `font/`. Le tiddler passe ensuite par l'écran d'import normal (liste, cases, renommage). JS navigateur pur, identique standalone/serveur. Implémenté dans `modules/startup.js` ; avertissement au-delà de 300 Ko (`LARGE_FONT_BYTES`) et conseil WOFF2.
- **Champs d'index d'un tiddler police** : `font-family`, `font-type` (sans/serif/script/mono/fantasy), `font-format`, `rank` (étoiles ★ à ★★★★, 2026-10-12 : migrées depuis `note`, qui reste le texte libre ; l'import n'y écrit que les échecs de conversion et l'avertissement de police volumineuse, **jamais un message de réussite**, choix utilisateur 2026-10-12), `note`, `source`/`licence`.
- **Onglet « Polices »** (`src/font-manager/fonts.tid`, 2026-10-12, dans `list` du `plugin.info`) : tableau `<<dyntable>>` si `nikorion/dyntable` est chargé — détecté par le shadow `…/procedures/nk-dyntable` —, sinon liste simple. Colonnes `nk-font-name` (titre glissable), `nk-font-sample` (aperçu dans la police), `nk-font-type`, `nk-font-rank` : templates de corps `dyntable/*.tid` (tag `$:/tags/nk-dyntable/BodyTemplate`, inertes sans dyntable) + libellés par `dyntable/labels.tid` (clés `Fonts/Column/<nom>` en minuscules). **Dépendance optionnelle seulement** : le plugin n'exige pas dyntable. Le wiki de dev charge `nikorion/dyntable` (choix utilisateur 2026-10-12, après l'abandon du plugin fusionné `nikorion/pkm`) : la CI de la démo clone TW-Dynamic-Table via l'entrée `dyntable` de `tw-dev/plugins.json`.
- **Détection prévue** : `[all[shadows+tiddlers]tag[$:/tags/Stylesheet]prefix[$:/fonts/]]` + tout tiddler dont le texte contient `@font-face` ; bonus : lister les `font-family` utilisées dans les CSS du wiki sans `@font-face` (ex. « Inter » dans kms-prod, jamais déclarée).
- **UI prévue** : liste filtrable (type, note, plugin d'origine), aperçu texte clair/sombre, renommage, suppression, doublons de `font-family` (base : tiddlers `user/TW/Aperçu fonts*.tid` du wiki praxisland, chemin dans `CLAUDE.local.md`).
- **Poids** : les 38 polices en base64 pèsent plusieurs Mo par wiki → le plugin n'embarque rien (tranché) ; l'idée « bibliothèque optionnelle `fonts-library` » ou « n'émettre le `@font-face` que des polices activées (`$:/config/fonts/<nom>`) » reste possible si besoin.
- **Conversion TTF/OTF → WOFF2 à l'import** (2026-10-11) : module vendoré `modules/woff2-encoder.min.js` (lib npm `woff2-encoder`, MIT, ~1 Mo, WASM inline, `module-type: library` donc chargé seulement au 1er `require()` du hook), régénéré par `pnpm vendor:woff2` (`scripts/vendor-woff2.cjs`, retire l'`export` ESM final) — **jamais édité à la main**, exclu d'ESLint. Réglage `$:/config/nikorion/font-manager/convert-to-woff2` (défaut `yes`, case dans `settings.tid`) ; repli sur la police d'origine + champ `note` si l'encodeur échoue. `.woff` (v1) non converti. Pas d'ES module : ne pas importer la lib en `import`.
