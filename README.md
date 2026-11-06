# Epic CSS documentation and demo site

This Eleventy project is the documentation/demo site. It shares starter ancestry with the blog theme (even the same package name), but its Sass ownership differs. See the [workspace map](../README.md) for the complete component relationships and release workflow.

## Source map

- [src/my-epic-css/index.scss](src/my-epic-css/index.scss) imports this site's local `_custom`, `_variables`, `_fontramp`, `_base`, `_colors`, `_images`, `_grid` and `_spacers` partials. Updating the npm library does not replace these local styles.
- Installed `epic-css` supplies `epic-build.js` and `epic-light.js` via npm scripts, not the active Sass library imports. It declares `^0.14.0`; the installed copy reports `0.14.0`.
- [src/_includes/docs-page.md](src/_includes/docs-page.md) supplies the main utility documentation through `src/docs/index.html`.
- `doc-home-page.md`, `doc-npm.md`, and `doc-11ty-theme.md` are visitor-facing content includes. They are separate from these maintainer READMEs and may still contain older workflow claims; verify them against the actual scripts before reusing commands.
- `.eleventy.js` reads `src` and writes `_site`. `src/_includes/base.njk` embeds `style.css` after CleanCSS minification. `src/_data/site.json` still identifies Design 2 SEO; the checkout does not establish the deployed domain.

## Develop and build

From this directory:

```sh
npm ci
npm start
```

Follow the URL printed by Eleventy, normally `http://localhost:8080`. `start` runs Eleventy serve and Sass watch in parallel. Sass writes the full CSS include; the prestart hook compiles CSS before serving.

Stop watch before building filtered production CSS, then run each command to completion:

```sh
npm run build
```

`epic-build` compiles local Sass to `src/my-epic-css/pre-light.css` and copies full CSS to `src/_includes/style.css`. `epic-light` scans raw `.html`, `.njk`, `.md` under `src`, then overwrites the include with filtered CSS. `build-production` only runs Eleventy. See [filter implementation and limitations](../README.md#what-pre-light-actually-does); this is not exact dead-code removal, and dynamic classes require special care. There is no supported safelist option.

[epicConfig.js](epicConfig.js) correctly separates `projectStyleDir: './src/_includes'` from `outputFileName: 'style.css'`; the former is not a full filename. The scanner does not support PHP despite the config comment. `epic-build` always copies to `style.css`.

## Palette and future teaching examples

Edit [src/my-epic-css/_custom.scss](src/my-epic-css/_custom.scss), imported before `_variables.scss`. Its active palette uses white body text, `#0f172a` body background, and `#4f9eea` primary blue. Commented alternatives include teal/indigo and light blue/neutral palettes. Keep one complete set of eight color assignments active. The local color defaults have `!default`, so custom overrides win. Commenting out all overrides returns to the purple/green defaults in `_variables.scss`.

The [starter palette table](../epic-css-11ty-theme/README.md#palette-ownership) also describes this site's color variables: body/base text, `.clr-body-bg`, `.clr-primary`, `.clr-primary-bg`, `.clr-secondary`, `.clr-secondary-bg`, `.clr-white`, and the primary-light underline hover color. There is no standalone `.clr-body` or `.clr-primary-light`, shade generator, or runtime palette switch. Values become concrete CSS colors at Sass compilation.

For a small change: edit `_custom.scss`, compile once and preview with `npm start`; inspect text/background, links, hover and code blocks. Then stop watch, run `npm run build`, and inspect the filtered site. A site-only palette change requires no npm release. Shared Sass changes must be intentionally ported to the library and tested in consumers; no automatic synchronization exists.

Current `/docs/` has Flexbox and grid text/code and live grid markup. The `#colors` section now contains live primary/secondary callouts, a utility table, and a palette switching lesson. Future teaching work could add side-by-side palette swatches, examples of the existing color classes, and measured text/background contrast. A runtime theme selector and measured contrast comparisons remain future work.

## Release, hosting and validation

Netlify production is confirmed as `cdn-epic-css`, serving `https://epiccss.com/`, linked to this repository's `main`. Pushing main triggers deployment. `netlify.toml` now selects Node 22, `npm run build` and `_site`. After deployment, run `npm run verify:production` to check the exact published commit, five routes, the lesson, and all eight palette values. Follow [RELEASING.md](RELEASING.md): site → verify production → npm code/docs release → starter dependency/docs update.

Local validation passed: Sass compilation, actual installed `epic-build` and `epic-light`, then Eleventy to an isolated output directory (6 pages, 13 copied files). Generated include/pre-light files were restored after validation. A later isolated `npm ci`, validation and production build passed. Site commit `2a57d63` was deployed and verified on production. Browser visual review has not been performed; npm publication is blocked by a confirmed organizational restriction on public npm registry access, pending IT-approved access or an approved publishing environment.


## Repeatable build and validation

`npm start` now compiles Sass once before launching the watchers. `npm run build` compiles full Sass, runs the installed class filter, and writes Eleventy pages/assets to `_site`. `npm run validate` performs that same filtered build in a fresh `.epic-check-*` directory, checks output files, restores the previous CSS include and pre-light bytes in a finally block, and removes temporary output. Stop watchers first and run one build/validation at a time.

The previous temporary-directory EPERM is resolved in this runner by rendering output paths first and creating shared parents sequentially before Eleventy's concurrent writes. Both the starter (15 pages) and site (6 pages) now pass fresh filtered builds. This supersedes the earlier audit limitation; the legacy raw Eleventy command is unchanged. `build-production` remains Eleventy-only. `npm ci` and browser visual review have not been performed during this change.
