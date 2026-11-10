const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const postcss = require('postcss');

module.exports = function checkCards(output, core) {
  const home = cheerio.load(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
  const cards = cheerio.load(fs.readFileSync(path.join(output, 'ui/cards/index.html'), 'utf8'));
  const normalize = html => cheerio.load(html, null, false).html().replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  assert.equal(home('head style').first().text().trim(), core, 'Homepage must load compiled Epic CSS');
  assert.ok(!home('head style').text().includes('.docs-layout'), 'Homepage must not load docs CSS');
  for (const variant of ['Vertical', 'Horizontal']) {
    const selector = '[data-example][aria-label="' + variant + ' blog card"]';
    const homeExample = home(selector), uiExample = cards(selector);
    assert.equal(homeExample.length, 1);
    assert.equal(uiExample.length, 1);
    const rendered = normalize(uiExample.find('[data-example-preview]').html());
    for (const example of [homeExample, uiExample]) {
      assert.equal(normalize(example.find('[data-example-preview]').html()), rendered, variant + ': homepage and UI markup differ');
      assert.equal(normalize(example.find('pre code.language-html').text()), rendered, variant + ': code and preview differ');
      assert.equal(example.find('[data-copy-example]').length, 1);
    }
  }
  const selectors = [];
  postcss.parse(core).walkRules(rule => selectors.push(rule.selector));
  home('[data-card-showcase] [class]').each((_, element) => {
    if (home(element).closest('pre').length) return;
    for (const name of home(element).attr('class').split(/\s+/)) {
      assert.ok(selectors.some(selector => new RegExp('\\.' + name + '(?![a-zA-Z0-9_-])').test(selector)), 'Homepage missing utility ' + name);
    }
  });
  const ids = home('[id]').map((_, element) => home(element).attr('id')).get();
  assert.equal(new Set(ids).size, ids.length, 'Duplicate homepage IDs');
  assert.equal(home('[data-showcase-controls][hidden]').length, 1, 'Uninitialized controls should stay hidden');
  assert.equal(home('[data-showcase-panel]:not([hidden])').length, 2, 'Both examples must remain available without JS');
  assert.equal(home('[data-example-code][hidden]').length, 0, 'Code must remain available without JS');
  home('[aria-controls]').each((_, element) => {
    for (const id of home(element).attr('aria-controls').split(/\s+/)) assert.equal(home('[id="' + id + '"]').length, 1, 'Missing controlled element ' + id);
  });
  for (const script of ['card-showcase.js', 'examples.js']) assert.equal(home('script[src="/assets/js/' + script + '"]').length, 1);
  for (const file of ['src/ui/cards/index.njk', 'src/_includes/card-showcase.njk']) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    for (const variant of ['vertical', 'horizontal']) assert.equal(source.split('include "components/cards/' + variant + '.njk"').length - 1, 1, file + ': use each component exactly once');
    assert.ok(!source.includes('Second Web Design Post'), file + ': card content should come from shared data');
    assert.ok(!source.includes('style="max-width: 344px"'), file + ': card markup should come from the shared template');
  }
  require('./test-card-showcase.cjs')();
  console.log('Card components: identical homepage/UI previews and rendered code, available utilities, progressive fallback, and unique control IDs passed.');
};
