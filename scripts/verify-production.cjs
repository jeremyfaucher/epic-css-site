// Read-only release gate: verify the exact deployed commit and live palette.
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');
const cheerio = require('cheerio');

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), cache: 'no-store' });
  assert.equal(response.status, 200, `${url}: HTTP ${response.status}`);
  return response;
}

function value(css, selector, property) {
  let found;
  css.walkRules(selector, rule => rule.walkDecls(property, decl => { found = decl.value; }));
  assert.ok(found, `Missing ${selector} { ${property} }`);
  // CleanCSS shortens colors such as #ffffff to #fff.
  return found.replace(/#([a-f0-9]{3})(?![a-f0-9])/gi,
    (_, digits) => '#' + [...digits].map(digit => digit + digit).join('')).toLowerCase();
}

async function main() {
  process.chdir(path.resolve(__dirname, '..'));
  const commit = process.argv[2] || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.match(commit, /^[a-f0-9]{40}$/, 'Supply a full site commit SHA or run inside its Git checkout');
  const site = await (await get('https://api.netlify.com/api/v1/sites/epiccss.com')).json();
  assert.equal(site.id, '76ae57fc-00f3-460c-bf44-f2cc8458f1c4');
  assert.equal(site.repo_url, 'https://github.com/jeremyfaucher/epic-css-site');
  assert.equal(site.published_deploy.state, 'ready');
  assert.equal(site.published_deploy.context, 'production');
  assert.equal(site.published_deploy.commit_ref, commit, 'Production is not on the expected site commit');

  const routes = ['/', '/docs/', '/docs/installation/', '/docs/flexbox/', '/docs/grid/', '/docs/colors/', '/docs/typography/', '/npm-custom-install/', '/11ty-theme/', '/assets/favicon.png'];
  let docs;
  let home;
  for (const route of routes) {
    const response = await get(`https://epiccss.com${route}?release=${commit}`);
    const contentType = response.headers.get('content-type') || '';
    assert.ok(contentType.includes(route.endsWith('.png') ? 'image/png' : 'text/html'), `${route}: unexpected content type`);
    if (route === '/') home = cheerio.load(await response.text());
    if (route.startsWith('/docs/')) {
      const page = cheerio.load(await response.text());
      assert.equal(page('nav[aria-label="Documentation"] [aria-current="page"]').length, 1, route + ': active navigation');
      assert.equal(page('nav [aria-current="page"]').attr('href'), route);
      assert.equal(page('article h1').length, 1, route + ': topic isolation');
      if (route === '/docs/colors/') docs = page;
      if (route === '/docs/typography/') {
        assert.deepEqual(page('[data-utility="fs-32"] td').map((_, cell) => page(cell).text()).get(), ['fs-32', '32px', '24px']);
        assert.ok(page('.docs-example-preview .fw-700').length, 'Typography preview is missing');
      }
    }
  }
  assert.equal(docs('#colors').length, 1, 'Missing or duplicate colors section');
  assert.ok(home('pre code.language-html .token').length, 'Homepage code is not highlighted');
  assert.ok(docs('pre code.language-html .token').length, 'Docs examples are not highlighted');
  assert.ok(docs('#colors').text().includes('Colors and palettes'));
  assert.ok(docs('.clr-primary-bg .clr-primary').length, 'Missing primary callout');
  assert.ok(docs('.clr-secondary-bg .clr-secondary').length, 'Missing secondary callout');
  const live = postcss.parse(docs('head style').text());
  const local = postcss.parse(sass.compile('src/my-epic-css/index.scss').css);
  for (const [selector, property] of [
    ['body', 'color'], ['.clr-body-bg', 'background-color'],
    ['.clr-primary', 'color'], ['main a.clr-underline:hover', 'color'],
    ['.clr-primary-bg', 'background'], ['.clr-secondary', 'color'],
    ['.clr-secondary-bg', 'background'], ['.clr-white', 'color'],
  ]) assert.equal(value(live, selector, property), value(local, selector, property), `Production differs: ${selector}`);
  console.log(`Verified production ${commit}: ${routes.length} routes, isolated docs navigation and all eight palette values.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
