// Parses the Keep a Changelog file mirrored from the epic-css library.
// Throws on structural mistakes so a malformed release note fails the build.
const fs = require('node:fs');
const path = require('node:path');
const MarkdownIt = require('markdown-it');

const FILE = path.resolve(__dirname, '../CHANGELOG.md');
const GROUPS = ['Added', 'Changed', 'Deprecated', 'Removed', 'Fixed', 'Security'];
const REPO = 'https://github.com/jeremyfaucher/epic-css';
const md = new MarkdownIt({ html: false });

const compareVersions = (a, b) => {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

function linkLabel(url) {
  if (url.includes('/releases/tag/')) return 'GitHub release';
  if (url.includes('/commit/')) return 'Source commit';
  if (url.includes('/compare/')) return 'Compare changes';
  return 'Source';
}

function parseChangelog(text) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  const intro = [];
  const entries = [];
  const refs = new Map();
  let entry = null;
  let group = null;
  let block = null;
  const fail = (number, message) => { throw new Error(`CHANGELOG.md line ${number}: ${message}`); };
  const flush = () => {
    if (!block) return;
    const html = md.renderInline(block.text.join(' '));
    if (block.type === 'item') group.items.push(html);
    else (entry ? entry.notes : intro).push(html);
    block = null;
  };

  if (lines[0] !== '# Changelog') fail(1, 'expected "# Changelog" as the first line');
  lines.slice(1).forEach((line, index) => {
    const number = index + 2;
    let match;
    if (!line.trim()) return flush();
    if ((match = /^\[([^\]]+)\]:\s+(\S+)$/.exec(line))) {
      flush();
      if (refs.has(match[1])) fail(number, `duplicate link definition [${match[1]}]`);
      refs.set(match[1], { url: match[2], line: number });
      return;
    }
    if (refs.size) fail(number, 'link definitions must stay together at the end of the file');
    if (line.startsWith('## ')) {
      flush();
      match = /^## \[(Unreleased|\d+\.\d+\.\d+)\](?: - (?:(\d{4}-\d{2}-\d{2})|(\d+\.\d+\.\d+)))?$/.exec(line);
      if (!match) fail(number, 'use "## [X.Y.Z] - YYYY-MM-DD" or "## [Unreleased] - X.Y.Z"');
      const [, version, date, plannedVersion] = match;
      const unreleased = version === 'Unreleased';
      if (unreleased && entries.length) fail(number, 'Unreleased must be the first version');
      if (unreleased && date) fail(number, 'Unreleased cannot have a date');
      if (!unreleased && plannedVersion) fail(number, 'only Unreleased may specify a planned version');
      if (date && new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date) fail(number, `invalid date ${date}`);
      const previous = entries.filter(item => !item.unreleased).at(-1);
      if (!unreleased && previous) {
        if (compareVersions(previous.version, version) <= 0) fail(number, `${version} must be older than ${previous.version}`);
        if (date && previous.date && date > previous.date) fail(number, `${version} is dated after newer ${previous.version}`);
      }
      entry = { version, plannedVersion: plannedVersion || null, date: date || null, unreleased, line: number, notes: [], groups: [] };
      group = null;
      entries.push(entry);
      return;
    }
    if (line.startsWith('### ')) {
      flush();
      const title = line.slice(4);
      if (!entry) fail(number, 'group heading before a version heading');
      if (!GROUPS.includes(title)) fail(number, `unknown group "${title}"; use ${GROUPS.join(', ')}`);
      if (entry.groups.some(item => item.title === title)) fail(number, `duplicate ${title} group`);
      if (entry.groups.length && GROUPS.indexOf(title) < GROUPS.indexOf(entry.groups.at(-1).title)) fail(number, `${title} is out of order; order groups as ${GROUPS.join(', ')}`);
      group = { title, items: [] };
      entry.groups.push(group);
      return;
    }
    if (line.startsWith('#')) fail(number, 'unsupported heading level');
    if (line.startsWith('- ')) {
      flush();
      if (!group) fail(number, 'list items belong under a group heading such as "### Added"');
      block = { type: 'item', text: [line.slice(2).trim()] };
      return;
    }
    if (block && block.type === 'item' && line.startsWith('  ')) {
      block.text.push(line.trim());
      return;
    }
    if (group) fail(number, 'notes must come before the first group heading of a version');
    if (!block) block = { type: 'note', text: [] };
    block.text.push(line.trim());
  });
  flush();

  for (const item of entries) {
    for (const g of item.groups) if (!g.items.length) fail(item.line, `${item.version} has an empty ${g.title} group`);
    if (!item.unreleased && !item.notes.length && !item.groups.length) fail(item.line, `${item.version} has no notes or changes`);
  }
  const versions = new Set(entries.map(item => item.version));
  const upcoming = entries.find(item => item.unreleased);
  const latestRelease = entries.find(item => !item.unreleased);
  if (upcoming?.plannedVersion && latestRelease && compareVersions(upcoming.plannedVersion, latestRelease.version) <= 0) {
    fail(upcoming.line, 'planned version must be newer than the latest released version');
  }
  for (const [label, ref] of refs) {
    const target = label.replace(/-cdn$/, '');
    if (!versions.has(target)) fail(ref.line, `link definition [${label}] does not match a version`);
    if (label.endsWith('-cdn') && (target === 'Unreleased' || !ref.url.startsWith('https://'))) {
      fail(ref.line, 'CDN links need a released version and an https URL');
    }
  }

  const format = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });
  const releases = entries.map(item => {
    const source = refs.get(item.version);
    const cdn = refs.get(item.version + '-cdn');
    return {
      version: item.version,
      plannedVersion: item.plannedVersion,
      title: item.unreleased ? (item.plannedVersion ? `${item.plannedVersion} (Unreleased)` : 'Unreleased') : item.version,
      slug: item.unreleased ? 'unreleased' : 'v' + item.version.replaceAll('.', '-'),
      unreleased: item.unreleased,
      date: item.date,
      displayDate: item.date ? format.format(new Date(item.date + 'T00:00:00Z')) : null,
      notes: item.notes,
      groups: item.groups,
      links: {
        npm: item.unreleased ? null : `https://www.npmjs.com/package/epic-css/v/${item.version}`,
        source: source ? { url: source.url, label: linkLabel(source.url) } : null,
        cdn: cdn ? cdn.url : null,
      },
    };
  });
  const unreleased = releases[0] && releases[0].unreleased ? releases.shift() : null;
  if (!releases.length) throw new Error('CHANGELOG.md has no released versions');
  return {
    intro,
    unreleased: unreleased && (unreleased.plannedVersion || unreleased.notes.length || unreleased.groups.length) ? unreleased : null,
    releases,
    latest: releases[0],
    repository: REPO,
  };
}

const readChangelog = (file = FILE) => parseChangelog(fs.readFileSync(file, 'utf8'));

module.exports = { FILE, GROUPS, parseChangelog, readChangelog };
