const fs = require('node:fs');
const path = require('node:path');
const { byId } = require('./icons');
const license = fs.readFileSync(path.join(__dirname, '../assets/licenses/bootstrap-icons-LICENSE.txt'), 'utf8').trim();
module.exports = {
  // Displayed card code omits repeated notices; the complete copy payload carries
  // this one notice covering all four Bootstrap Icons. Standalone SVGs retain theirs.
  copyNotice: `<!-- X, LinkedIn, GitHub and RSS artwork adapted from Bootstrap Icons v1.11.3.\nSource: https://github.com/twbs/icons/tree/v1.11.3/icons\n${license}\n-->`,
  icons: Object.fromEntries(['x', 'linkedin', 'github', 'rss'].map(id => [id, byId[id].replace(/<!--[\s\S]*?-->/g, '')])),
  name: 'Alex Example',
  role: 'Theme contributor',
  bio: 'Writes about practical page layouts, shared content and the small decisions that make interfaces easier to read.',
  links: [
    { icon: 'x', label: 'X profile (demo link)', href: 'https://example.com/#x' },
    { icon: 'linkedin', label: 'LinkedIn profile (demo link)', href: 'https://example.com/#linkedin' },
    { icon: 'github', label: 'GitHub profile (demo link)', href: 'https://example.com/#github' },
    { icon: 'rss', label: 'RSS feed (demo link)', href: 'https://example.com/#rss' }
  ]
};
