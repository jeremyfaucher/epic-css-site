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
  for (const variant of ['Vertical', 'Horizontal', 'Horizontal image-right']) {
    const selector = '[data-example][aria-label="' + (variant === 'Horizontal image-right' ? 'Horizontal image-right card' : variant + ' blog card') + '"]';
    const homeExample = home(selector), uiExample = cards(selector);
    assert.equal(homeExample.length, 1);
    assert.equal(uiExample.length, 1);
    const rendered = normalize(uiExample.find('[data-example-preview]').html());
    const card = uiExample.find('[data-example-preview] > div');
    assert.ok(card.hasClass('border-r-24'), variant + ': outer radius');
    assert.equal(card.find('img.border-r-16').length, 1, variant + ': image radius');
    for (const example of [homeExample, uiExample]) {
      assert.equal(normalize(example.find('[data-example-preview]').html()), rendered, variant + ': homepage and UI markup differ');
      assert.equal(normalize(example.find('pre code.language-html').text()), rendered, variant + ': code and preview differ');
      assert.equal(example.find('[data-copy-example]').length, 1);
    }
  }
  const selectors = [];
  const css = postcss.parse(core);
  css.walkRules(rule => selectors.push(rule.selector));
  const radius = {};
  css.walkRules(rule => {
    if (['.border-r-24', '.border-r-16'].includes(rule.selector)) rule.walkDecls('border-radius', decl => { radius[rule.selector] = decl.value; });
  });
  assert.deepEqual(radius, { '.border-r-16': '16px', '.border-r-24': '24px' });
  const inset = cards('[data-example][aria-label="Inset image card"]');
  assert.equal(inset.length, 1);
  assert.equal(normalize(inset.find('[data-example-preview]').html()), normalize(inset.find('pre code.language-html').text()));
  const insetPadding = {};
  css.walkRules(rule => {
    if (['.pt-12', '.px-12'].includes(rule.selector)) {
      insetPadding[rule.selector] = Object.fromEntries(rule.nodes.filter(n => n.type === 'decl').map(n => [n.prop, n.value]));
    }
  });
  assert.deepEqual(insetPadding['.pt-12'], { 'padding-top': '.75rem' }, 'Retain inset top padding in filtered CSS');
  assert.deepEqual(insetPadding['.px-12'], { 'padding-left': '.75rem', 'padding-right': '.75rem' }, 'Retain inset side padding without bottom padding');
  for (const [route, selector] of [
    ['ui/layouts', '[data-example-preview] .clr-primary-bg'],
    ['ui/icons', '[data-icon-card], [data-example][aria-label="Decorative engagement icons with visible labels"] [data-example-preview] > div'],
    ['ui/sliders', '[data-example-preview] [data-slider-panel]'],
    ['ui', 'main .clr-primary-bg'],
  ]) {
    const page = cheerio.load(fs.readFileSync(path.join(output, route, 'index.html'), 'utf8'));
    const surfaces = page(selector);
    assert.ok(surfaces.length, route + ': missing card surfaces');
    surfaces.each((_, element) => assert.ok(page(element).hasClass('border-r-24'), route + ': boxed card outer radius'));
    surfaces.find('img').each((_, image) => assert.ok(page(image).hasClass('border-r-16'), route + ': card image radius'));
  }
  home('[data-card-showcase] [class]').each((_, element) => {
    if (home(element).closest('pre').length) return;
    for (const name of home(element).attr('class').split(/\s+/)) {
      assert.ok(selectors.some(selector => new RegExp('\\.' + name + '(?![a-zA-Z0-9_-])').test(selector)), 'Homepage missing utility ' + name);
    }
  });
  const ids = home('[id]').map((_, element) => home(element).attr('id')).get();
  assert.equal(new Set(ids).size, ids.length, 'Duplicate homepage IDs');
  for (const showcase of ['[data-card-showcase]', '[data-layout-showcase]']) {
    assert.equal(home(`${showcase} [data-showcase-controls][hidden]`).length, 1, 'Uninitialized controls should stay hidden');
    assert.equal(home(`${showcase} [data-showcase-panel]:not([hidden])`).length, 3, 'All examples must remain available without JS');
  }
  assert.equal(home('[data-example-code][hidden]').length, 0, 'Code must remain available without JS');
  home('[aria-controls]').each((_, element) => {
    for (const id of home(element).attr('aria-controls').split(/\s+/)) assert.equal(home('[id="' + id + '"]').length, 1, 'Missing controlled element ' + id);
  });
  for (const script of ['card-showcase.js', 'examples.js']) assert.equal(home('script[src="/assets/js/' + script + '"]').length, 1);
  for (const file of ['src/ui/cards/index.njk', 'src/_includes/card-showcase.njk']) {
    const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
    for (const variant of ['vertical', 'horizontal', 'horizontal-right']) assert.equal(source.split('include "components/cards/' + variant + '.njk"').length - 1, 1, file + ': use each component exactly once');
    assert.ok(!source.includes('Second Web Design Post'), file + ': card content should come from shared data');
    assert.ok(!source.includes('style="max-width: 344px"'), file + ': card markup should come from the shared template');
  }
  require('./test-card-showcase.cjs')();
  console.log('Card components: identical homepage/UI previews and rendered code, available utilities, progressive fallback, and unique control IDs passed.');
};
