// Preserve old single-page documentation anchors.
if (/^\/docs\/?$/.test(window.location.pathname)) {
  const topics = { '#flexbox': 'flexbox', '#grid': 'grid', '#colors': 'colors' };
  const topic = topics[window.location.hash];
  if (topic) window.location.replace('/docs/' + topic + '/' + window.location.hash);
}
