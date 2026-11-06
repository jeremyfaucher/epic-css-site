# Site-first release workflow

Develop shared styles and documentation here first. The order is:

1. Run `npm run validate`, review the diff, commit, and push this site's `main`.
2. Deploy this repository to the existing Epic CSS Netlify site. `netlify.toml` specifies Node 22, `npm run build`, and `_site`. A Git push only deploys if the repository is connected to that Netlify site; otherwise use its authenticated deployment controls. Do not create a replacement site or guess a site ID.
3. Run `npm run verify:production` after Netlify reports the deployment ready. This checks the exact site HEAD against Netlify's published production revision, five live routes, the colors lesson, and all eight compiled palette values. It exits nonzero when production is still on an older commit. For a specific revision, pass its full SHA after `--`. Do not advance the package release on the basis of a successful local build alone. Also visually review changed layouts and interactions.
4. Port the verified shared Sass or relevant documentation into the `epic-css` npm repository. Site-only content does not need to be copied wholesale into the package README. Include a concise explanation of new utilities/palette behavior and consumer build commands where applicable. Inspect `npm pack --dry-run` and test a packed candidate in a disposable starter before publishing.
5. Check the registry's current version and authenticated publisher, choose the next unused version appropriate to the change, and publish only a reviewed package tree. Never publish the mixed working directory just because its version looks newer. The local library currently includes pre-existing changes beyond the palette fix; review or isolate those before release.
6. Update the starter's dependency and lockfile to the released version, propagate relevant usage documentation/examples, then run its validation and preview before committing/pushing it. The starter already has the build runner; it does not yet consume a newly published palette fix.

Use `npm start` for development; stop watchers before build/release checks. `npm run validate` restores existing generated CSS, while `npm run build` produces deployable `_site` output and intentionally updates generated CSS. The historical `build-production` command only runs Eleventy.

From the local aggregate folder, `node validate.cjs` validates the library, site, and starter. That folder is outside these repositories; component commands are the portable interface.

The scanner filters literal source classes using substring matches, not complete selector analysis. Preview responsive layouts and dynamically assembled classes after filtering. The palette is selected at Sass compile time, not by a browser theme toggle.

The CDN is a separate release surface. No verified CDN deployment configuration exists here; do not claim an npm release updates CDN files automatically.

## Confirmed hosting and current access

Production is the existing Netlify site `cdn-epic-css` (ID `76ae57fc-00f3-460c-bf44-f2cc8458f1c4`), linked to this repository's `main`, serving `https://epiccss.com/`. The confusing historical site name does not mean it is only the CDN. The Git push trigger was verified by deploying commit `2a57d63` and checking the published production revision and live content. Direct Netlify CLI authentication is not needed for that Git-driven path.

This machine uses `https://packagefeedproxy.microsoft.io/npm/` for npm installs. Explicit requests to the public registry currently fail TLS negotiation in both Node and Windows HTTP clients. Package publishing must target `https://registry.npmjs.org/`, never the install proxy. Do not disable TLS verification to bypass this. Resolve public-registry access and authenticate the npm publisher before publishing the prepared candidate; recheck the latest version and account at that point.
