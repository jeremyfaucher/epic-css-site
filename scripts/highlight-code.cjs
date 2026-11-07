const cheerio = require('cheerio');
const { pairedShortcode } = require('@11ty/eleventy-plugin-syntaxhighlight');

module.exports = function highlightCode(content) {
  const $ = cheerio.load(content);
  $('pre > code').each((_, element) => {
    const code = $(element);
    const language = ((code.attr('class') || '') + ' ' + (code.parent().attr('class') || '')).match(/(?:^|\s)language-([a-z0-9-]+)/i);
    if (!language || /^(text|plain|plaintext)$/.test(language[1]) || code.find('.token').length) return;
    const aliases = { sh: 'bash', shell: 'bash', js: 'javascript', html: 'markup' };
    const grammar = aliases[language[1]] || language[1];
    const original = code.text();
    const highlighted = pairedShortcode(original, grammar, '', { lineSeparator: '\n', trim: false });
    const result = cheerio.load(highlighted, null, false);
    code.html(result('code').html()).addClass('language-' + language[1]);
    code.parent().addClass('language-' + language[1]);
    if (code.text() !== original) throw new Error('Syntax highlighting changed copyable code');
  });
  return $.html();
};
