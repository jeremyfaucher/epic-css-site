# Site-first release workflow

Develop shared styles and documentation here first. The order is:

1. Run `npm run validate`, review the diff, commit, and push this site's `main`.
2. Deploy this repository to the existing Epic CSS Netlify site. `netlify.toml` specifies Node 22, `npm run build`, and `_site`. A Git push only deploys if the repository is connected to that Netlify site; otherwise use its authenticated deployment controls. Do not create a replacement site or guess a site ID.
3. Verify the actual production domain, `https://epiccss.com/`, including `/docs/`, changed examples, CSS, and important assets. Verify the deployed commit when available. Do not advance the package release on the basis of a successful local build alone.
4. Port the verified shared Sass or relevant documentation into the `epic-css` npm repository. Site-only content does not need to be copied wholesale into the package README. Include a concise explanation of new utilities/palette behavior and consumer build commands where applicable. Inspect `npm pack --dry-run` and test a packed candidate in a disposable starter before publishing.
5. Check the registry's current version and authenticated publisher, choose the next unused version appropriate to the change, and publish only a reviewed package tree. Never publish the mixed working directory just because its version looks newer. The local library currently includes pre-existing changes beyond the palette fix; review or isolate those before release.
6. Update the starter's dependency and lockfile to the released version, propagate relevant usage documentation/examples, then run its validation and preview before committing/pushing it. The starter already has the build runner; it does not yet consume a newly published palette fix.

Use `npm start` for development; stop watchers before build/release checks. `npm run validate` restores existing generated CSS, while `npm run build` produces deployable `_site` output and intentionally updates generated CSS. The historical `build-production` command only runs Eleventy.

From the local aggregate folder, `node validate.cjs` validates the library, site, and starter. That folder is outside these repositories; component commands are the portable interface.

The scanner filters literal source classes using substring matches, not complete selector analysis. Preview responsive layouts and dynamically assembled classes after filtering. The palette is selected at Sass compile time, not by a browser theme toggle.

The CDN is a separate release surface. No verified CDN deployment configuration exists here; do not claim an npm release updates CDN files automatically.
