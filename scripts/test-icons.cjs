const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const sass = require('sass');
const cheerio = require('cheerio');
const data = require('../src/_data/icons');

function checkIcons(output) {
  const $ = cheerio.load(fs.readFileSync(path.join(output, 'ui/icons/index.html'), 'utf8'));
  assert.equal($('[data-icon-card]').length, 21);
  assert.equal($('[data-icon-gallery]').length, 4);
  $('[data-icon-card]').each((_, card) => {
    const item = $(card);
    assert.equal(item.find('[data-icon-preview] svg').attr('viewBox'), '0 0 24 24');
    assert.equal(item.find('[data-icon-preview] svg').attr('stroke'), 'currentColor');
    assert.equal(item.find('[data-copy-icon]').attr('aria-label'), `Copy ${item.attr('data-icon-name')} SVG`);
    assert.equal(item.find('[data-icon-feedback][role="status"][aria-live="polite"]').length, 1);
    const source = cheerio.load(item.find('textarea[readonly]').val(), null, false);
    assert.equal(source.html(), item.find('[data-icon-preview]').html());
  });
  assert.equal($('label[for="icon-size"]').length, 1);
  assert.deepEqual($('[data-icon-size] option').map((_, el) => $(el).attr('value')).get(), ['16', '24', '32', '48']);
  const css = sass.compile(path.join(__dirname, '../src/my-epic-css/_images.scss')).css;
  for (const size of [16, 24, 32, 48]) {
    assert.match(css, new RegExp(`\\.icon-${size}\\s*\\{\\s*width: ${size}px;\\s*height: ${size}px;`));
  }
  assert(!css.includes('<svg'), 'No assets in portable CSS');
  const landing = cheerio.load(fs.readFileSync(path.join(output, 'ui/index.html'), 'utf8'));
  assert.equal(landing('main a[href="/ui/icons/"]').length, 1);
  console.log('Icon markup: 21 original SVGs, four groups/sizes, labeled controls, fallback source, navigation and optional standalone image module passed.');
}

async function testBehavior() {
  const selector = { value: '24', disabled: true, addEventListener(_, fn) { this.change = fn; } };
  const cards = data.groups.flatMap(group => group.items).map(icon => {
    const attributes = { width: '24', height: '24' };
    const svg = { setAttribute(name, value) { attributes[name] = String(value); }, serialize() { return icon.svg.replace('width="24" height="24"', `width="${attributes.width}" height="${attributes.height}"`); } };
    const source = { value: '', focus() { this.focused = true; }, select() { this.selected = true; } };
    const feedback = { textContent: '' }, details = { open: false };
    const button = { hidden: true, addEventListener(_, fn) { this.click = fn; } };
    return { dataset: { iconName: icon.name }, svg, source, feedback, details, button,
      querySelector(name) { return { '[data-icon-preview] svg': svg, '[data-icon-source]': source, '[data-icon-feedback]': feedback, '[data-copy-icon]': button, details }[name]; } };
  });
  const library = { querySelector() { return selector; }, querySelectorAll() { return cards; } };
  let copied;
  const navigator = { clipboard: { async writeText(value) { copied = value; } } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/assets/js/icons.js'), 'utf8'), {
    document: { querySelector() { return library; } }, navigator,
    XMLSerializer: class { serializeToString(svg) { return svg.serialize(); } }
  });
  assert.equal(selector.disabled, false);
  for (const size of [16, 24, 32, 48]) {
    selector.value = String(size); selector.change();
    for (const card of cards) {
      assert(card.source.value.includes(`width="${size}" height="${size}"`));
      await card.button.click();
      assert.equal(copied, card.source.value);
      assert.equal(card.feedback.textContent, `${card.dataset.iconName} SVG copied.`);
      assert.equal(card.button.disabled, false);
    }
  }
  navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); };
  await cards[0].button.click();
  assert(cards[0].details.open && cards[0].source.focused && cards[0].source.selected);
  assert.match(cards[0].feedback.textContent, /Clipboard unavailable/);
  delete navigator.clipboard;
  await cards[1].button.click();
  assert.match(cards[1].feedback.textContent, /Clipboard unavailable/);
  console.log('Icon behavior: all 21 SVGs at all four sizes, exact clipboard payload/success feedback, denied/missing clipboard fallback and focus/selection passed.');
}

module.exports = checkIcons;
if (require.main === module) {
  checkIcons(process.argv[2] || '_site');
  testBehavior().catch(error => { console.error(error); process.exitCode = 1; });
}
