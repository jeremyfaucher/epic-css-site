const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

module.exports = function testMarquees() {
  const source = fs.readFileSync(path.join(__dirname, '../src/_includes/marquee-script.njk'), 'utf8');
  function element() {
    return { events: {}, attrs: {},
      addEventListener(name, handler) { (this.events[name] ||= []).push(handler); },
      setAttribute(name, value) { this.attrs[name] = value; }
    };
  }
  function fixture() {
    const viewport = element(), button = element(), track = element();
    const animation = { state: '', play() { this.state = 'playing'; }, pause() { this.state = 'paused'; }, cancel() { this.state = 'idle'; } };
    const calls = [];
    track.animate = (frames, options) => { calls.push({ frames, options }); return animation; };
    const example = element();
    example.hidden = false;
    return { dataset: {}, viewport, button, track, animation, calls, example, closest: () => example,
      querySelector: selector => ({ '[data-marquee-viewport]': viewport, '[data-marquee-toggle]': button, '[data-marquee-track]': track })[selector]
    };
  }
  const fire = (element, event) => (element.events[event] || []).forEach(fn => fn());
  for (const readyState of ['loading', 'complete']) {
    for (const reduced of [false, true]) {
      const first = fixture(), second = fixture(), unsupported = fixture();
      unsupported.track.animate = undefined;
      const media = [];
      let ready;
      const context = {
        document: { readyState,
          querySelectorAll: () => [first, second, unsupported, { dataset: {}, querySelector: () => null }],
          addEventListener: (_, fn) => { ready = fn; }
        },
        window: { matchMedia: () => {
          const motion = element(); motion.matches = reduced; media.push(motion); return motion;
        } }
      };
      vm.runInNewContext(source, context);
      if (ready) ready();
      assert.equal(first.calls.length, 1);
      assert.equal(first.calls[0].frames[1].transform, 'translateX(-50%)');
      assert.equal(first.calls[0].options.iterations, Infinity);
      assert.equal(first.calls[0].options.easing, 'linear');
      assert.equal(first.animation.state, reduced ? 'idle' : 'playing');
      assert.equal(first.button.disabled, reduced);
      assert.equal(unsupported.calls.length, 0, 'Unsupported animation leaves the row static');
      media[0].matches = false;
      fire(media[0], 'change');
      assert.equal(first.animation.state, 'playing');
      fire(first.button, 'click');
      assert.equal(first.animation.state, 'paused');
      assert.equal(first.button.textContent, 'Resume scrolling');
      assert.equal(second.animation.state, reduced ? 'idle' : 'playing', 'Controls must be scoped');
      fire(first.viewport, 'mouseenter');
      fire(first.viewport, 'mouseleave');
      assert.equal(first.animation.state, 'paused', 'Leaving hover must preserve explicit pause');
      fire(first.button, 'click');
      assert.equal(first.animation.state, 'playing');
      fire(first.viewport, 'mouseenter');
      assert.equal(first.animation.state, 'paused');
      fire(first.viewport, 'mouseleave');
      assert.equal(first.animation.state, 'playing');
      fire(first.viewport, 'focus');
      assert.equal(first.animation.state, 'paused');
      fire(first.viewport, 'blur');
      assert.equal(first.animation.state, 'playing');
      first.example.hidden = true;
      fire(first.example, 'examplevisibilitychange');
      assert.equal(first.animation.state, 'paused', 'Unselected examples must stop animating');
      first.example.hidden = false;
      fire(first.example, 'examplevisibilitychange');
      assert.equal(first.animation.state, 'playing');
      media[0].matches = true;
      fire(media[0], 'change');
      assert.equal(first.animation.state, 'idle', 'Reduced motion removes the transform rather than freezing clipped logos');
      assert.equal(first.button.textContent, 'Motion paused');
      assert.equal(first.button.disabled, true);
      vm.runInNewContext(source, context);
      if (ready) ready();
      assert.equal(first.calls.length, 1, 'Repeated initialization must not start another animation');
    }
  }
  console.log('Marquee behavior: seamless animation, pause/resume, hover/focus, live reduced-motion preferences, fallback and isolation passed.');
};
if (require.main === module) module.exports();
