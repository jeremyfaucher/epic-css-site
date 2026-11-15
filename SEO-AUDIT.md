# Epic CSS SEO audit

Audit date: November 14, 2026 (America/Los_Angeles). Scope: Epic CSS website only; no starter-theme changes, publishing, Search Console access, or traffic measurements.

## Verified production findings and local fixes

Canonical production origin: https://epiccss.com. Confirmed by the repository's production verification script and live HTTP/www redirects, not the old site.json value.

| Priority | Verified before changes | Local correction |
| --- | --- | --- |
| High | Live /robots.txt advertises https://yoursite.com/sitemap.xml. | One all-crawler group allows public crawling and advertises https://epiccss.com/sitemap.xml. |
| High | Live sitemap exists, but all 19 locations use design2seo.com, including /404.html. | Sitemap now lists exactly 18 public canonical Epic CSS HTML URLs; excludes 404/non-HTML/excluded pages. Filesystem/build dates are omitted rather than presented as content modification dates. |
| Medium | All 18 audited production pages lack canonical tags. This is a missing consolidation signal, not proof that Google chose the wrong canonical. | One absolute self-canonical on every public page. |
| Medium | Seven UI pages use the unrelated “11ty Theme” title suffix. Homepage description contains “managae” and is verbose. | All public titles use Epic CSS branding and descriptive page-specific topics; homepage/theme descriptions refreshed. Existing accurate topic descriptions retained. Metadata is HTML-escaped. |
| Medium | /11ty-theme/ has no H1. | Added one descriptive H1 without changing page navigation titles elsewhere. |
| Low | 404 was included in sitemap and had placeholder copy. | Removed from sitemap, marked noindex, and supplied useful home/docs links. A live nonexistent URL already returns a real HTTP 404. |
| Low | Local _site retained four old generated HTML pages that are absent from the current Eleventy inventory. | Removed only those obsolete generated HTML files (old copy, npm route, ui-library route, rendered asset README); no source content deleted. |
| Low | Netlify config contains an obsolete unrelated Netlify-domain rewrite to design2seo.com. | Removed that legacy rule; retained the installation 301. |

## Live HTTP and crawl observations

Read-only direct HTTPS requests succeeded outside the restricted sandbox. The web search fetch initially returned a four-month-old cached homepage; it was not used as evidence of the current deployed version. Current direct checks found:

- All 18 current public routes return HTTP 200 with HTML, a title, and a nonempty description. No meta robots noindex or X-Robots-Tag exclusion was returned on them.
- HTTP apex redirects to HTTPS apex with 301. HTTPS www redirects to HTTPS apex with 301.
- /npm-custom-install/ returns 301 to /docs/installation/; the target returns 200.
- /robots.txt and /sitemap.xml return 200 with text/plain and application/xml respectively, but still contain the incorrect production values described above.
- An intentionally nonexistent path returns HTTP 404 rather than a soft-404 200 response.
- Existing robots rules do not block the public docs/UI routes. The misleading sitemap references impair discovery signals but do not constitute a blanket noindex.

All fixes remain local. Production still has the audited old metadata/sitemap/robots until a reviewed deployment occurs. No deployment was performed. The starter-theme build and source were left alone for this SEO work.

## Local verification

The site build now runs scripts/check-seo.cjs against the current Eleventy page inventory. It checks 18 unique nonempty titles/descriptions, correct branding, one self-canonical and H1 per public page, no public noindex, matching sitemap membership/origin, robots advertisement, noindex 404, valid internal destinations, and reachability from the homepage. Sitemap URLs contain no 404 or duplicates. Existing docs/UI/theme/copy checks remain in place. Fresh temporary validation also exercises the SEO checks, avoiding misleading stale output.

All 18 local public pages are linked from the HTML navigation/footer; there are no orphan pages or missing local link destinations in this inventory. A sitemap supplements these links rather than replacing them.

## Current local metadata inventory

Descriptions remain page-specific; title/description lengths are not treated as fixed Google limits. Google can rewrite displayed titles/snippets depending on the query.

