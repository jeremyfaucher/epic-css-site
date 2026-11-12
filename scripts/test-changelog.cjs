// Focused checks for the changelog parser and the library/site sync check.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert/strict');
const { parseChangelog, readChangelog } = require('./changelog.cjs');
const { checkChangelogSync } = require('./sync-changelog.cjs');

const doc = body => '# Changelog\n\n' + body.trim() + '\n';
const rejects = (body, pattern) => assert.throws(() => parseChangelog(doc(body)), pattern);

const parsed = parseChangelog(doc(`
## [Unreleased]

## [1.1.0] - 2026-02-01

Note with \`code\`.

### Added

- First change
  continued on a second line.

### Fixed

- A fix.

## [1.0.0] - 2026-01-01

### Removed

- Old thing.

[Unreleased]: https://github.com/jeremyfaucher/epic-css/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/jeremyfaucher/epic-css/releases/tag/v1.1.0
[1.1.0-cdn]: https://cdn.example.com/epic-css/1.1.0/epic.css
`));
assert.equal(parsed.unreleased, null, 'An empty Unreleased section is hidden');
assert.equal(parsed.latest.version, '1.1.0');
assert.deepEqual(parsed.releases.map(item => item.slug), ['v1-1-0', 'v1-0-0']);
const [newest, oldest] = parsed.releases;
assert.deepEqual(newest.notes, ['Note with <code>code</code>.']);
assert.deepEqual(newest.groups, [
  { title: 'Added', items: ['First change continued on a second line.'] },
  { title: 'Fixed', items: ['A fix.'] }
]);
assert.equal(newest.displayDate, 'February 1, 2026');
assert.equal(newest.links.cdn, 'https://cdn.example.com/epic-css/1.1.0/epic.css');
assert.deepEqual(newest.links.source, { url: 'https://github.com/jeremyfaucher/epic-css/releases/tag/v1.1.0', label: 'GitHub release' });
assert.equal(oldest.links.cdn, null, 'No CDN link without a -cdn definition');
assert.equal(oldest.links.source, null);

const planned = parseChangelog(doc('## [Unreleased] - 1.2.0\n\n### Added\n\n- Pending icon.\n\n## [1.1.0] - 2026-02-01\n\nPublished notes.'));
assert.equal(planned.unreleased.plannedVersion, '1.2.0');
assert.equal(planned.unreleased.title, '1.2.0 (Unreleased)');
assert.equal(planned.unreleased.slug, 'unreleased', 'Stable upcoming anchor');
assert.equal(planned.unreleased.date, null);
assert.equal(planned.unreleased.links.npm, null, 'No npm link for a planned version');
assert.equal(planned.latest.version, '1.1.0', 'Upcoming must not replace latest published release');
assert.equal(parseChangelog(doc('## [Unreleased] - 1.2.0\n\n## [1.1.0]\n\nPublished notes.')).unreleased.plannedVersion, '1.2.0', 'An explicit empty plan remains visible');
rejects('## [Unreleased] - 1.1.0\n\n## [1.1.0]\n\nPublished notes.', /planned version must be newer/);
rejects('## [Unreleased] - 2026-02-01\n\n## [1.1.0]\n\nPublished notes.', /Unreleased cannot have a date/);
rejects('## [1.1.0] - 1.2.0\n\nPublished notes.', /only Unreleased/);

rejects('## [1.0.0] - 2026-01-01\n\n- Loose item.', /under a group heading/);
rejects('## [1.0.0] - 2026-01-01\n\n### Improved\n\n- Thing.', /unknown group "Improved"/);
rejects('## [1.0.0] - 2026-01-01\n\n### Fixed\n\n- A.\n\n### Added\n\n- B.', /Added is out of order/);
rejects('## [1.0.0] - 2026-01-01\n\n### Added\n\n- A.\n\n## [1.1.0] - 2026-02-01\n\n### Added\n\n- B.', /1\.1\.0 must be older than 1\.0\.0/);
rejects('## [1.1.0] - 2026-01-01\n\n### Added\n\n- A.\n\n## [1.0.0] - 2026-02-01\n\n### Added\n\n- B.', /dated after newer/);
rejects('## [1.0.0] - 2026-02-30\n\n### Added\n\n- A.', /invalid date/);
rejects('## [1.0.0] - 2026-01-01\n\n### Added\n\n- A.\n\n[0.9.0-cdn]: https://cdn.example.com/0.9.0.css', /does not match a version/);
rejects('## [1.0.0] - 2026-01-01\n\n### Added\n\n- A.\n\n[1.0.0-cdn]: http://cdn.example.com/1.0.0.css', /https URL/);
rejects('## [1.0.0] - 2026-01-01\n\n### Added\n\n- A.\n\n[1.0.0]: https://example.com\n\nTrailing text.', /link definitions must stay together/);

const real = readChangelog();
assert.ok(real.releases.every(item => item.date), 'Every published release in CHANGELOG.md has a date');

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'epic-changelog-'));
try {
  const source = path.join(dir, 'source.md');
  const target = path.join(dir, 'target.md');
  fs.writeFileSync(source, '# Changelog\r\n');
  fs.writeFileSync(target, '# Changelog\n');
  assert.equal(checkChangelogSync(source, target).status, 'in-sync', 'Line endings do not matter');
  fs.writeFileSync(target, '# Changelog\n\nEdited.\n');
  assert.equal(checkChangelogSync(source, target).status, 'out-of-sync');
  assert.equal(checkChangelogSync(path.join(dir, 'missing.md'), target).status, 'skipped');
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}

console.log('Changelog parser and sync checks passed.');
