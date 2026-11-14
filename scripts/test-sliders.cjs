const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

module.exports = function testSliders() {
  const source = fs.readFileSync(path.join(__dirname, '../src/_includes/slider-script.njk'), 'utf8');
  function element(id) {
    const attrs = {}, events = {}, classes = new Set();
    return { id, attrs, events, classes, focused: false,
      setAttribute(name, value) { attrs[name] = value; },
      addEventListener(name, handler) { (events[name] ||= []).push(handler); },
      classList: { toggle(name, active) { if (active) classes.add(name); else classes.delete(name); } },
      focus() { this.focused = true; }
    };
  }
  function fixture(nativeScrollEnd) {
    const viewport = element('viewport'), tablist = element('tabs'), calls = [];
    if (nativeScrollEnd) viewport.onscrollend = null;
    viewport.scrollLeft = 0;
    viewport.clientWidth = 1144;
    viewport.getBoundingClientRect = () => ({ left: 0 });
    viewport.scrollTo = options => { calls.push(options); viewport.scrollLeft = options.left; };
    const tabs = [0, 1, 2].map(i => element('tab-' + i));
    const panels = [0, 1, 2].map(i => {
      const panel = element('panel-' + i);
      panel.getBoundingClientRect = () => ({ left: 52 + i * 1064 - viewport.scrollLeft, width: 1040 });
      return panel;
    });
    return { dataset: {}, viewport, tabs, panels, tablist, calls, closest: () => null,
      querySelector: selector => ({ '[data-slider-viewport]': viewport, '[data-slider-tabs]': tablist })[selector],
      querySelectorAll: selector => selector === '[data-slider-tab]' ? tabs : panels
    };
  }
  function fire(element, type, key) {
    const event = { key, prevented: false, preventDefault() { this.prevented = true; } };
    (element.events[type] || []).forEach(handler => handler(event));
    return event;
  }
  for (const readyState of ['loading', 'complete']) {
    for (const reduced of [false, true]) {
      for (const nativeScrollEnd of [false, true]) {
      const first = fixture(nativeScrollEnd), second = fixture(nativeScrollEnd);
      const pending = new Map();
      const windowEvents = {};
      let ready, timer = 0;
      const context = {
        document: { readyState,
          querySelectorAll: () => [first, second, { dataset: {}, querySelector: () => null, querySelectorAll: () => [] }],
          addEventListener: (_, handler) => { ready = handler; }
        },
        window: { matchMedia: () => ({ matches: reduced }), addEventListener: (name, handler) => { (windowEvents[name] ||= []).push(handler); } },
        setTimeout: fn => { pending.set(++timer, fn); return timer; },
        clearTimeout: id => pending.delete(id)
      };
      vm.runInNewContext(source, context);
      if (ready) ready();
      assert.equal(first.tablist.attrs.role, 'tablist');
      assert.equal(first.tabs[0].attrs['aria-selected'], 'true');
      assert.equal(first.tabs[1].tabIndex, -1);
      assert.equal(first.panels[1].inert, true);
      assert.equal(first.tabs[2].attrs['aria-controls'], 'panel-2');
      assert.equal(first.panels[2].attrs['aria-labelledby'], 'tab-2');
      assert.ok(fire(first.tabs[2], 'click').prevented);
      assert.equal(first.calls.at(-1).left, 2128);
      assert.equal(first.calls.at(-1).behavior, reduced ? 'instant' : 'smooth');
      assert.equal(first.tabs[2].attrs['aria-selected'], 'true');
      assert.equal(first.panels[2].inert, false);
      assert.equal(first.tabs[2].classes.has('btn-primary'), true);
      assert.equal(second.calls.length, 0, 'Sliders must remain independent');
      fire(first.tabs[2], 'keydown', 'ArrowRight');
      assert.equal(first.calls.at(-1).left, 0);
      assert.ok(first.tabs[0].focused);
      fire(first.tabs[0], 'keydown', 'ArrowLeft');
      assert.equal(first.calls.at(-1).left, 2128);
      fire(first.tabs[2], 'keydown', 'Home');
      assert.equal(first.calls.at(-1).left, 0);
      fire(first.tabs[0], 'keydown', 'End');
      assert.equal(first.calls.at(-1).left, 2128);
      const before = first.calls.length;
      assert.equal(fire(first.tabs[2], 'keydown', 'Tab').prevented, false);
      assert.equal(first.calls.length, before);
      first.viewport.scrollLeft = 1064;
      fire(first.viewport, nativeScrollEnd ? 'scrollend' : 'scroll');
      assert.equal(pending.size, nativeScrollEnd ? 0 : 1, 'Native completion must not run a redundant timer');
      if (!nativeScrollEnd) {
        fire(first.viewport, 'scroll');
        assert.equal(pending.size, 1, 'Fallback must debounce repeated scroll events');
      }
      for (const fn of pending.values()) fn();
      pending.clear();
      assert.equal(first.tabs[1].attrs['aria-selected'], 'true', 'Native swipe must update selected tab');
      first.viewport.scrollLeft = 0;
      fire(first.viewport, nativeScrollEnd ? 'scrollend' : 'scroll');
      for (const fn of pending.values()) fn();
      pending.clear();
      assert.equal(first.tabs[0].attrs['aria-selected'], 'true');
      windowEvents.resize.forEach(fn => fn());
      assert.equal(first.calls.at(-1).behavior, 'instant', 'Resize must realign without animation');
      const listeners = first.tabs[0].events.click.length;
      vm.runInNewContext(source, context);
      if (ready) ready();
      assert.equal(first.tabs[0].events.click.length, listeners, 'Repeated initialization must not add listeners');
      }
    }
  }
  console.log('Slider behavior: tabs, keyboard navigation, native/fallback swipe sync, reduced motion, resize, isolation and repeat initialization passed.');
};
if (require.main === module) module.exports();
