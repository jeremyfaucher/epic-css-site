const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const postcss = require('postcss');
const cheerio = require('cheerio');

function declarations(css, selector) {
  const result = {};
  postcss.parse(css).walkRules(rule => {
    if (rule.selector.replaceAll('"', '') === selector.replaceAll('"', '')) rule.walkDecls(decl => { result[decl.prop] = decl.value; });
  });
  return result;
}
function luminance(hex) {
  let value = hex.replace('#', '');
  if (value.length === 3) value = [...value].map(c => c + c).join('');
  const channels = value.match(/../g).map(c => parseInt(c, 16) / 255)
    .map(c => c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
  return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722;
}
function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort((a, b) => a - b);
  return (values[1] + .05) / (values[0] + .05);
}
function checkTheme(output, css) {
  const roles = ['body', 'body-bg', 'primary', 'primary-light', 'primary-bg', 'secondary', 'secondary-bg', 'white'];
  const defaults = declarations(css, ':root');
  const filtered = fs.readFileSync(path.join(__dirname, '../src/_includes/style.css'), 'utf8');
  const modes = {};
  for (const mode of ['dark', 'light']) {
    const values = declarations(css, `html[data-theme="${mode}"]`);
    modes[mode] = values;
    for (const role of roles) assert.match(values[`--clr-${role}`], /^#[a-f0-9]{6}$/i);
    const kept = declarations(filtered, `html[data-theme="${mode}"]`);
    for (const role of roles) assert.equal(luminance(kept[`--clr-${role}`]), luminance(values[`--clr-${role}`]), 'Filtered CSS must preserve mode role ' + role);
    assert.equal(values['--clr-white'], '#ffffff');
    assert.equal(values['color-scheme'], mode);
    for (const text of ['body', 'primary', 'primary-light', 'secondary']) {
      for (const background of ['body-bg', 'primary-bg', 'secondary-bg']) {
        const ratio = contrast(values[`--clr-${text}`], values[`--clr-${background}`]);
        assert(ratio >= 4.5, `${mode} ${text} on ${background}: ${ratio.toFixed(2)}`);
      }
    }
  }
  for (const role of roles) assert.equal(defaults[`--clr-${role}`], modes.dark[`--clr-${role}`]);
  const home = cheerio.load(fs.readFileSync(path.join(output, 'index.html'), 'utf8'));
  assert.equal(home('html').attr('data-theme'), 'dark');
  const init = home('head script').first();
  assert(init.text().includes("getItem(key)"), 'Saved choice must be read in the head');
  assert(init.index() < home('head style').first().index(), 'Theme initialization precedes styles');
  const toggle = home('[data-theme-toggle]');
  assert.equal(toggle.length, 1);
  assert.equal(toggle.prop('tagName'), 'BUTTON');
  assert.equal(toggle.attr('type'), 'button');
  assert.equal(toggle.attr('aria-label'), 'Dark mode');
  assert.equal(toggle.attr('aria-pressed'), 'true');
  const headerNav = home('header > nav');
  for (const name of ['flex', 'flex-wrap', 'justify-between', 'items-center', 'gap-16']) assert(headerNav.hasClass(name));
  assert.equal(headerNav.children().first().prop('tagName'), 'UL', 'Navigation links stay first');
  assert.equal(headerNav.children().last().attr('data-theme-toggle'), '', 'Toggle is the separate right-hand flex item');
  assert.equal(headerNav.find('ul a').length, 5, 'All existing navigation links retained');
  for (const name of ['btn', 'clr-secondary', 'py-4', 'px-8']) assert(toggle.hasClass(name));
  assert(!toggle.hasClass('btn-secondary'), 'Compact toggle has no filled palette surface');
  assert.equal(declarations(css, '.py-4')['padding-top'], '0.25rem');
  assert.equal(declarations(css, '.px-8')['padding-left'], '0.5rem');
  assert.equal(declarations(css, '.btn').font, 'inherit', 'Text size remains inherited');
  assert.equal(declarations(css, '[data-theme-toggle][hidden]').display, 'none', 'Button layout must not override its no-JS hidden state');
  const nestedCard = home('#home-card-vertical [data-example-preview].clr-secondary-bg > .clr-primary-bg');
  assert.equal(nestedCard.length, 1, 'Verify the actual secondary-preview/primary-card surface relationship');
  const codeCss = fs.readFileSync(path.join(__dirname, '../src/site-styles/_code.scss'), 'utf8');
  const code = require('sass').compileString(codeCss).css;
  const baseCode = declarations(code, ':root');
  const lightCode = declarations(code, 'html[data-theme="light"]');
  for (const palette of [baseCode, lightCode]) {
    for (const [role, value] of Object.entries(palette).filter(([role]) => role !== '--code-bg')) {
      assert(contrast(value, palette['--code-bg']) >= 4.5, `${role} code contrast`);
    }
  }
  const docs = cheerio.load(fs.readFileSync(path.join(output, 'docs/colors/index.html'), 'utf8'));
  assert(docs('head style').text().includes('color-mix('), 'Docs boundaries must follow runtime roles');
  assert(docs('head style').text().includes('--code-tag'), 'Code colors must follow mode');
  testPresets();
  console.log('Theme CSS: both complete modes, unchanged dark defaults, fixed white, 24 semantic text/surface pairs and 16 syntax color pairs pass >=4.5 contrast checks; early initialization and native toggle verified.');
}

function testPresets() {
  const sass = require('sass');
  const directory = path.join(__dirname, '../src/my-epic-css');
  const options = { loadPaths: [directory], logger: sass.Logger.silent };
  const roles = ['body', 'body-bg', 'primary', 'primary-light', 'primary-bg', 'secondary', 'secondary-bg', 'white'];
  for (const [name, background] of [['Harbor', '#0f172a'], ['Dusk', '#201f2b'], ['Neon', '#000000']]) {
    const css = sass.compileString(`$palette-name: "${name}"; @import "index";`, options).css;
    const defaults = declarations(css, ':root');
    assert.equal(defaults['--clr-body-bg'], background, name + ' selection');
    for (const mode of ['light', 'dark']) {
      const palette = declarations(css, `html[data-theme="${mode}"]`);
      for (const role of roles) assert.match(palette[`--clr-${role}`], /^#[a-f0-9]{6}$/i);
      assert.equal(palette['--clr-white'], '#ffffff');
      assert.equal(palette['color-scheme'], mode);
      if (name === 'Neon' && mode === 'light') {
        // A palette-specific design guard, not an accessibility threshold for card backgrounds.
        assert.equal(palette['--clr-secondary-bg'], '#c7dcd4');
        assert.equal(palette['--clr-primary-bg'], '#f3ede7');
        assert(contrast(palette['--clr-primary-bg'], palette['--clr-secondary-bg']) >= 1.2,
          'Neon light nested surfaces should retain the chosen visual separation');
      }
      if (mode === 'dark') for (const role of roles) assert.equal(defaults[`--clr-${role}`], palette[`--clr-${role}`]);
      for (const text of ['body', 'primary', 'primary-light', 'secondary']) {
        for (const surface of ['body-bg', 'primary-bg', 'secondary-bg']) {
          assert(contrast(palette[`--clr-${text}`], palette[`--clr-${surface}`]) >= 4.5, `${name} ${mode} ${text}/${surface}`);
        }
      }
    }
  }
  assert.throws(() => sass.compileString('$palette-name: "Unknown"; @import "index";', options), /Unknown palette.*Unknown/);
  const custom = fs.readFileSync(path.join(directory, '_custom.scss'), 'utf8');
  assert.throws(() => sass.compileString(custom.replace('light: (', 'day: ('), options), /requires both light and dark/);
  assert.throws(() => sass.compileString(custom.replace('primary-light: #', 'unused-role: #'), options), /missing role.*primary-light/);
  assert.throws(() => sass.compileString(custom.replace('"white": #ffffff', '"white": #eeeeee'), options), /keep white as/);
  console.log('Named presets: Harbor/Dusk/Neon, both modes, 72 semantic contrast pairs >=4.5, default wiring and invalid-name/mode/role/white errors passed.');
}

function testBehavior() {
  const script = fs.readFileSync(path.join(__dirname, '../src/_includes/theme-init.js'), 'utf8');
  function fixture(saved, blocked = false, ready = false) {
    const attributes = {}, listeners = {}, events = {}, button = { hidden: true, textContent: '', attributes: {}, setAttribute(k, v) { this.attributes[k] = v; }, addEventListener(k, fn) { this[k] = fn; } };
    let available = ready, stored = saved;
    const document = { readyState: ready ? 'complete' : 'loading', documentElement: { setAttribute(k, v) { attributes[k] = v; } },
      querySelectorAll() { return available ? [button] : []; }, addEventListener(k, fn) { listeners[k] = fn; } };
    vm.runInNewContext(script, { document, window: { addEventListener(k, fn) { events[k] = fn; } },
      localStorage: { getItem() { if (blocked) throw Error('blocked'); return stored; }, setItem(k, value) { if (blocked) throw Error('blocked'); stored = value; } } });
    return { attributes, button, events, stored: () => stored, load() { available = true; listeners.DOMContentLoaded(); } };
  }
  for (const saved of [null, 'invalid', 'dark', 'light']) {
    const f = fixture(saved);
    const expected = saved === 'light' ? 'light' : 'dark';
    assert.equal(f.attributes['data-theme'], expected, 'Saved choice applied before body controls exist');
    f.load(); assert.equal(f.button.hidden, false);
    assert.equal(f.button.attributes['aria-pressed'], String(expected === 'dark'));
    f.button.click(); assert.equal(f.attributes['data-theme'], expected === 'dark' ? 'light' : 'dark');
    assert.equal(f.stored(), f.attributes['data-theme']);
    f.button.click(); assert.equal(f.attributes['data-theme'], expected);
    f.events.storage({ key: 'epic-css-theme', newValue: 'light' }); assert.equal(f.attributes['data-theme'], 'light');
    f.events.storage({ key: 'epic-css-theme', newValue: null }); assert.equal(f.attributes['data-theme'], 'dark');
    f.events.storage({ key: 'other', newValue: 'light' }); assert.equal(f.attributes['data-theme'], 'dark');
  }
  const blocked = fixture('light', true, true);
  assert.equal(blocked.attributes['data-theme'], 'dark');
  blocked.button.click(); assert.equal(blocked.attributes['data-theme'], 'light');
  assert.equal(blocked.button.attributes['aria-pressed'], 'false');
  console.log('Theme behavior: early saved preference, invalid/missing preference, toggle/state persistence, cross-tab changes, blocked reads/writes and late initialization passed.');
}
module.exports = { checkTheme, testBehavior };
if (require.main === module) {
  const sass = require('sass');
  checkTheme(process.argv[2] || '_site', sass.compile('src/my-epic-css/index.scss').css);
  testBehavior();
}