| Route | Title | Meta description |
| --- | --- | --- |
| / | Epic CSS - Utility-first CSS library | Build responsive layouts with Epic CSS utilities for spacing, typography, and color. Explore copyable examples, Sass customization, and the Eleventy starter theme. |
| /11ty-theme/ | Eleventy blog starter theme - Epic CSS | Start an Eleventy blog with Epic CSS utilities, responsive layouts, and customizable Sass colors. Preview the theme and follow the setup guide. |
| /docs/ | CSS utility documentation - Epic CSS | Install Epic CSS and learn its existing layout and color utilities. |
| /docs/changelog/ | Package changelog - Epic CSS | Release history for the epic-css package, newest first, with dates and changes for each version. |
| /docs/colors/ | CSS colors and light/dark palettes - Epic CSS | Use Epic CSS semantic color utilities and customize eight Sass palette values. |
| /docs/flexbox/ | CSS Flexbox utilities - Epic CSS | Use Epic CSS flex direction, alignment, wrapping and gap utilities. |
| /docs/grid/ | CSS Grid and sidebar utilities - Epic CSS | Build Epic CSS auto-fitting grids, containers and sidebar layouts. |
| /docs/images/ | Responsive image and SVG utilities - Epic CSS | Responsive images, rounded corners, centering classes, and optional inline SVG icon sizing in Epic CSS. |
| /docs/installation/ | Install Epic CSS with npm, Sass, or CDN - Epic CSS | Use Epic CSS from the CDN, or install the package for Sass customization and optional project-specific light CSS. |
| /docs/typography/ | CSS typography utilities - Epic CSS | Use the existing Epic CSS font-size, line-height, weight and text utilities. |
| /docs/wrapper-and-container/ | CSS wrapper and container utilities - Epic CSS | Compose percentage gutters, a centered maximum width, and inner flex or grid layouts with Epic CSS. |
| /ui/ | Copyable CSS UI examples - Epic CSS | Reusable interface examples built with existing Epic CSS utilities. |
| /ui/buttons/ | CSS links and buttons - Epic CSS | Palette-based links and base, primary, and secondary buttons with copyable HTML. |
| /ui/cards/ | Responsive CSS card examples - Epic CSS | Copy vertical, horizontal and author profile cards built from shared Epic CSS example templates. |
| /ui/heroes/ | Responsive CSS hero examples - Epic CSS | Responsive hero layouts built with Epic CSS flex utilities. |
| /ui/icons/ | Copyable SVG icon examples - Epic CSS | Copyable interface, social and feed SVG icons, optional pixel sizing utilities, and labeled interface examples. |
| /ui/layouts/ | Responsive CSS layout examples - Epic CSS | Reusable responsive layouts for arranging images, text, and other components with Epic CSS. |
| /ui/sliders/ | CSS scroll slider and logo marquee examples - Epic CSS | Three design studies in a tab-controlled scroll-snapping slider built with Epic CSS utilities. |

## What remains to determine why traffic is low

Technical cleanup is justified, but it does not prove the cause of low traffic. A site: query is not an exhaustive index count, and a valid sitemap does not guarantee crawling, indexing, or ranking.

After deploying and verifying the fixes:

1. In the epiccss.com Search Console property, submit /sitemap.xml and check its fetched status, discovered URL counts, and last read. Confirm no obsolete yoursite.com sitemap remains submitted.
2. Inspect the homepage, /docs/installation/, one other docs topic, and /ui/buttons/. Record indexed status, crawl permission, last crawl, user-declared canonical, Google-selected canonical, and live-test results. Request indexing for representative updated pages if appropriate.
3. Export Page indexing reasons (especially discovered/crawled currently not indexed, duplicate/canonical, redirects, blocked, and errors), plus Crawl stats/server availability. Do not classify pages from search-result counts.
4. Compare Performance clicks/impressions/CTR/position by page and query over comparable periods. Low impressions on indexed pages may concern demand, relevance, competition, or external discovery; low CTR is a different diagnosis. None of these causes has been established without the actual reports.
5. Verify post-deploy HTTP 200 pages, canonical targets, sitemap/robots contents, 301 host/legacy redirects, and real 404 response again. Account for recrawl time; do not expect immediate search-result changes.

## References

- [Live robots.txt](https://epiccss.com/robots.txt) and [live sitemap](https://epiccss.com/sitemap.xml): direct HTTP observations above, prior to any deployment.
- [Google: site: operator limitations](https://developers.google.com/search/docs/monitor-debug/search-operators/all-search-site).
- [Google: sitemaps and their limits](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview).
- [Google: canonicalization signals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).
- [Google: descriptive titles](https://developers.google.com/search/docs/appearance/title-link) and [meta descriptions/snippets](https://developers.google.com/search/docs/appearance/snippet).
