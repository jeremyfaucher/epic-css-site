# Shared card examples

The image-right variant keeps image-first HTML for mobile and applies `order-lg-last` to its image link wrapper. From 960px it moves visually after the content, matching the `flex-lg` breakpoint. Both horizontal variants therefore stack image above copy below large.

- Edit `vertical.njk`, `horizontal.njk` (image left), or `horizontal-right.njk` to change a variant's utility markup. Horizontal variants use `flex-lg` with equal `flex-1` children; their images fill their column with `w-100` while keeping their aspect ratio. HTML order determines mobile reading order.
- Edit `parts.njk` for shared image/content markup and `src/_data/cardExample.js` for shared sample content.
- Both `src/ui/cards/index.njk` and `src/_includes/card-showcase.njk` capture these templates once per variant. The captured HTML supplies both the live preview and escaped copyable code through `ui-example.njk`.
- Rebuild with `npm run build` after editing examples or site `src/my-epic-css` utilities. This refreshes both surfaces and filtered CSS; `npm run validate` checks preview/code and cross-page parity without retaining generated CSS changes.
- The homepage showcase only controls which example and code block are visible. Keep card markup in these components, not in its interaction wrapper.
- Review prose docs and sync/version the portable library separately when intentional utility changes are ready. These steps are not automatic.

Follow [the demo-copy workflow](../../../../DEMO-COPY.md) when writing sample content. The shared card links to the existing layout guide. The vertical card retains its original inline width cap because the library has no matching max-width utility.

## Sidebar author profile

`author.njk` and `src/_data/authorExample.js` own the Cards-only author example.
It is unboxed, capped at 344px, and designed for a 268px sidebar; the portrait/text
row wraps in tighter space while the bio remains below it. The neutral avatar is
original site artwork. Demo links use example.com and must be replaced by real
profile/feed URLs. SVGs come from shared Icons data. The displayed card code omits repeated notices;
Copy HTML includes one consolidated Bootstrap Icons MIT notice for the complete
card. This is disclosed beside the example, and the clipboard-denial fallback
selects the complete licensed payload. Standalone gallery SVGs keep their own
notices. See [ICON-LICENSES.md](../../../../ICON-LICENSES.md).
The few inline dimensions travel with the copied markup; no new utility module
or runtime script is needed. The theme About page reuses the licensed profile markup in its 344px left sidebar. The homepage is unchanged.
