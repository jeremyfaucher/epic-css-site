const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

module.exports = function testExamplePicker() {
  const script = fs.readFileSync(path.join(__dirname, '../src/assets/js/example-picker.js'), 'utf8');
  function element(id) {
    const classes = new Set();
    return { id, attrs: {}, events: {}, classes,
      setAttribute(name, value) { this.attrs[name] = value; },
      removeAttribute(name) { delete this.attrs[name]; },
      addEventListener(name, fn) { (this.events[name] ||= []).push(fn); },
      dispatchEvent(event) { (this.events[event.type] || []).forEach(fn => fn(event)); },
      classList: { toggle(name, active) { if (active) classes.add(name); else classes.delete(name); } }
    };
  }
  for (const initialHash of ['', '#logo-marquee', '#logo-marquee-code', '#unknown', '#%broken']) {
    const panels = ['scroll-slider', 'logo-marquee'].map(element);
    panels.forEach(panel => { panel.closest = () => panel; });
    const links = panels.map(panel => Object.assign(element('choose-' + panel.id), { hash: '#' + panel.id }));
    const gallery = { querySelectorAll: selector => selector === '[data-example-choice]' ? links : panels };
    const nodes = Object.fromEntries(panels.map(panel => [panel.id, panel]));
    nodes['logo-marquee-code'] = { closest: () => panels[1] };
    const windowEvents = {}, pushes = [];
    const location = { hash: initialHash };
    const context = {
      Event: class { constructor(type) { this.type = type; } },
      document: { querySelectorAll: () => [gallery], getElementById: id => nodes[id] },
      window: { location,
        history: { pushState(_, __, hash) { pushes.push(hash); location.hash = hash; } },
        addEventListener: (name, fn) => { windowEvents[name] = fn; }
      }
    };
    vm.runInNewContext(script, context);
    const startsOnMarquee = initialHash.startsWith('#logo-marquee');
    assert.equal(panels[0].hidden, startsOnMarquee);
    assert.equal(panels[1].hidden, !startsOnMarquee);
    assert.equal(pushes.length, 0, 'Loading a direct link must not add history entries');
    let prevented = false;
    const click = { button: 0, preventDefault() { prevented = true; } };
    links[1].dispatchEvent({ type: 'click', ...click });
    assert.ok(prevented);
    assert.equal(location.hash, '#logo-marquee');
    assert.equal(panels[0].hidden, true);
    assert.equal(panels[1].hidden, false);
    assert.equal(links[1].attrs['aria-current'], 'true');
    assert.equal(links[0].attrs['aria-current'], undefined);
    assert.ok(links[1].classes.has('active'));
    assert.equal(links[0].classes.has('active'), false);
    const count = pushes.length;
    links[1].dispatchEvent({ type: 'click', ...click });
    assert.equal(pushes.length, count, 'Selecting the current example must not duplicate history');
    location.hash = '';
    windowEvents.hashchange();
    assert.equal(panels[0].hidden, false, 'Back to the base URL must select the default');
    location.hash = '#logo-marquee';
    windowEvents.hashchange();
    assert.equal(panels[1].hidden, false, 'Forward navigation must restore the linked example');
    prevented = false;
    links[0].dispatchEvent({ type: 'click', ...click, ctrlKey: true });
    assert.equal(prevented, false, 'Modified clicks must keep native open-in-new-tab behavior');
    assert.equal(panels[1].hidden, false);
  }

  const details = element('code');
  const summary = { textContent: 'Show code' };
  details.open = false;
  details.querySelector = () => summary;
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/assets/js/examples.js'), 'utf8'), {
    document: { querySelectorAll: selector => selector === '[data-example-details]' ? [details] : [], addEventListener() {} }
  });
  details.open = true;
  details.dispatchEvent({ type: 'toggle' });
  assert.equal(summary.textContent, 'Hide code');
  details.open = false;
  details.dispatchEvent({ type: 'toggle' });
  assert.equal(summary.textContent, 'Show code');
  console.log('Example picker: default/deep links, invalid hashes, history, selected state, modified clicks and code disclosures passed.');
};
if (require.main === module) module.exports();
