const assert = require('node:assert/strict');
const cheerio = require('cheerio');
const highlight = require('./highlight-code.cjs');

for (const [language, source] of [
  ['html', '<div class="flex">Hello</div>\n<script>alert("example")</script>\n'],
  ['javascript', 'module.exports = {\n  outputFileName: "style.css"\n};\n'],
  ['scss', '$clr-primary: #0067b8;\n@import "custom";\n'],
  ['bash', 'npm run build\necho "ready"\n'],
  ['sh', 'echo "legacy shell fence"\n'],
]) {
  const input = cheerio.load('<html><body><pre><code></code></pre></body></html>');
  input('code').addClass('language-' + language).text(source);
  const first = cheerio.load(highlight(input.html()));
  assert.equal(first('pre code').text(), source, language + ': copied source changed');
  assert.ok(first('pre .token').length, language + ': no highlighted tokens');
  assert.equal(first('pre script').length, 0, 'Example markup became active HTML');
  const second = cheerio.load(highlight(first.html()));
  assert.equal(second('pre .token').length, first('pre .token').length, 'Double highlighting');
  assert.equal(second('pre code').text(), source);
}
const plain = cheerio.load(highlight('<pre><code class="language-text">folder/\n  file.scss</code></pre>'));
assert.equal(plain('.token').length, 0);
console.log('Syntax highlighting: HTML, JavaScript, Sass and shell preserve exact copyable source; plain text and repeated transforms are safe.');
