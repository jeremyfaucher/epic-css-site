const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const data = require('../src/_data/authorExample');

async function main() {
  const root = path.resolve(__dirname, '..');
  const $ = cheerio.load(fs.readFileSync(path.join(root, '_site/ui/cards/index.html'), 'utf8'));
  const displayed = $('[data-example][aria-label="Sidebar author profile"] pre code').text().trim();
  assert(!displayed.includes('The Bootstrap Authors'));
  assert.equal((displayed.match(/<svg /g) || []).length, 4);
  let handler, payload, denied = false, hasNotice = true;
  const feedback = { textContent: '' };
  const source = { value: '', focus() { this.focused = true; }, select() { this.selected = true; } };
  const fallback = { hidden: true, querySelector() { return source; } };
  const example = { querySelector(selector) {
    if (selector === '[data-copy-feedback], .docs-copy-feedback') return feedback;
    if (selector === '[data-example-copy-notice]') return hasNotice ? { content: { textContent: data.copyNotice } } : null;
    if (selector === '[data-example-copy-fallback]') return hasNotice ? fallback : null;
    return { textContent: button.dataset.copyLanguage === 'javascript' ? 'const demo = true;' : displayed };
  } };
  const button = { dataset: {}, closest() { return example; } };
  const navigator = { clipboard: { async writeText(value) { if (denied) throw Error('Denied'); payload = value; } } };
  vm.runInNewContext(fs.readFileSync(path.join(root, 'src/assets/js/examples.js'), 'utf8'), {
    document: { querySelectorAll() { return []; }, addEventListener(type, fn) { if (type === 'click') handler = fn; } }, navigator
  });
  const click = () => handler({ target: { closest() { return button; } } });
  await click();
  assert.equal(payload, data.copyNotice + '\n' + displayed);
  assert.equal((payload.match(/Copyright \(c\) 2019-2024 The Bootstrap Authors/g) || []).length, 1);
  assert.equal((payload.match(/Permission is hereby granted/g) || []).length, 1);
  assert.equal(feedback.textContent, 'Copied');
  denied = true; await click();
  assert.equal(source.value, data.copyNotice + '\n' + displayed);
  assert(source.focused && source.selected && !fallback.hidden);
  assert(feedback.textContent.includes('Complete HTML with license selected'));
  denied = false; await click(); assert(fallback.hidden);
  delete navigator.clipboard; await click(); assert(!fallback.hidden);
  navigator.clipboard = { async writeText(value) { payload = value; } };
  hasNotice = false; await click(); assert.equal(payload, displayed, 'Other examples copy their displayed code unchanged');
  hasNotice = true; button.dataset.copyLanguage = 'javascript'; await click();
  assert.equal(payload, 'const demo = true;', 'JavaScript copies never receive HTML license comments');
  console.log('Copy HTML contract: clean visible card code, one consolidated MIT payload notice, disclosed difference, licensed manual fallback on denial/missing API, success feedback and unchanged ordinary/JS copies passed.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
