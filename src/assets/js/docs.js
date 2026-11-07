// Preserve old single-page documentation anchors.
if (/^\/docs\/?$/.test(window.location.pathname)) {
  const topics = { '#flexbox': 'flexbox', '#grid': 'grid', '#colors': 'colors' };
  const topic = topics[window.location.hash];
  if (topic) window.location.replace('/docs/' + topic + '/' + window.location.hash);
}

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy-example]');
  if (!button) return;
  const example = button.closest('.docs-example');
  const feedback = example.querySelector('.docs-copy-feedback');
  try {
    await navigator.clipboard.writeText(example.querySelector('pre code').textContent.trim());
    feedback.textContent = 'Copied';
  } catch {
    feedback.textContent = 'Select the code below to copy it.';
  }
});
