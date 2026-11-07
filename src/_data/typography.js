// Derive the reference from the complete utility output, not the filtered site CSS.
const path = require('node:path');
const sass = require('sass');
const postcss = require('postcss');

module.exports = function() {
  const css = postcss.parse(sass.compile(path.resolve(__dirname, '../my-epic-css/index.scss')).css);
  const wide = {};
  const narrow = {};
  let query = '';
  css.walkRules(':root', rule => {
    const media = rule.parent.type === 'atrule' && rule.parent.name === 'media';
    if (media && !rule.parent.params.includes('max-width')) return;
    rule.walkDecls(decl => {
      if (!/^--(?:fs|lh)-/.test(decl.prop)) return;
      (media ? narrow : wide)[decl.prop] = decl.value;
      if (media) query = rule.parent.params;
    });
  });
  function ramp(prefix, property) {
    const rows = [];
    css.walkRules(rule => {
      if (!new RegExp('^\\.' + prefix + '-[0-9]+$').test(rule.selector)) return;
      rule.walkDecls(property, decl => {
        const variable = decl.value.match(/^var\((--[a-z0-9-]+)\)$/);
        rows.push({
          name: rule.selector.slice(1),
          wide: variable ? wide[variable[1]] : decl.value,
          narrow: variable ? narrow[variable[1]] || wide[variable[1]] : decl.value,
        });
      });
    });
    return rows;
  }
  return {
    query,
    sizes: ramp('fs', 'font-size'),
    heights: ramp('lh', 'line-height'),
    weights: ramp('fw', 'font-weight'),
  };
};
