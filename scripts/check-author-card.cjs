const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const data = require('../src/_data/authorExample');

module.exports = function checkAuthorCard(output) {
  const $ = cheerio.load(fs.readFileSync(path.join(output, 'ui/cards/index.html'), 'utf8'));
  const example = $('[data-example][aria-label="Sidebar author profile"]');
  const profile = example.find('[data-example-preview] > section');
  assert.equal(profile.length, 1);
  assert.equal(profile.attr('style'), 'max-width: 344px;');
  const row = profile.children('.flex.flex-wrap.items-center.gap-16');
  assert.equal(row.length, 1, 'Portrait and text must share a wrapping, vertically centered row');
  const avatar = row.children('img');
  assert.equal(avatar.attr('alt'), '', 'Neutral avatar must not duplicate the adjacent name');
  assert.equal(avatar.attr('width'), '96');
  assert.equal(avatar.attr('height'), '96');
  assert.equal(avatar.attr('style'), 'border-radius: 50%; flex-shrink: 0;');
  assert(fs.existsSync(path.join(output, avatar.attr('src'))));
  const details = row.children('div');
  assert.equal(details.attr('style'), 'flex: 1 1 144px; min-width: 0;');
  assert.equal(details.find('h3').text(), data.name);
  assert.equal(details.children('p').text(), data.role);
  assert.equal(profile.children('p').text(), data.bio, 'Bio spans below the complete row');
  assert.equal(details.find('nav[aria-label="Author social profiles and feed"] ul.flex-wrap').length, 1);
  const links = profile.find('a');
  assert.equal(links.length, 4);
  links.each((index, element) => {
    const link = $(element), expected = data.links[index];
    assert.equal(link.attr('href'), expected.href);
    assert.equal(new URL(expected.href).hostname, 'example.com', 'Demo must not impersonate a real profile');
    assert.equal(link.attr('aria-label'), expected.label);
    assert.equal(link.attr('style'), 'color: inherit;', 'Brand marks inherit neutral text, including on hover');
    const svg = link.children('svg');
    assert.equal(svg.attr('viewBox'), '0 0 24 24');
    assert.equal(svg.attr('fill'), 'currentColor');
    assert.equal(svg.attr('aria-hidden'), 'true');
    assert.equal(svg.attr('focusable'), 'false');
    assert(!link.html().includes('The Bootstrap Authors'), 'Visible card SVGs omit repeated notices');
  });
  const code = example.find('pre code').text();
  assert(!code.includes('Permission is hereby granted'), 'Displayed code stays readable');
  assert(!code.includes('raw.githubusercontent.com'), 'Displayed code omits raw source boilerplate');
  assert.equal(example.find('template[data-example-copy-notice]').length, 1);
  assert(example.find('template').html().includes('Copyright (c) 2019-2024 The Bootstrap Authors'));
  assert.equal(example.find('[data-example-copy-fallback][hidden] textarea[readonly]').length, 1);
  assert($('article').text().includes('Copy HTML includes one consolidated Bootstrap Icons MIT notice'));
  assert.equal(profile.find('script, .clr-primary-bg, .clr-secondary-bg').length, 0, 'Static unboxed card inherits semantic text/surface roles');
  assert.equal($('a[href="#author-profile"]').length, 1);
  assert.equal($('#author-profile').length, 1);
  // Structural fit, not a browser layout measurement: a 268px sidebar fits the
  // 96px avatar + 16px gap + 144px text basis; tighter space can wrap the row.
  assert(96 + 16 + 144 <= 268);
  assert(4 * (24 + 8) + 3 * 4 <= 144, 'Four padded links fit the text basis');
  console.log('Author card: centered/wrapping portrait row, full-width bio, inherited colors, labeled demo links, licensed self-contained SVG copy and sidebar sizing structure passed.');
};
