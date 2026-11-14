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
  let largeOrder = false;
  postcss.parse(core).walkRules('.order-lg-last', rule => {
    assert.equal(rule.parent.type, 'atrule', 'Order utility must be responsive');
    assert.equal(rule.parent.params, '(min-width:960px)', 'Order must match the card flex breakpoint');
    rule.walkDecls('order', decl => { largeOrder = decl.value === '1'; });
  });
  assert.ok(largeOrder, 'Missing large image ordering utility');
  for (const route of ['/ui/', '/ui/buttons/', '/ui/cards/', '/ui/sliders/', '/ui/heroes/', '/ui/layouts/', '/ui/icons/']) {
    const $ = cheerio.load(fs.readFileSync(path.join(output, route, 'index.html'), 'utf8'));
    assert.equal($('head style').first().text().trim(), core, route + ': missing compiled Epic CSS');
    assert.ok(!$('head style').text().includes('.docs-layout'), route + ': unexpected docs decoration');
    assert.equal($('h1').length, 1, route + ': expected one page heading');
    assert.equal($('header a.active').attr('href'), '/ui/');
    if (route === '/ui/sliders/') {
      const underlineSelectors = [];
      postcss.parse(core).walkRules(rule => {
        rule.walkDecls('text-decoration', decl => {
          if (decl.value === 'underline') underlineSelectors.push(...rule.selectors.filter(selector => !/:(hover|focus|active)/.test(selector)));
        });
      });
      const underlined = link => underlineSelectors.some(selector => link.is(selector));
      const breadcrumb = $('nav[aria-label="UI navigation"]');
      assert.equal(underlined(breadcrumb.find('a').first()), false, 'Ancestor breadcrumb must not look active');
      assert.equal(underlined(breadcrumb.find('a').last()), true, 'Current breadcrumb must be underlined');
      const choices = $('[data-example-choice]');
      assert.equal(underlined(choices.first()), true, 'Default example must be underlined');
      assert.equal(underlined(choices.last()), false, 'Unselected example must not be underlined');
      choices.first().removeClass('active').removeAttr('aria-current');
      choices.last().addClass('active').attr('aria-current', 'true');
      assert.equal(underlined(choices.first()), false, 'Previous example must lose its underline');
      assert.equal(underlined(choices.last()), true, 'Selected example must gain its underline');
      choices.last().removeClass('active').removeAttr('aria-current');
      choices.first().addClass('active').attr('aria-current', 'true');
    }
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
        assert.equal($('[data-example-panel]').children('[data-example]').length, 2, 'Both slider examples must break out of the container');
        assert.equal($('[data-example-choice]').length, 2);
        assert.equal(example.find('details[data-example-details]:not([open]) > summary').length, 1, 'Example code must start collapsed');
        assert.equal(example.find('details [data-example-code] pre').length, 2, 'Both languages must remain inside the disclosure');
        assert.equal(preview.parents('.container, .wrapper').length, 0, 'Live slider must be viewport-wide');
        assert.equal(preview.attr('class'), 'w-100', 'Live slider preview must have no padding');
        assert.equal(preview.find('[data-slider-previous], [data-slider-next]').length, 0, 'Tabs replace arrows');
        assert.equal(preview.find('script, pre, style, [style]').length, 0, 'Slider must use library utilities only');
        if (example.attr('aria-label') === 'Continuous logo marquee') {
          const track = preview.find('[data-marquee-track]');
          const groups = track.children('ul');
          assert.equal(groups.length, 2);
          assert.equal(groups.first().children('li').length, 12);
          assert.equal(groups.last().attr('aria-hidden'), 'true');
          assert.ok(groups.last().is('[inert]'));
          assert.equal(normalize(groups.first().html()), normalize(groups.last().html()), 'Loop groups must be identical');
          assert.equal(groups.first().find('svg[role="img"][aria-label]').length, 12);
          assert.ok(track.hasClass('w-max') && track.hasClass('flex'));
          assert.equal(preview.find('[data-marquee-toggle][type="button"]').length, 1);
          const source = fs.readFileSync(path.join(__dirname, '../src/_includes/marquee-script.njk'), 'utf8').trim();
          assert.equal(example.find('pre code.language-javascript').text().trim(), source);
          assert.ok($('script:not([src])').toArray().some(script => $(script).text().trim() === source));
          return;
        }
        assert.equal(preview.find('[data-slider]').length, 1);
        assert.equal($('main script:not([src])').length, 2, 'Expected separate slider and marquee scripts');
        const tabs = preview.find('[data-slider-tab]');
        const panels = preview.find('[data-slider-panel]');
        assert.equal(tabs.length, 3);
        assert.equal(panels.length, 3);
        assert.deepEqual(tabs.map((_, tab) => $(tab).text()).get(), ['Hierarchy', 'Spacing', 'Balance']);
        panels.each((index, panel) => {
          const item = $(panel);
          assert.ok(item.hasClass('flex-basis-100') && item.hasClass('snap-start'));
          assert.equal(tabs.eq(index).attr('href'), '#' + item.attr('id'));
          assert.ok(item.find('h3').text().length > 15);
          assert.equal(item.find('img.w-100[alt][width="1040"][height="420"]').length, 1);
          assert.ok(item.find('img').attr('alt').length > 30);
        });
        const viewport = preview.find('[data-slider-viewport]');
        assert.ok(viewport.hasClass('scroll-gutter-container') && viewport.hasClass('scroll-snap-x-mandatory'));
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
        const layout = wrapper.children('.grid.grid-sidebar-right-lg-344px');
        assert.equal(wrapper.children('h2#archive-posts-heading').length, 1);
        assert.equal(layout.children('section').children().first().prop('tagName'), 'ARTICLE');
        assert.equal(layout.children('section').length, 1);
        assert.equal(layout.children('aside[aria-labelledby]').length, 1);
        assert.equal(layout.children('section').find('article').length, 2);
        assert.ok(layout.hasClass('gap-40'));
        assert.equal(layout.find('style, script, [data-archive-layout]').length, 0);
        assert.ok(selectors.includes('.grid-sidebar-right-lg-344px'));
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
        assert.ok(card.hasClass('flex-lg') && card.hasClass('gap-24'));
        assert.ok(card.children().first().hasClass('mb-24') && card.children().first().hasClass('mb-lg-0'), 'Image wrapper needs mobile spacing and a large-screen reset');
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
      if (example.attr('aria-label') === 'Horizontal image-right card') {
        assert.equal(card.children().first().prop('tagName'), 'A', 'Image must precede content on mobile');
        assert.ok(card.children().first().hasClass('order-lg-last'), 'Image wrapper must move last from large');
      }

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
  require('./test-marquees.cjs')();
  require('./test-example-picker.cjs')();
  require('./check-card-components.cjs')(output, core);
  require('./test-icons.cjs')(output);
  require('./check-author-card.cjs')(output);
  console.log('UI checks: core CSS, utilities, assets, matching live/copy HTML, shared teaching copy, responsive card variants, and page layouts.');
};
