# Epic CSS documentation and demo site

Develop and document the shared utility library here, then port verified changes into the npm library and test its published release in the Eleventy starter. Follow [RELEASING.md](RELEASING.md) for the site → production → library release → starter workflow.

## Source ownership

- [src/my-epic-css/index.scss](src/my-epic-css/index.scss) imports the locally exposed utility partials: variables, font ramp, base, colors, images, grid and spacers, with custom palette overrides first. This is the editable library development copy. Updating npm does not replace these files automatically.
- Installed `epic-css` provides the shared `epic-build.js` and `epic-light.js` commands. Maintain shared JavaScript in the npm library source and test it through a consumer; do not copy that logic into the Sass directory or rely on disposable node_modules edits.
- [src/site-styles/index.scss](src/site-styles/index.scss) compiles documentation presentation separately. It reads the palette and loads [docs styling](src/site-styles/_docs.scss); it imports no utility implementation. Do not copy this folder into the npm library.
- Eleventy's `docsStyles` shortcode embeds that separate stylesheet only on documentation pages. The shared Sass entry and its full pre-light output remain free of docs styles.
- [src/_includes/docs.njk](src/_includes/docs.njk) is the shared docs layout. Topic pages live in [src/docs](src/docs/): overview, installation, Flexbox, grid, colors and typography.
- [docs-example.njk](src/_includes/docs-example.njk) creates a live preview and escaped copyable code from the same markup. [docs.js](src/assets/js/docs.js) handles copying and legacy topic links.
- `.eleventy.js` reads `src` and writes `_site`. `base.njk` minifies and embeds the library CSS include; docs pages also get the independent site stylesheet. Existing homepage, old npm-install page and starter-page content includes remain separate from this docs pass.

## Develop

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

## Pre-light and utility coverage

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
