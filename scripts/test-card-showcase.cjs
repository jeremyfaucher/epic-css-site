const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

module.exports = function testShowcase() {
  function element(id) {
    return {
      id, hidden: false, attrs: {}, handlers: {},
      classList: { toggle() {} },
      setAttribute(name, value) { this.attrs[name] = value; },
      addEventListener(type, handler) { this.handlers[type] = handler; },
      focus() { this.focused = true; }
    };
  }
  function fixture() {
    const controls = element(), tablist = element(), toggle = element();
    controls.hidden = true;
    const tabs = [element('vertical-tab'), element('horizontal-tab')];
    const panels = [element(), element()], code = [element(), element()];
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
  assert.equal(first.toggle.textContent, 'Hide code');
  for (const [index, key, expected] of [[1, 'ArrowRight', 0], [0, 'ArrowLeft', 1], [1, 'Home', 0], [0, 'End', 1]]) {
    let prevented = false;
    first.tabs[index].handlers.keydown({ key, preventDefault() { prevented = true; } });
    assert.ok(prevented);
    assert.equal(first.tabs[expected].attrs['aria-selected'], 'true');
    assert.equal(first.tabs[expected].tabIndex, 0);
    assert.ok(first.tabs[expected].focused);
  }
  first.toggle.handlers.click();
  assert.ok(first.code.every(code => code.hidden));
  assert.equal(second.tabs[0].attrs['aria-selected'], 'true', 'Showcases must stay independent');
  assert.equal(second.toggle.attrs['aria-expanded'], 'false');
  console.log('Showcase controls: tabs, arrow/Home/End focus, selected/expanded state, code toggling, and isolation passed.');
};
