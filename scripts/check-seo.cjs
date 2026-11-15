// Verify the actual Eleventy page inventory, not leftover files in _site.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const site = require('../src/_data/site.json');

module.exports = function checkSeo(output, pages) {
  assert.equal(site.url, 'https://epiccss.com');
  const html = pages.filter(page => page.outputPath.endsWith('.html'));
  const publicPages = html.filter(page => page.url !== '/404.html');
  const titles = new Set(), descriptions = new Set(), graph = new Map();
  for (const page of publicPages) {
    const $ = cheerio.load(fs.readFileSync(page.outputPath, 'utf8'));
    assert.equal($('title').length, 1, page.url + ': one title');
    assert.equal($('meta[name="description"]').length, 1, page.url + ': one description');
    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content').trim();
    assert(title && description, page.url + ': nonempty metadata');
    assert(title.includes('Epic CSS'), page.url + ': correct site branding');
    assert(!titles.has(title), page.url + ': unique title');
    assert(!descriptions.has(description), page.url + ': unique description');
    titles.add(title); descriptions.add(description);
    assert.equal($('link[rel="canonical"]').length, 1, page.url + ': one canonical');
    assert.equal($('link[rel="canonical"]').attr('href'), site.url + page.url);
    assert(!/noindex|none/i.test($('meta[name="robots"]').attr('content') || ''), page.url + ': indexable');
    assert.equal($('h1').length, 1, page.url + ': one descriptive H1');
    const links = [];
    $('a[href]').each((_, element) => {
      const href = $(element).attr('href');
      const url = new URL(href, site.url + page.url);
      if (url.origin !== site.url) return;
      links.push(url.pathname);
      assert(publicPages.some(item => item.url === url.pathname) ||
        fs.existsSync(path.join(output, decodeURIComponent(url.pathname))),
        page.url + ': missing internal destination ' + href);
    });
    graph.set(page.url, links);
  }
  const visited = new Set();
  function visit(url) {
    if (visited.has(url)) return;
    visited.add(url);
    for (const target of graph.get(url) || []) visit(target);
  }
  visit('/');
  for (const page of publicPages) assert(visited.has(page.url), page.url + ': reachable from home');

  const xml = fs.readFileSync(path.join(output, 'sitemap.xml'), 'utf8');
  const $xml = cheerio.load(xml, { xmlMode: true });
  assert.equal($xml('urlset').attr('xmlns'), 'http://www.sitemaps.org/schemas/sitemap/0.9');
  const urls = $xml('url > loc').map((_, item) => $xml(item).text()).get();
  assert.deepEqual([...urls].sort(), publicPages.map(page => site.url + page.url).sort(),
    'Sitemap contains exactly the canonical public HTML URLs, with no 404 or duplicates');
  assert.equal($xml('lastmod').length, 0, 'Do not invent modification dates from filesystem timestamps');
  const robots = fs.readFileSync(path.join(output, 'robots.txt'), 'utf8');
  assert(robots.includes('Sitemap: ' + site.url + '/sitemap.xml'));
  assert(!/^Disallow:\s*\/\s*$/m.test(robots), 'Public crawling is allowed');
  const notFound = cheerio.load(fs.readFileSync(path.join(output, '404.html'), 'utf8'));
  assert.equal(notFound('meta[name="robots"]').attr('content'), 'noindex');
  console.log(`SEO: ${publicPages.length} unique titles/descriptions, self-canonicals, H1s, internal destinations and home reachability; sitemap/robots and noindex 404 verified.`);
};
