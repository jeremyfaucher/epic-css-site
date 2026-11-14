# Epic CSS documentation and demo site

Develop and document the shared utility library here, then port verified changes into the npm library and test its published release in the Eleventy starter. Follow [RELEASING.md](RELEASING.md) for the site → production → library release → starter workflow.

## Source ownership

- [src/my-epic-css/index.scss](src/my-epic-css/index.scss) imports the locally exposed utility partials: variables, font ramp, base, colors, images, grid and spacers, with custom palette overrides first. This is the editable library development copy. Updating npm does not replace these files automatically.
- Installed `epic-css` provides the shared `epic-build.js` and `epic-light.js` commands. Maintain shared JavaScript in the npm library source and test it through a consumer; do not copy that logic into the Sass directory or rely on disposable node_modules edits.
- [src/site-styles/index.scss](src/site-styles/index.scss) compiles documentation presentation separately. It reads the palette and loads [docs styling](src/site-styles/_docs.scss); it imports no utility implementation. Do not copy this folder into the npm library.
- Eleventy's `docsStyles` shortcode embeds that separate stylesheet only on documentation pages. The shared Sass entry and its full pre-light output remain free of docs styles.
- [src/_includes/docs.njk](src/_includes/docs.njk) is the shared docs layout. Topic pages live in [src/docs](src/docs/): overview, installation, Flexbox, grid, colors, typography and the changelog.
- [docs-example.njk](src/_includes/docs-example.njk) creates a live preview and escaped copyable code from the same markup. [docs.js](src/assets/js/docs.js) handles copying and legacy topic links.
- `.eleventy.js` reads `src` and writes `_site`. `base.njk` minifies and embeds the library CSS include; docs pages also get the independent site stylesheet. Homepage and starter-page content includes remain separate. Installation is maintained in `src/docs/installation/index.njk`; Netlify permanently redirects `/npm-custom-install/` there.

## Develop

The footer sitemap derives Site, Documentation, and UI examples groups from Eleventy's public HTML page collection. Give new pages a descriptive front-matter `title`; they appear automatically. Error/XML routes are excluded; set `sitemap: false` or `eleventyExcludeFromCollections: true` for nonpublic pages.

Follow [DEMO-COPY.md](DEMO-COPY.md) for short, meaningful teaching content in UI examples, including shared content ownership and copy checks.

The [Icons UI page](src/ui/icons/index.njk) renders 25 SVGs (21 original outlines and four Bootstrap Icons social/feed marks) from
`src/_data/icons.js`, with live pixel sizing, copy feedback and manual source
fallback. Original artwork is covered by this site's MIT license; the four Bootstrap Icons
v1.11.3 assets retain their upstream MIT notice in every copied SVG. See
[ICON-LICENSES.md](ICON-LICENSES.md) for provenance. Optional `.icon`, `.icon-16`, `.icon-24`, `.icon-32`
and `.icon-48` helpers live in the shared image partial and work independently of
the gallery, including with other SVG libraries. SVGs inherit `currentColor`;
decorative icons are hidden from assistive technology and icon-only controls need
an accessible action label. `npm run test:icons` checks the built page, standalone
module and copy/size behavior; `npm run validate` includes its markup checks.

From this directory:

```sh
npm ci
npm start
```

The prestart hook compiles library Sass once; npm-run-all then starts Eleventy serve and Sass watch. Follow the printed local URL, normally port 8080. Eleventy also watches the site-only docs stylesheet and palette source. No new dependency or library utility was added for documentation.

Stop watchers before running a production build or validation against the same directory:

```sh
npm run validate
npm run build
```

`build` compiles full library Sass, invokes the installed Epic class filter, then writes Eleventy pages/assets. `validate` uses temporary output, restores the existing CSS include and pre-light bytes, and removes its temporary directory. Windows cleanup retries transient locked-file errors; a remaining locked scratch folder is reported separately after CSS restoration, without masking actual build failures. `build-production` remains the legacy Eleventy-only command.

Both commands run [check-docs.cjs](scripts/check-docs.cjs), verifying isolated topics, active sidebar navigation, unique IDs, navigation targets, preview/code consistency, retention of example utilities in filtered CSS, sticky sidebar styles, the docs script asset, and separation of docs presentation from library CSS.

## Changelog

The [changelog page](src/docs/changelog/index.njk) at `/docs/changelog/` renders [CHANGELOG.md](CHANGELOG.md), an exact copy of the library's `CHANGELOG.md`. The library file is the source of truth; never edit the site copy directly. [changelog.cjs](scripts/changelog.cjs) parses it for [src/_data/changelog.js](src/_data/changelog.js) and fails the build on malformed entries: version or date order, unknown or misordered groups, stray list items, and link definitions that match no version.

During each feature/fix task, add its note to the library's `## [Unreleased]`
section, not to an already published release. Add a planned version to the
heading only when a target is agreed; it has no date or npm link.
Keep package/lockfile versions and the theme's independent version unchanged
until an explicit release request.
See [RELEASING.md](RELEASING.md) for finalizing the heading and release date.

After editing the library changelog, with the library checked out at `../epic-css` (or `EPIC_CSS_DIR` set to its path), run:

```sh
npm run changelog:sync
npm run validate
```

`validate` runs [test-changelog.cjs](scripts/test-changelog.cjs) first, then fails if the copies differ. `build` only warns about a stale copy. Both skip the comparison when no library checkout exists, as on Netlify. `npm run changelog:check` runs the comparison alone.

Release links come from the changelog's link definitions: `[X.Y.Z]` becomes the GitHub release, commit, or compare link, and an optional `[X.Y.Z-cdn]: https://…` becomes a "CDN stylesheet" link for that version. Add a CDN definition only after that versioned asset is published, and keep definitions for retained older versions. The npm link is generated for every released version.

