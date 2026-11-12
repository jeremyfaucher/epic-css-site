// Keeps the site's CHANGELOG.md identical to the epic-css library's source of truth.
//   node scripts/sync-changelog.cjs           copy the library file into this site
//   node scripts/sync-changelog.cjs --check   fail if the copies differ
// The library checkout defaults to ../epic-css; set EPIC_CSS_DIR to use another path.
// When no library checkout exists (for example on Netlify), --check is skipped.
const fs = require('node:fs');
const path = require('node:path');
const { FILE, parseChangelog } = require('./changelog.cjs');

const normalize = text => text.replace(/\r\n?/g, '\n');

function sourceFile() {
  const dir = process.env.EPIC_CSS_DIR || path.resolve(__dirname, '../../epic-css');
  return path.join(dir, 'CHANGELOG.md');
}

function checkChangelogSync(source = sourceFile(), target = FILE) {
  if (!fs.existsSync(source)) return { status: 'skipped', source };
  const same = fs.existsSync(target) &&
    normalize(fs.readFileSync(source, 'utf8')) === normalize(fs.readFileSync(target, 'utf8'));
  return { status: same ? 'in-sync' : 'out-of-sync', source };
}

function syncChangelog(source = sourceFile(), target = FILE) {
  if (!fs.existsSync(source)) throw new Error(`Library changelog not found: ${source}. Set EPIC_CSS_DIR to the epic-css checkout.`);
  const text = normalize(fs.readFileSync(source, 'utf8'));
  parseChangelog(text);
  fs.writeFileSync(target, text);
  return source;
}

module.exports = { checkChangelogSync, syncChangelog };

if (require.main === module) {
  try {
    if (process.argv.includes('--check')) {
      const result = checkChangelogSync();
      if (result.status === 'out-of-sync') throw new Error(`CHANGELOG.md differs from ${result.source}. Run npm run changelog:sync.`);
      console.log(result.status === 'skipped'
        ? `Changelog sync check skipped: ${result.source} not found.`
        : 'CHANGELOG.md matches the library changelog.');
    } else {
      console.log(`Copied ${syncChangelog()} to CHANGELOG.md.`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
