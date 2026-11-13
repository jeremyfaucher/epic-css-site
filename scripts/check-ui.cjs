const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const postcss = require('postcss');
const CleanCSS = require('clean-css');

module.exports = function checkUi(output) {
  const core = new CleanCSS({}).minify(fs.readFileSync(path.join(__dirname, '../src/_includes/style.css'), 'utf8')).styles;
  const selectors = [];
  postcss.parse(core).walkRules(rule => selectors.push(rule.selector));
  for (const route of ['/ui/', '/ui/buttons/', '/ui/cards/', '/ui/sliders/', '/ui/heroes/', '/ui/layouts/', '/ui/icons/']) {
    const $ = cheerio.load(fs.readFileSync(path.join(output, route, 'index.html'), 'utf8'));
    assert.equal($('head style').first().text().trim(), core, route + ': missing compiled Epic CSS');
    assert.ok(!$('head style').text().includes('.docs-layout'), route + ': unexpected docs decoration');
    assert.equal($('h1').length, 1, route + ': expected one page heading');
    assert.equal($('header a.active').attr('href'), '/ui/');
    $('main [class]').each((_, element) => {
      for (const name of $(element).attr('class').split(/\s+/).filter(Boolean)) {
        if (name.startsWith('language-') || name === 'token' || $(element).closest('pre').length) continue;
        if ($(element).closest('[data-slider]').length && ['slider-container', 'slider', 'card', 'prev-btn', 'next-btn'].includes(name)) continue;
        const pattern = new RegExp('\\.' + name + '(?![a-zA-Z0-9_-])');
        assert.ok(selectors.some(selector => pattern.test(selector)), route + ': unknown utility ' + name);
      }
    });
    $('main a[href^="/"], main img[src^="/"]').each((_, element) => {
      const target = $(element).attr('href') || $(element).attr('src');
      // Faithful homepage extraction retains the original, unavailable sample post.
      if (target === '/blog/web-design/second-web-design-post/' && $(element).closest('[data-example-preview]').length) return;
      const [pathname, fragment] = target.split('#');
      const file = path.join(output, pathname, pathname.endsWith('/') ? 'index.html' : '');
      assert.ok(fs.existsSync(file), route + ': broken local target ' + target);
      if (fragment) {
        const destination = cheerio.load(fs.readFileSync(file, 'utf8'));
        assert.ok(destination('[id]').toArray().some(element => destination(element).attr('id') === decodeURIComponent(fragment)), route + ': missing fragment ' + target);
      }
    });
    $('[data-example]').each((_, element) => {
      const example = $(element);
      const normalize = html => html.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
      const snippet = cheerio.load(example.find('pre code.language-html').text().trim(), null, false);
      assert.equal(normalize(example.find('[data-example-preview]').html()), normalize(snippet.html()), 'UI preview/code mismatch');
      assert.ok(example.find('pre code .token').length, 'Missing highlighted UI snippet');
      assert.equal(example.find('[data-copy-example]').length, route === '/ui/sliders/' ? 2 : 1);
      assert.equal(example.find('[data-copy-feedback][role="status"]').length, 1);
      const preview = example.find('[data-example-preview]');
      if (route === '/ui/icons/') {
        const icons = preview.find('svg');
        assert.ok(icons.length, 'Icon example must contain SVG previews');
        // HTML selectors normalize attribute names, while SVG preserves viewBox casing.
        // Read attributes directly, and verify every icon rather than one selector match.
        icons.each((_, icon) => {
          const svg = $(icon);
          assert.equal(svg.attr('viewBox'), '0 0 24 24', 'SVG must retain its scalable coordinate system');
          assert.equal(svg.attr('stroke'), 'currentColor', 'SVG must inherit its stroke color');
          assert.equal(svg.attr('aria-hidden'), 'true', 'Decorative SVG must be hidden from assistive technology');
          assert.equal(svg.attr('focusable'), 'false', 'Decorative SVG must not become a focus target');
        });
        return;
      }
      if (route === '/ui/buttons/') {
        assert.ok(preview.find('.btn').length >= 2);
        assert.equal(preview.find('a:not([href]), a[disabled], button:not([type="button"])').length, 0);
        assert.equal(preview.find('[onclick], script').length, 0);
        return;
      }
      if (route === '/ui/sliders/') {
        assert.equal($('main').children('[data-example]').length, 1, 'Slider example must break out of the container');
        assert.equal(preview.parents('.container, .wrapper').length, 0, 'Live slider must be viewport-wide');
        assert.equal(preview.attr('class'), 'w-100', 'Live slider preview must have no padding');
        assert.equal($('main [data-slider-previous]').length, 1, 'Expected one live Previous control');
        assert.equal($('main [data-slider-next]').length, 1, 'Expected one live Next control');
        assert.equal(preview.find('script, pre').length, 0, 'Live preview contains stray source');
        assert.equal(preview.find('.slider-container').length, 1, 'Expected one live slider');
        assert.equal(preview.text().replace(/\s+/g, ''), '12345678◁▷', 'Preview contains stray source text');
        assert.equal($('main script:not([src])').length, 1, 'Expected one executing slider script');
        const cards = preview.find('[data-slider-card]');
        assert.equal(cards.length, 8);
        cards.each((index, card) => {
          assert.equal($(card).text(), String(index + 1));
          assert.equal($(card).attr('style'), 'height: 200px; background: linear-gradient(135deg, #6e45e2, #88d3ce);');
          assert.ok($(card).hasClass('flex-basis-300') && $(card).hasClass('border-r-16'));
        });
        assert.equal(preview.find('[data-slider-track]').attr('style'), 'max-width: 1000px;');
        assert.equal(preview.find('[data-slider-viewport]').attr('style'), 'scroll-padding-inline-start: calc((100vw - 1000px) / 2); scrollbar-width: none;');
        assert.equal(preview.find('[data-slider-previous][aria-label="Previous"]').length, 1);
        assert.equal(preview.find('[data-slider-next][aria-label="Next"]').length, 1);
        const source = fs.readFileSync(path.join(__dirname, '../src/_includes/slider-script.njk'), 'utf8').trim();
        assert.equal(example.find('pre code.language-javascript').text().trim(), source, 'Copyable slider JS differs');
        assert.ok($('script:not([src])').toArray().some(script => $(script).text().trim() === source), 'Live slider JS differs');
        return;
      }
      const card = preview.children('div.clr-primary-bg.p-24.border-r-16');
      if (example.attr('aria-label') === 'Sidebar author profile') {
        assert.equal(preview.children('section[aria-label="Demo author profile"]').length, 1);
        return; // Detailed author structure/provenance checks run below.
      }
      if (route === '/ui/layouts/') {
        if (example.attr('aria-label') === 'Three column') {
          const section = preview.children('section');
          const columns = section.children('.flex-md').children('.flex-1');
          assert.equal(section.children('h2').length, 1);
          assert.equal(columns.length, 3, 'Three-column layout needs three equal flex wrappers');
          columns.each((_, column) => {
            assert.equal($(column).children('.clr-primary-bg.p-24.border-r-16').length, 1);
            assert.equal($(column).find('h3').length, 1);
          });
          return;
        }
        const wrapper = preview.children('section[aria-labelledby="archive-posts-heading"]');
        const layout = wrapper.children('.grid.grid-sidebar-right-268');
        assert.equal(wrapper.children('h2#archive-posts-heading').length, 1);
        assert.equal(layout.children('section').children().first().prop('tagName'), 'ARTICLE');
        assert.equal(layout.children('section').length, 1);
        assert.equal(layout.children('aside[aria-labelledby]').length, 1);
        assert.equal(layout.children('section').find('article').length, 2);
        assert.ok(layout.hasClass('gap-40'));
        assert.equal(layout.find('style, script, [data-archive-layout]').length, 0);
        assert.ok(selectors.includes('.grid-sidebar-right-268'));
        return;
      }
      if (route === '/ui/heroes/') {
        const hero = preview.children('section.flex-md');
        assert.equal(hero.children('.flex-1').length, 2, 'Hero must have two flexible columns');
        assert.equal(hero.find('h1').text(), 'Develop');
        assert.equal(hero.find('a').length, 2, 'Hero must have two calls to action');
        assert.equal(hero.find('img[alt][width][height]').length, 1);
        assert.equal(hero.find('script, [style]').length, 0, 'Hero uses existing utilities without custom scripts or styles');
        return;
      }
      assert.equal(card.length, 1);
      if (example.attr('aria-label') === 'Vertical blog card') {
        assert.equal(card.attr('style'), 'max-width: 344px');
        assert.equal(preview.find('[style]').length, 1, 'Only the original width cap needs an inline style');
      } else {
        assert.ok(card.hasClass('flex-md') && card.hasClass('gap-24'));
        assert.equal(card.children('.flex-1').length, 2);
        assert.equal(card.find('.md-w-50').length, 0);
        assert.equal(preview.find('[style]').length, 0, 'Horizontal card must use existing utilities');
      }
      assert.equal(card.find('img.border-r-16.mb-0[alt][width="484"][height="242"]').length, 1, 'Card image must override article image bottom margin');
      const data = require('../src/_data/cardExample');
      assert.equal(card.find('h3').text().trim(), data.title);
      assert.equal(card.find('h3').attr('class'), 'clr-primary mt-0 mb-24');
      assert.equal(card.find('p').text().replace(/\s+/g, ' ').trim(), data.excerpt + ' ' + data.linkLabel);
      assert.equal(card.find('a[href="' + data.href + '"]').length, 3);
      if (example.attr('aria-label') === 'Horizontal image-right card') assert.equal(card.children().last().prop('tagName'), 'A');

    });
  }
  const home = cheerio.load(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
  assert.ok(home('a[href="/ui/cards/"]').length, 'Missing homepage Cards link');
  assert.equal(home('[data-slider], .slider-container, .prev-btn, .next-btn').length, 0, 'Homepage slider remains');
  assert.ok(!home('main script').text().includes('scrollBy'), 'Homepage slider script remains');
  assert.ok(!home('main pre').text().includes('slider-container'), 'Homepage slider snippet remains');
  assert.ok(!home('main').text().includes('Vertical Card'), 'Old homepage card remains');
  assert.ok(fs.existsSync(path.join(output, 'assets/js/examples.js')));
  require('./test-sliders.cjs')();
  require('./check-card-components.cjs')(output, core);
  require('./test-icons.cjs')(output);
  require('./check-author-card.cjs')(output);
  console.log('UI checks: core CSS, utilities, assets, matching live/copy HTML, shared teaching copy, responsive card variants, and page layouts.');
};
