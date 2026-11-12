# Shared card examples

- Edit `vertical.njk`, `horizontal.njk` (image left), or `horizontal-right.njk` to change a variant's utility markup. Horizontal variants use `flex-md` with equal `flex-1` children; their images fill their column with `w-100` while keeping their aspect ratio. HTML order determines mobile reading order.
- Edit `parts.njk` for shared image/content markup and `src/_data/cardExample.js` for shared sample content.
- Both `src/ui/cards/index.njk` and `src/_includes/card-showcase.njk` capture these templates once per variant. The captured HTML supplies both the live preview and escaped copyable code through `ui-example.njk`.
- Rebuild with `npm run build` after editing examples or site `src/my-epic-css` utilities. This refreshes both surfaces and filtered CSS; `npm run validate` checks preview/code and cross-page parity without retaining generated CSS changes.
- The homepage showcase only controls which example and code block are visible. Keep card markup in these components, not in its interaction wrapper.
- Review prose docs and sync/version the portable library separately when intentional utility changes are ready. These steps are not automatic.

Follow [the demo-copy workflow](../../../../DEMO-COPY.md) when writing sample content. The shared card links to the existing layout guide. The vertical card retains its original inline width cap because the library has no matching max-width utility.
