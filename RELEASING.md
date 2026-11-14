# Site-first release workflow

During feature/fix work, add consumer-facing notes to the library's planned
Unreleased section immediately, then sync the site copy. Keep package and lockfile
versions unchanged until release preparation is explicitly requested. An upcoming
version has no release date and is not a publication. Independent theme versions
remain separate. These release steps are not standing authorization to commit,
tag, publish or deploy.

1. Develop and validate the Epic CSS site with `npm run validate`, review/commit/push its `main`.
2. Netlify builds with Node 22, `npm run build`, output `_site`. After deployment, run `npm run verify:production`: it checks the exact published site HEAD, the docs topic routes, existing site routes, and all eight palette values. Visually review changed layouts/interactions too.
3. Port verified shared source and relevant usage docs into `jeremyfaucher/epic-css`. Keep consumer palettes separate from library defaults. Record each feature/fix as it happens under `## [Unreleased]` in the library's `CHANGELOG.md`, adding a planned version only when agreed (see its README "Release notes"). Run package tests, inspect the pack contents, and test a candidate in a disposable consumer. Commit/push only reviewed source; preserve unrelated working edits.
4. Only when release preparation is explicitly requested, rename the Unreleased heading to `## [X.Y.Z] - YYYY-MM-DD` (the actual UTC release date), add a new empty `## [Unreleased]` heading, with the next target only if agreed, and update the link definitions (`[X.Y.Z]` to the release tag, `[Unreleased]` to compare from the new tag). Commit this with the version bump. Then run `npm run changelog:sync` and `npm run validate` here and commit the synced `CHANGELOG.md`.
5. The **user creates/publishes the GitHub release** for the reviewed package version. The assistant does not create another release or run a local publish as part of consumer updates.
6. The library's `.github/workflows/npm-publish.yml` runs Node 22 tests, then publishes using npm 11 and OIDC trusted publishing. Check both jobs succeeded and confirm the published version/artifact.
7. Install the actual published version in the starter and site through the approved configured registry, review manifest/lockfile changes, verify palette overrides and the full filtered build, then commit/push. Do not substitute a local candidate for published-artifact verification. Re-run the site's production gate after its deployment; it checks that `/docs/changelog/` shows the latest release.

## Trusted publisher configuration

The npm trusted publisher must match exactly:

- GitHub owner: `jeremyfaucher`
- Repository: `epic-css`
- Workflow filename: `npm-publish.yml`
- Permission: **Allow npm publish**, not staging-only permission

The workflow triggers on `release: published`, grants `contents: read` and `id-token: write`, runs `npm ci` and `npm test`, then installs npm 11 and runs `npm publish`. The initial staging-only permission caused E403; allowing npm publish resolved it. The user confirmed successful publication of 0.14.1. No local npm token/login or new package release is needed merely to update consumers.

## Consumer update commands

Once the approved registry exposes the released version, run inside each consumer:

```sh
npm install epic-css@0.14.1 --save-exact
node -p "require('./node_modules/epic-css/package.json').version"
node node_modules/epic-css/test/palette.cjs
npm run validate
```

Also verify the starter's compiled `.clr-primary` is `#4f9eea` and `.clr-body-bg` is `#0f172a`, then preview affected pages. Review the lockfile's version, resolved artifact and integrity before committing. Keep existing user content and generated CSS edits out of the upgrade commit. The regression command tests library defaults/overrides; the consumer build separately checks its integration.

## Approved registry availability

This machine installs through `https://packagefeedproxy.microsoft.io/npm/`. Direct npm registry access is blocked by organizational policy; do not bypass it, weaken TLS, or attempt alternative routing. The configured proxy currently returns E404/ETARGET for `epic-css@0.14.1`, including with a fresh local metadata cache. Ask the registry administrators to expose/refresh the already published version, then repeat the consumer update. A browser npm login will not fix mirror availability. Do not fabricate a lockfile or pin an unavailable artifact.

The earlier locally packed 0.14.1 candidate passed all 15 starter pages and palette tests. That remains candidate validation, not a test of the final newly published artifact. The actual starter upgrade is pending registry availability; its manifest and lockfile remain unchanged after the failed installation.

## Hosting and daily commands

Production is Netlify site `cdn-epic-css`, ID `76ae57fc-00f3-460c-bf44-f2cc8458f1c4`, linked to the site repository's `main`, serving `https://epiccss.com/`. Git-driven deployment and the production gate have been verified. The historical site name does not mean it is only a CDN. Direct Netlify CLI login is unnecessary for this path.

Use `npm start` for development, `npm run build` for Sass/filter/Eleventy, and `npm run validate` for temporary output with restored CSS. Stop watchers first. `build-production` is the legacy Eleventy-only command. The aggregate `node validate.cjs` is a local convenience outside these repositories.

The class filter uses literal source attributes and substring matching; preview dynamic classes and responsive layouts after filtering. Palettes are compile-time Sass values. The CDN remains a separate release surface with no verified upload configuration here. When versioned CDN assets exist, add `[X.Y.Z-cdn]: https://…` definitions to the library changelog so the site's changelog links each release to its stylesheet; keep the definitions for retained older versions.