## Pre-light and utility coverage

Spacing tokens (`$spacer` and `$spacers`) live in the centralized `_variables.scss` alongside the other tokens. Keep variables early in the entry point and `_spacers.scss` last so tokens are available before utilities are generated. For selective spacing imports, import variables first, apply any custom `$spacers` map, then import spacers. The generator reads that shared scope; it has no separate defaults module.

Pre-light is the whole compiled stylesheet from the selected library Sass imports. The light command compares literal source class attributes against it and writes a filtered version. Both paths use [epicConfig.js](epicConfig.js). The legacy `epic-build` and `epic-light` commands remain available; the full-build copy hardcodes `style.css`, while the filter honors `outputFileName`.

The current scanner reads `.html`, `.njk`, and `.md`; it does not evaluate templates or directly scan `.php`. Generated CSS can be used in PHP and WordPress independently of that scanner. It uses substring selector matching, keeps whole matching media blocks, changes rule ordering, and has no configured safelist. Check dynamic states and responsive layouts after filtering. The docs deliberately describe current output, including the grid minimum widths and existing sidebar-breakpoint behavior, rather than adding utilities to hide gaps.

Old `/docs/#flexbox`, `#grid`, and `#colors` links redirect client-side to separate topic pages; the overview supplies normal links without JavaScript. Desktop docs navigation is sticky and mobile links wrap. Example tile decoration is site-specific and is distinguished from the utility classes being taught.

## Release and production

Production is the existing Netlify site `cdn-epic-css`, linked to this repository's `main`, serving `https://epiccss.com/`. `netlify.toml` specifies Node 22, `npm run build`, and `_site`. After pushing and deploying, run:

```sh
npm run verify:production
```

The read-only gate checks the exact published commit, docs navigation and topic pages, existing routes/assets, and all eight palette values on the Colors page. Library releases are a separate action: the assistant prepares reviewed commits; the user publishes a GitHub release, triggering the library's trusted npm publishing workflow. This documentation-only update needs no new npm release. See [RELEASING.md](RELEASING.md) for registry availability and consumer-update details.

Code blocks are highlighted at build time using the already installed syntax plugin. Give snippets a `language-html`, `language-scss`, `language-javascript`, `language-json`, or `language-bash` class (or use a labeled Markdown fence). File trees use `language-text` and remain plain. The transform preserves the exact text/newlines used by the copy button; `node scripts/test-highlight.cjs` checks that behavior and HTML escaping. Color styles live in `src/site-styles/_code.scss`, separate from the utility library, and load on all site pages. No browser highlighter or new dependency is shipped.

The Typography reference is generated by `src/_data/typography.js` from a fresh complete library compile. It lists only emitted font-size, line-height and weight classes and resolves the default/mobile variable values. `node scripts/test-typography.cjs` checks the current responsive mappings and documented scale boundaries. Documentation heading styles target direct article children so they do not override the utilities demonstrated inside previews. The page documents existing behavior; it does not fill gaps in the library's heading tokens or add font utilities.

## Light and dark mode

The workshop defaults to dark. The header's native Dark mode toggle sets
`html[data-theme]` to light or dark and stores an explicit choice under
`epic-css-theme` in local storage. A valid saved value is applied by
`src/_includes/theme-init.js` in the head before CSS loads. Missing/invalid or
blocked storage uses dark; toggling still works without storage. OS color
preferences are deliberately ignored. With JavaScript disabled, dark remains and
the toggle stays hidden. Changes in another tab update the current page.

Choose `$palette-name: "Harbor";` (blue), `$palette-name: "Dusk";`
(charcoal/lavender), or `$palette-name: "Neon";` (black/coral/teal) near the top of `src/my-epic-css/_custom.scss`, then rebuild Sass.
Neon is selected in this checkout for review. It uses black and charcoal surfaces
with bright coral and teal accents in dark mode, and warm near-white surfaces
with deeper coral and teal in light mode. Harbor and Dusk remain available. Each record in the local `$palettes` map contains its own light/dark pair. The
selected pair supplies `$color-modes` and the legacy Sass defaults; the runtime
button only selects its mode. There is no runtime palette picker. These three presets form the finished set;
customize a complete pair in that same file and select its exact name. Unknown
names, missing modes/roles and non-white white roles fail compilation. Saved
commented alternatives are intentionally retained, including their original
values when active presets use darker accents for readability.

Every variant needs body,
body-bg, primary, primary-light, primary-bg, secondary, secondary-bg and the quoted
`"white"` role (Sass treats unquoted white as a color). Keep white as white in both
site modes. The light hover/secondary colors are darker than the old sample;
check actual text, surfaces and focus indicators whenever changing a palette.

The import hierarchy remains custom overrides, central variables, then utilities.
Keep the library's `!default` markers: they preserve values assigned earlier.
`_colors.scss` emits semantic `--clr-*` properties; base rules and existing
utilities consume them with legacy Sass fallbacks. `$color-modes: ()` leaves a
consumer on its own single palette. The library's default purple/green palette
is unchanged; site branding and toggle logic are not synced into other consumers.
Docs borders and syntax highlighting also follow the selected mode. SVG outlines
using currentColor inherit it; fixed artwork and demonstration gradients do not.

See [Colors and palettes](src/docs/colors/index.njk). Run `npm run test:theme`
for paired CSS, filtered-mode preservation, selected contrast pairs and simulated
state/storage tests; `npm run validate` includes CSS/rendered-control checks.
Browser visual/keyboard inspection is still needed for a complete review.
