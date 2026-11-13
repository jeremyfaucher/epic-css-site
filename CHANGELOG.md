# Changelog

All notable changes to the [`epic-css`](https://www.npmjs.com/package/epic-css) package are recorded here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

This file is the source of truth for release notes. The Epic CSS site keeps an identical copy and publishes it at <https://epiccss.com/docs/changelog/>. Follow "Release notes" in the README when adding a version.

Dates are UTC: npm publication dates through 0.14.0, then GitHub release publication dates, which trigger the npm publish workflow. Entries before 0.14.1 were reconstructed in November 2026 from this repository's commits and the npm version list. Where npm versions have no matching commit, the entry says so rather than guessing. Version 0.8.0 was never published.

## [Unreleased] - 0.14.4

### Added

- Workshop author/sidebar profile example with wrapping portrait/text row, full-width bio and labeled demo social links. The site-only Icons gallery adds X, LinkedIn, GitHub and RSS from Bootstrap Icons v1.11.3 with retained MIT notices.

- Semantic `--clr-*` runtime color properties and optional complete light/dark `$color-modes` pairs, preserving central Sass defaults and existing utility names. The workshop adds a persisted, keyboard-operable Dark mode toggle; other consumers keep their own palettes.
- Named Harbor (blue), Dusk (charcoal/lavender) and Neon (black/coral/teal) workshop presets, each with light/dark modes selected at build time through `$palette-name` in the site's custom Sass. Saved original palette references remain available.
- Optional SVG helpers in the image module: `.icon` for inline alignment and flex-shrink prevention, and `.icon-16`, `.icon-24`, `.icon-32`, `.icon-48` for explicit pixel dimensions. The helpers work with any SVG collection and include no icon assets.
- Workshop Icons page with 21 original outline SVGs, live sizing, copy controls and labeled interface examples.

### Changed

- Moved the workshop theme toggle to the right side of the wrapping header navigation and reduced its padding and filled-button emphasis, preserving dark defaults and saved light/dark choices.

- Deepened the Neon light secondary surface to separate nested primary-surface cards from their example preview backgrounds, retaining the existing card markup and accent colors.

- The npm publish workflow retries its post-publish install check while the registry makes a new version available.

## [0.14.3] - 2026-11-12

### Added

- `.btn` button base: inline-flex alignment, current-color border, 4px radius, inherited font and color, a `:focus-visible` outline and a `:disabled` state.
- `.btn-primary` and `.btn-secondary` variants using the palette text and background colors.
- `.grid-sidebar-right-344`: one column that becomes main content plus a 344px right sidebar from 1040px.
- `.flex-2` (`flex: 2`).

### Changed

- The base reset targets only `h1`–`h6` and sets `line-height: normal` on them. `p` and `ul` no longer receive the zero margin and padding reset.
- Article typography (heading sizes, paragraph and list spacing) applies only to `article.post`, not every `article`. Add the `post` class to keep these styles.
- The publish workflow installs the newly published version in a temporary project to verify it.

## [0.14.2] - 2026-11-11

### Added

- From a module checkout, `npm run build` and `npm run epic-compile` compile the full library into `build/<package-version>.css` with a matching source map that embeds the Sass sources. Older versioned files are kept.
- `test/build.cjs` checks the versioned filename, portable map reference, retained older artifacts and compilation failures. `npm test` runs it with the palette test.
- `.flex-md` (flex from the `md` breakpoint, 820px) and `.flex-1`.
- Sidebar grid utilities: `.grid-sidebar-left` (one column), `.grid-1fr-4fr-md` (`1fr 4fr` from 820px, stacking again from 960px to 1024px), and `.lg-grid-sidebar-left-25`, `-30` and `-40` (percentage left column wider than 1024px).

### Changed

- `$container-width` is a `!default`, so a value assigned before importing the library is kept.
- `body` margin is `0` instead of `3px`.
- The automatic bottom margin on post images uses `:where(.post) img` instead of `article img`, so explicit margin utilities override it.

## [0.14.1] - 2026-11-06

Prepared from the published 0.14.0 source.

### Added

- Compiled CSS regression checks for default colors and consumer overrides. `npm test` runs them, and `prepublishOnly` runs the tests before publishing.

### Changed

- Document actual palette utilities, source-filter limitations and the site-first release workflow.
- Limit package contents to Sass source, the two build/filter scripts, the regression test and documentation; generated pre-light CSS and maps are no longer published.
- Publish from GitHub releases through the npm trusted-publishing workflow.

### Fixed

- Preserve all eight consumer palette values assigned before importing the library by declaring fallback colors with `!default`.

## [0.14.0] - 2025-03-24

Published without a matching commit in this repository, so changes in 0.12.0, 0.13.0 and 0.14.0 cannot be separated. Compared with the 0.11.0 source, the published 0.14.0 source has these changes.

### Added

- Font ramp utilities `fs-12` to `fs-96`, `lh-12` to `lh-96`, `fw-400`, `fw-600`, `fw-700`, `lh-normal` and `text-nowrap`, backed by `:root` custom properties that change at 1084px and narrower.
- Article heading sizes from the font-ramp properties, plus heading, paragraph and list spacing inside `article`.
- `ul.list-none` to remove list bullets.
- An empty `_custom.scss` partial.
- `epic-light` scans `.md` files, always keeps `:root` rules and writes to `outputFileName` from `epicConfig.js`.

### Changed

- `index.scss` imports the font ramp before base styles.
- The base reset sets margin and padding to `0` on headings, `p` and `ul`. Lists keep their bullets unless `list-none` is used.

### Removed

- `text-xs`, `text-sm`, `text-lg`, `text-xl`, `font-bold` and the `$text-*` variables.
- `.h1`–`.h4` and `.lh-0`.
- Global `li` margins and the `main` paragraph, `h2` and `iframe` margins.

## [0.13.0] - 2025-03-21

Published without a matching commit in this repository. See 0.14.0 for the combined changes after 0.11.0.

## [0.12.0] - 2025-03-20

Published without a matching commit in this repository. See 0.14.0 for the combined changes after 0.11.0.

## [0.11.0] - 2025-03-19

0.9.0 and 0.10.0 have no matching commits, so this entry includes all changes since 0.7.0.

### Added

- `.clr-white` and `$clr-white`, `.border-none`.
- `.flex-col-reverse`, `.flex-basis-300` and `.left-sidebar-sm` (a sidebar grid from 756px).
- `.position-relative`, `.position-absolute`, `.overflow-x-auto`, `.scroll-snap-x-mandatory`, `.snap-start`, `.scroll-smooth`, `.cursor-pointer`, `.z-100` and `.lh-0`.
- Bottom margins for list items, including Markdown list items containing paragraphs.

### Changed

- Paragraph and `h2` spacing applies only inside `main`, no longer `article`; `iframe` elements in `main` get a bottom margin.
- Code blocks scroll horizontally only.

### Removed

- `a.underline-clr` styles.
- Unused shade variables such as `$clr-primary-dark`, `$clr-secondary-dark` and their background variants.

## [0.10.0] - 2025-03-10

Published without a matching commit in this repository. Its changes are included in the 0.11.0 entry.

## [0.9.0] - 2025-03-10

Published without a matching commit in this repository. Its changes are included in the 0.11.0 entry.

## [0.7.0] - 2024-06-08

0.5.0 and 0.6.0 have no matching commits, so this entry includes all changes since 0.4.0.

### Added

- `.clr-primary-bg`, `.clr-secondary-bg`, `.border-r-4` and `.border-r-16`.
- `$clr-body` for body and link text color.
- Link styles in `main` and `article`, circle bullets for article lists, and styled `pre` and inline `code`.
- Spacing scale `$spacers` in rem: 0, 4, 6, 8, 10, 12, 16, 18, 20, 24, 32, 40, 56, 60, 64, 80 and 100.

### Changed

- New default palette: `#2e106a` background, `#ffffff` text, `#00d886` primary and `#c6c9e5` secondary.
- Gap, padding and margin utilities are generated from `$spacers`; the `2` step was removed.
- `.grid-col-2` and `.grid-col-3` auto-fit columns at all widths (minimum 331px and 270px) instead of only from 900px.
- `epic-light` keeps each matching media query block once, after other rules.
- The package homepage is <https://epiccss.com>.

## [0.6.0] - 2024-05-27

Published without a matching commit in this repository. Its changes are included in the 0.7.0 entry.

## [0.5.0] - 2024-05-23

Published without a matching commit in this repository. Its changes are included in the 0.7.0 entry.

## [0.4.0] - 2024-03-04

### Added

- `_variables.scss` settings for heading sizes and weight, body size and line heights, body background, and primary and secondary colors.
- Spacing step `6`.

### Changed

- Palette variables use a `$clr-` prefix.
- `a.underline-clr` became `a.clr-underline`, and `.bg-color` became `.clr-body-bg`.
- `epic-light` always keeps `pre` and `code` styles.

### Removed

- `.bg-black`.

## [0.3.0] - 2024-02-26

### Added

- `epic-build` and `epic-light` package scripts, configured by a project `epicConfig.js`, to compile the full stylesheet and filter it to classes used in project files.
- `$container-width` (default `1000px`) for `.container`.
- Body font size, and article list styles.

### Changed

- `_spacing.scss` was renamed to `_spacers.scss`.

## [0.2.0] - 2024-02-20

First version with source in this repository.

### Added

- Sass partials for base styles, font ramp, colors, images, grid and flexbox, and spacing, with `src/index.scss` importing them all.
- Draft build and class-filter scripts.
- README installation guide.

## [0.1.0] - 2024-02-12

First npm publication. The repository has no source or notes for this version.

[Unreleased]: https://github.com/jeremyfaucher/epic-css/compare/v0.14.3...HEAD
[0.14.3]: https://github.com/jeremyfaucher/epic-css/releases/tag/v0.14.3
[0.14.2]: https://github.com/jeremyfaucher/epic-css/releases/tag/v0.14.2
[0.14.1]: https://github.com/jeremyfaucher/epic-css/releases/tag/v0.14.1
[0.11.0]: https://github.com/jeremyfaucher/epic-css/commit/df584f133f5d683c86fc7b629b5702dab3cad979
[0.7.0]: https://github.com/jeremyfaucher/epic-css/commit/1ace3b9df91671497429f6ac03828afbb3c6ac04
[0.4.0]: https://github.com/jeremyfaucher/epic-css/commit/effa01bcc6d3b460259c83d10e7edd3860cb5178
[0.3.0]: https://github.com/jeremyfaucher/epic-css/commit/407166fddc54d4987a1c61598cfe901454a4f712
[0.2.0]: https://github.com/jeremyfaucher/epic-css/commit/2579937b152ae23286c467b6e6f5dfb97ea2b1a0
