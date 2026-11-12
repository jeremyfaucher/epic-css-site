const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const postcss = require('postcss');
const CleanCSS = require('clean-css');

module.exports = function checkDocs(output, libraryCss) {
  if (libraryCss) assert.ok(!libraryCss.includes('.docs-'), 'Docs presentation leaked into the portable library stylesheet');
  const topics = ['overview', 'installation', 'wrapper-and-container', 'flexbox', 'grid', 'colors', 'typography', 'images', 'changelog'];
  const coreCss = new CleanCSS({}).minify(fs.readFileSync(path.join(__dirname, '../src/_includes/style.css'), 'utf8')).styles;
  const utilityCss = postcss.parse(libraryCss || coreCss);
  const declarations = selector => {
    const result = {};
    utilityCss.walkRules(selector, rule => rule.walkDecls(decl => { result[decl.prop] = decl.value; }));
    return result;
  };
  assert.deepEqual(declarations('.wrapper'), { padding: '0 5%' }, 'Documented wrapper behavior changed');
  const container = declarations('.container');
  assert.ok(container['max-width'], 'Missing container width cap');
  assert.deepEqual(Object.fromEntries(Object.entries(container).filter(([property]) => property !== 'max-width')), { margin: '0 auto', 'box-sizing': 'border-box' }, 'Documented container behavior changed');
  require('./test-container-width.cjs')();
  for (const [selector, property, value] of [
    ['.pt-24', 'padding-top', '1.5rem'], ['.py-24', 'padding-bottom', '1.5rem'],
    ['.mb-80', 'margin-bottom', '5rem'], ['.gap-24', 'gap', '1.5rem'], ['.gap-40', 'gap', '2.5rem']
  ]) assert.equal(declarations(selector)[property], value, 'Documented spacing changed: ' + selector);
  let mediumRow = false;
  utilityCss.walkRules('.md-flex-row', rule => {
    if (rule.parent.type === 'atrule' && /min-width:\s*820px/.test(rule.parent.params)) {
      rule.walkDecls('flex-direction', decl => { if (decl.value === 'row') mediumRow = true; });
    }
  });
  assert.ok(mediumRow, 'Documented medium flex breakpoint changed');
  assert.ok(fs.existsSync(path.join(output, 'assets/js/docs.js')), 'Missing docs copy/legacy-link script');
  assert.ok(fs.existsSync(path.join(output, 'assets/js/examples.js')), 'Missing shared copy script');
  let examples = 0;
  for (const topic of topics) {
    const route = topic === 'overview' ? '/docs/' : '/docs/' + topic + '/';
    const file = path.join(output, route, 'index.html');
    const $ = cheerio.load(fs.readFileSync(file, 'utf8'));
    assert.equal($('head style').first().text().trim(), coreCss, route + ': compiled Epic CSS must load first');
    const coreSelectors = [];
    postcss.parse(coreCss).walkRules(rule => coreSelectors.push(rule.selector));
    const shared = $('.docs-layout, .docs-sidebar nav p, .docs-sidebar ul, .docs-sidebar a, .docs-eyebrow, .docs-page-footer, .docs-example, .docs-example-preview, .docs-example-toolbar, [data-copy-example], .docs-copy-feedback, .docs-example > pre');
    shared.each((_, element) => {
      for (const name of ($(element).attr('class') || '').split(/\s+/).filter(Boolean)) {
        if (name.startsWith('docs-') || name.startsWith('language-')) continue;
        const pattern = new RegExp('\\.' + name + '(?![a-zA-Z0-9_-])');
        assert.ok(coreSelectors.some(selector => pattern.test(selector)), route + ': missing shared utility ' + name);
      }
    });
    assert.equal($('article[data-doc-topic]').attr('data-doc-topic'), topic, route);
    assert.equal($('script[src="/assets/js/examples.js"]').length, 1, route + ': missing shared copy handler');
    assert.equal($('article h1').length, 1, route + ': expected one topic heading');
    assert.equal($('nav[aria-label="Documentation"] [aria-current="page"]').length, 1, route);
    assert.equal($('nav [aria-current="page"]').attr('href'), route, route + ': wrong active link');
    const layoutLinks = $('nav[aria-label="Documentation"] a').map((_, element) => $(element).attr('href')).get();
    assert.ok(layoutLinks.indexOf('/docs/wrapper-and-container/') < layoutLinks.indexOf('/docs/flexbox/'), 'Wrapper docs must precede Flexbox');
    if (topic === 'wrapper-and-container') {
      assert.equal($('.docs-example').length, 5);
      const preview = label => $('.docs-example[aria-label="' + label + '"] .docs-example-preview');
      assert.equal(preview('Wrapper around a centered container').find('.wrapper > .container').length, 1);
      assert.equal(preview('Wrapper without a container').find('.container').length, 0);
      assert.equal(preview('Section without gutters or a width cap').find('.wrapper, .container').length, 0);
      assert.equal(preview('Full-width surface with an inner wrapper and container').find('section > .wrapper > .container').length, 1);
      $('article a[href^="/docs/"], article a[href^="/ui/"]').each((_, element) => {
        assert.ok(fs.existsSync(path.join(output, $(element).attr('href'), 'index.html')), 'New layout docs contain a broken link');
      });
    }
    if (topic === 'colors') {
      const paired = $('.docs-example[aria-label="Primary and secondary color pairs"]');
      assert.equal(paired.length, 1, 'Missing paired Colors example');
      for (const role of ['primary', 'secondary']) {
        const box = paired.find('.docs-example-preview .xs-w-50.clr-' + role + '.clr-' + role + '-bg');
        assert.equal(box.length, 1, 'Missing ' + role + ' pair');
        assert.equal(box.find('br').length, 1);
        assert.equal(box.text().trim(), 'clr-' + role + 'clr-' + role + '-bg');
      }
      assert.equal(paired.find('.docs-example-preview [style]').length, 0, 'Color boxes must use utilities');
    }
    if (topic === 'changelog') {
      const { readChangelog, GROUPS } = require('./changelog.cjs');
      const log = readChangelog();
      const expected = (log.unreleased ? [log.unreleased] : []).concat(log.releases);
      const sections = $('article .docs-release');
      assert.deepEqual(sections.map((_, el) => $(el).attr('data-version')).get(), expected.map(item => item.version), 'Changelog versions differ from CHANGELOG.md');
      assert.deepEqual($('.docs-release-index a').map((_, el) => $(el).attr('href')).get(), expected.map(item => '#' + item.slug), 'Version index differs from releases');
      assert.equal($('.docs-release-badge').length, 1, 'Exactly one latest release badge expected');
      assert.equal($('#' + log.latest.slug + ' .docs-release-badge').length, 1, 'Latest badge is on the wrong release');
      if (log.unreleased?.plannedVersion) {
        const upcoming = $('#' + log.unreleased.slug);
        assert.equal(upcoming.find('h2').text(), `${log.unreleased.plannedVersion} (Unreleased)`);
        assert.equal(upcoming.find('time, .docs-release-badge, a[href*="npmjs.com"]').length, 0, 'Upcoming version must not imply publication');
        assert.ok(upcoming.text().includes('not yet published'));
      }
      sections.each((_, el) => {
        const item = expected.find(release => release.version === $(el).attr('data-version'));
        assert.equal($(el).attr('id'), item.slug);
        assert.equal($(el).find('time').attr('datetime'), item.date || undefined, item.version + ': wrong date');
        assert.deepEqual($(el).find('h3').map((_, h) => $(h).text()).get(), item.groups.map(group => group.title));
        assert.ok($(el).find('h3').get().every(h => GROUPS.includes($(h).text())), item.version + ': unknown group');
        assert.equal($(el).find('.docs-release-links a[href="' + item.links.cdn + '"]').length, item.links.cdn ? 1 : 0, item.version + ': CDN link');
      });
    }
    const ids = $('[id]').map((_, el) => $(el).attr('id')).get();
    assert.equal(new Set(ids).size, ids.length, route + ': duplicate IDs');
    for (const other of ['wrapper-and-container', 'flexbox', 'grid', 'colors', 'typography', 'images', 'changelog'].filter(other => other !== topic)) {
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
      assert.ok(block.find('pre code .token').length, 'Example is missing syntax highlighting');
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
  const home = cheerio.load(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
  assert.equal(home('.flex-container, .colors-item').length, 0, 'Old homepage Colors demo remains');
  assert.ok(!home('style').text().includes('.colors-item'), 'Old homepage Colors CSS remains');
  assert.ok(home('main a[href="/docs/colors/"]').length, 'Missing homepage Colors discovery link');
  assert.ok(home('main a[href="/docs/wrapper-and-container/"]').length, 'Missing homepage wrapper/container link');
  assert.ok(!home('main').text().includes('Utility-first example usage'), 'Verbose homepage walkthrough remains');
  assert.ok(!home('main').text().includes('More usage documentation on this to come.'), 'Stale homepage documentation promise remains');
  console.log('Docs checks: ' + topics.length + ' isolated pages, active navigation, matching preview/code, ' + examples + ' filtered examples.');
};

if (require.main === module) module.exports(path.resolve(process.argv[2] || '_site'));
