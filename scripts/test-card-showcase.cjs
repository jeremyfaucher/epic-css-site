const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

module.exports = function testShowcase() {
  function element(id) {
    const classes = new Set(['btn', 'btn-secondary']);
    return {
      id, hidden: false, attrs: {}, handlers: {},
      classList: {
        toggle(name, enabled) { if (enabled) classes.add(name); else classes.delete(name); },
        contains(name) { return classes.has(name); }
      },
      setAttribute(name, value) { this.attrs[name] = value; },
      addEventListener(type, handler) { this.handlers[type] = handler; },
      focus() { this.focused = true; }
    };
  }
  function fixture() {
    const controls = element(), tablist = element(), toggle = element();
    controls.hidden = true;
    const tabs = [element('vertical-tab'), element('horizontal-tab'), element('horizontal-right-tab')];
    const panels = [element(), element(), element()], code = [element(), element(), element()];
    return { controls, tablist, toggle, tabs, panels, code,
      querySelector: selector => ({ '[data-showcase-controls]': controls, '[data-showcase-tabs]': tablist, '[data-showcase-code-toggle]': toggle }[selector]),
      querySelectorAll: selector => ({ '[data-showcase-tab]': tabs, '[data-showcase-panel]': panels, '[data-example-code]': code }[selector])
    };
  }
  const first = fixture(), second = fixture();
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/assets/js/card-showcase.js'), 'utf8'), {
    document: { querySelectorAll: () => [first, second] }
  });
  assert.equal(first.controls.hidden, false);
  assert.equal(first.tablist.attrs.role, 'tablist');
  assert.equal(first.tabs[0].attrs['aria-selected'], 'true');
  assert.ok(first.tabs[0].classList.contains('btn-primary'));
  assert.ok(!first.tabs[0].classList.contains('btn-secondary'));
  assert.ok(first.tabs[1].classList.contains('btn-secondary'));
  assert.equal(first.tabs[1].tabIndex, -1);
  assert.equal(first.panels[1].hidden, true);
  assert.equal(first.panels[0].attrs.role, 'tabpanel');
  assert.equal(first.panels[0].attrs['aria-labelledby'], 'vertical-tab');
  assert.ok(first.code.every(code => code.hidden));
  assert.equal(first.toggle.attrs['aria-expanded'], 'false');
  first.tabs[1].handlers.click();
  assert.equal(first.panels[0].hidden, true);
  assert.equal(first.tabs[1].attrs['aria-selected'], 'true');
  first.toggle.handlers.click();
  assert.ok(first.code.every(code => !code.hidden));
  assert.equal(first.toggle.attrs['aria-expanded'], 'true');
  assert.ok(first.toggle.classList.contains('btn-primary'));
  assert.ok(!first.toggle.classList.contains('btn-secondary'));
  assert.equal(first.toggle.textContent, 'Hide code');
  for (const [index, key, expected] of [[1, 'ArrowRight', 2], [2, 'ArrowRight', 0], [0, 'ArrowLeft', 2], [2, 'Home', 0], [0, 'End', 2]]) {
    let prevented = false;
    first.tabs[index].handlers.keydown({ key, preventDefault() { prevented = true; } });
    assert.ok(prevented);
    assert.equal(first.tabs[expected].attrs['aria-selected'], 'true');
    assert.equal(first.tabs[expected].tabIndex, 0);
    assert.ok(first.tabs[expected].classList.contains('btn-primary'));
    first.tabs.forEach((tab, current) => assert.equal(tab.classList.contains('btn-secondary'), current !== expected));
    assert.ok(first.tabs[expected].focused);
  }
  first.toggle.handlers.click();
  assert.ok(first.code.every(code => code.hidden));
  assert.ok(first.toggle.classList.contains('btn-secondary'));
  assert.equal(second.tabs[0].attrs['aria-selected'], 'true', 'Showcases must stay independent');
  assert.equal(second.toggle.attrs['aria-expanded'], 'false');
  console.log('Showcase controls: tabs, arrow/Home/End focus, selected/expanded state, code toggling, and isolation passed.');
};
