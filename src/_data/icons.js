// Original geometric outlines created for this workshop; covered by the site repository MIT license.
// SVG assets remain site content, separate from the optional CSS image module.
const fs = require('node:fs');
const path = require('node:path');
const groups = [
  { name: "Navigation", items: [
    ["chevron-up", "Chevron up", '<path d="m6 15 6-6 6 6"/>'],
    ["chevron-down", "Chevron down", '<path d="m6 9 6 6 6-6"/>'],
    ["chevron-left", "Chevron left", '<path d="m15 6-6 6 6 6"/>'],
    ["chevron-right", "Chevron right", '<path d="m9 6 6 6-6 6"/>'],
    ["arrow-left", "Arrow left", '<path d="M20 12H4m7-7-7 7 7 7"/>'],
    ["arrow-right", "Arrow right", '<path d="M4 12h16m-7-7 7 7-7 7"/>'],
    ["menu", "Menu", '<path d="M4 6h16M4 12h16M4 18h16"/>'],
    ["close", "Close", '<path d="m6 6 12 12M18 6 6 18"/>']
  ] },
  { name: "Actions", items: [
    ["search", "Search", '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4 4"/>'],
    ["plus", "Plus", '<path d="M12 4v16M4 12h16"/>'],
    ["minus", "Minus", '<path d="M4 12h16"/>'],
    ["edit", "Edit", '<path d="m14 5 5 5M4 20l5-1L20 8a2.1 2.1 0 0 0-4-4L5 15l-1 5Z"/>'],
    ["trash", "Trash", '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>'],
    ["download", "Download", '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>']
  ] },
  { name: "Feedback", items: [
    ["check", "Check", '<path d="m4 12 5 5L20 6"/>'],
    ["warning", "Warning", '<path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/>'],
    ["information", "Information", '<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10h.01"/>'],
    ["error", "Error", '<circle cx="12" cy="12" r="9"/><path d="m8 8 8 8m0-8-8 8"/>']
  ] },
  { name: "Engagement", items: [
    ["heart", "Heart / like", '<path d="M12 21 3.5 12.5a5.2 5.2 0 0 1 7.4-7.3L12 6.3l1.1-1.1a5.2 5.2 0 0 1 7.4 7.3L12 21Z"/>'],
    ["comment", "Comment", '<path d="M21 11a8.5 8.5 0 0 1-9 8H7l-5 3 1.5-6A7.6 7.6 0 0 1 3 11a9 9 0 0 1 18 0Z"/>'],
    ["share", "Share", '<circle cx="18" cy="5" r="3"/><circle cx="5" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m7.6 10.6 7.8-4.2m-7.8 7.2 7.8 4.2"/>']
  ] }
];
const byId = {};
for (const group of groups) {
  group.id = group.name.toLowerCase().replaceAll(" ", "-");
  group.items = group.items.map(([id, name, geometry]) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${geometry}</svg>`;
    byId[id] = svg;
    return { id, name, svg };
  });
}
// Bootstrap Icons v1.11.3 (MIT). Full upstream notice is embedded in each SVG
// and copied with it; brand names/marks remain their owners' trademarks.
const social = { name: 'Social and feeds', id: 'social-and-feeds', items: [] };
for (const [id, name, file] of [['x', 'X', 'twitter-x'], ['linkedin', 'LinkedIn', 'linkedin'], ['github', 'GitHub', 'github'], ['rss', 'RSS', 'rss']]) {
  const svg = fs.readFileSync(path.join(__dirname, '../assets/icons/social', file + '.svg'), 'utf8');
  byId[id] = svg;
  social.items.push({ id, name, svg, license: 'MIT', source: `https://github.com/twbs/icons/blob/v1.11.3/icons/${file}.svg` });
}
groups.push(social);
module.exports = { groups, byId };
