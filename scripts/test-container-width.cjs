const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');

module.exports = function testContainerWidth() {
  const loadPaths = [path.join(__dirname, '../src/my-epic-css')];
  function widths(prefix, imports = '@import "variables"; @import "grid";') {
    const css = postcss.parse(sass.compileString(prefix + imports, { loadPaths }).css);
    const result = {};
    for (const selector of ['.container', '.container-post']) {
      css.walkRules(selector, rule => rule.walkDecls('max-width', decl => { result[selector] = decl.value; }));
    }
    return result;
  }
  assert.deepEqual(widths(''), { '.container': '1000px', '.container-post': '1000px' });
  assert.deepEqual(widths('$container-width: 1200px;'), { '.container': '1200px', '.container-post': '1000px' });
  // An assignment at the end of custom has this exact position in the entry:
  // after its other settings, before variables/grid. Keep files unchanged.
  const entry = fs.readFileSync(path.join(loadPaths[0], 'index.scss'), 'utf8');
  assert.ok(entry.includes('@import "_custom";'));
  const customizedEntry = entry.replace('@import "_custom";', '@import "_custom";\n$container-width: 1200px;');
  assert.deepEqual(widths('', customizedEntry), { '.container': '1200px', '.container-post': '1000px' });
  console.log('Container compilation: default 1000px, prior override 1200px, and unchanged container-post 1000px passed.');
};
