const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

module.exports = function testSliders() {
  const source = fs.readFileSync(path.join(__dirname, '../src/_includes/slider-script.njk'), 'utf8');
  function fixture() {
    const calls = [];
    const events = {};
    const elements = {
      '[data-slider-viewport]': { scrollBy: options => calls.push(options) },
      '[data-slider-track]': {},
      '[data-slider-card]': { getBoundingClientRect: () => ({ width: 300 }) },
      '[data-slider-previous]': { addEventListener: (_, handler) => { events.previous = handler; } },
      '[data-slider-next]': { addEventListener: (_, handler) => { events.next = handler; } }
    };
    return { dataset: {}, querySelector: selector => elements[selector], calls, events };
  }
  for (const readyState of ['loading', 'complete']) {
    const first = fixture(), second = fixture();
    let ready;
    const context = {
      document: {
        readyState,
        querySelectorAll: () => [first, second, { dataset: {}, querySelector: () => null }],
        addEventListener: (_, handler) => { ready = handler; }
      },
      getComputedStyle: () => ({ columnGap: '16px' })
    };
    vm.runInNewContext(source, context);
    if (ready) ready();
    first.events.next();
    first.events.previous();
    assert.equal(JSON.stringify(first.calls), JSON.stringify([{ left: 316, behavior: 'smooth' }, { left: -316, behavior: 'smooth' }]));
    assert.equal(second.calls.length, 0, 'Controls must stay scoped to their own slider');
    second.events.next();
    assert.equal(second.calls[0].left, 316);
    vm.runInNewContext(source, context); // Initialization is safe to repeat.
    if (ready) ready();
  }
  console.log('Slider behavior: Previous/Next, per-slider isolation, ready/load initialization, and missing-element guards passed.');
};
