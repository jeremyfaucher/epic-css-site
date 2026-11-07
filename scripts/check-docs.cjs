const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const postcss = require('postcss');

module.exports = function checkDocs(output, libraryCss) {
  if (libraryCss) assert.ok(!libraryCss.includes('.docs-'), 'Docs presentation leaked into the portable library stylesheet');
  const topics = ['overview', 'installation', 'flexbox', 'grid', 'colors'];
  assert.ok(fs.existsSync(path.join(output, 'assets/js/docs.js')), 'Missing docs copy/legacy-link script');
  let examples = 0;
  for (const topic of topics) {
    const route = topic === 'overview' ? '/docs/' : '/docs/' + topic + '/';
    const file = path.join(output, route, 'index.html');
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    assert.equal($('article[data-doc-topic]').attr('data-doc-topic'), topic, route);
    assert.equal($('article h1').length, 1, route + ': expected one topic heading');
    assert.equal($('nav[aria-label="Documentation"] [aria-current="page"]').length, 1, route);
    assert.equal($('nav [aria-current="page"]').attr('href'), route, route + ': wrong active link');
    const ids = $('[id]').map((_, el) => $(el).attr('id')).get();
    assert.equal(new Set(ids).size, ids.length, route + ': duplicate IDs');
    for (const other of ['flexbox', 'grid', 'colors'].filter(other => other !== topic)) {
      assert.equal($('article h1#' + other + ', article h2#' + other).length, 0, route + ': contains another topic');
    }
    $('nav[aria-label="Documentation"] a').each((_, link) => {
      const href = $(link).attr('href');
      assert.ok(fs.existsSync(path.join(output, href, 'index.html')), route + ': broken ' + href);
    });
    const css = postcss.parse($('head style').text());
    const selectors = [];
    let sticky = false;
    css.walkRules(rule => selectors.push(rule.selector));
    css.walkRules('.docs-sidebar', rule => rule.walkDecls('position', decl => { if (decl.value === 'sticky') sticky = true; }));
    assert.ok(sticky, route + ': missing sticky sidebar styles');
    $('.docs-example').each((_, element) => {
      examples++;
      const block = $(element);
      const code = block.find('pre code').text().trim();
      const normalize = text => text.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
      const snippet = cheerio.load(code, null, false);
      assert.equal(normalize(block.find('.docs-example-preview').html()), normalize(snippet.html()), 'Preview/code mismatch');
      block.find('.docs-example-preview [class]').each((_, item) => {
        for (const name of $(item).attr('class').split(/\s+/).filter(Boolean)) {
          if (name.startsWith('docs-')) continue;
          const pattern = new RegExp('\\.' + name + '(?![a-zA-Z0-9_-])');
          assert.ok(selectors.some(selector => pattern.test(selector)), route + ': missing filtered utility ' + name);
        }
      });
    });
  }
  assert.ok(examples >= 8, 'Expected live examples across the three utility topics');
  console.log('Docs checks: five isolated pages, active navigation, matching preview/code, ' + examples + ' filtered examples.');
};

if (require.main === module) module.exports(path.resolve(process.argv[2] || '_site'));
