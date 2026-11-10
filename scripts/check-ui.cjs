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
  for (const route of ['/ui/', '/ui/cards/', '/ui/sliders/']) {
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
      const file = path.join(output, target, target.endsWith('/') ? 'index.html' : '');
      assert.ok(fs.existsSync(file), route + ': broken local target ' + target);
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
      assert.equal(card.length, 1);
      if (example.attr('aria-label') === 'Vertical blog card') {
        assert.equal(card.attr('style'), 'max-width: 344px');
        assert.equal(preview.find('[style]').length, 1, 'Only the original width cap needs an inline style');
      } else {
        assert.ok(card.hasClass('flex-col') && card.hasClass('md-flex-row') && card.hasClass('gap-24'));
        assert.equal(preview.find('[style]').length, 0, 'Horizontal card must use existing utilities');
      }
      assert.equal(card.find('img.border-r-16[alt][width="484"][height="242"]').length, 1);
      assert.equal(card.find('h3').text().trim(), 'Second Web Design Post');
      assert.equal(card.find('h3').attr('class'), 'clr-primary mt-0 mb-24');
      assert.match(card.find('div.mb-24').text().replace(/\s+/g, ' ').trim(), /^by admin on Mar 11, 2020$/);
      assert.equal(card.find('p').text().replace(/\s+/g, ' ').trim(), "YOLO pop-up synth fixie slow-carb fingerstache before they sold out twee readymade church-key DIY meh umami crucifix offal. PBR&B craft beer photo booth lyft gastropub 90's. This is a Read more...");
      assert.equal(card.find('a[href="/blog/web-design/second-web-design-post/"]').length, 3);
      assert.ok($('main').text().includes('sample blog page is not included'));
    });
  }
  const home = cheerio.load(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
  assert.ok(home('a[href="/ui/cards/"]').length, 'Missing homepage Cards link');
  assert.ok(home('a[href="/ui/sliders/"]').length, 'Missing homepage Sliders link');
  assert.equal(home('[data-slider], .slider-container, .prev-btn, .next-btn').length, 0, 'Homepage slider remains');
  assert.ok(!home('main script').text().includes('scrollBy'), 'Homepage slider script remains');
  assert.ok(!home('main pre').text().includes('slider-container'), 'Homepage slider snippet remains');
  assert.ok(!home('main').text().includes('Vertical Card'), 'Old homepage card remains');
  assert.ok(fs.existsSync(path.join(output, 'assets/js/examples.js')));
  require('./test-sliders.cjs')();
  require('./check-card-components.cjs')(output, core);
  console.log('UI checks: core CSS, utilities, assets, matching live/copy HTML, original blog card content and width. Original sample post route remains unavailable.');
};
