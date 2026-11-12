document.querySelectorAll('[data-code-showcase]').forEach(showcase => {
  const toggle = showcase.querySelector('[data-code-showcase-toggle]');
  const code = showcase.querySelector('[data-example-code]');
  if (!toggle || !code || toggle.getAttribute('aria-controls') !== code.id) return;
  function setVisible(visible) {
    code.hidden = !visible;
    toggle.setAttribute('aria-expanded', String(visible));
    toggle.textContent = visible ? 'Hide code' : 'Show code';
    toggle.classList.toggle('btn-primary', visible);
    toggle.classList.toggle('btn-secondary', !visible);
  }
  toggle.addEventListener('click', () => setVisible(code.hidden));
  setVisible(false);
  toggle.hidden = false;
});

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-copy-example]');
  if (!button) return;
  const example = button.closest('[data-example], .docs-example');
  if (!example) return;
  const feedback = example.querySelector('[data-copy-feedback], .docs-copy-feedback');
  try {
    const selector = button.dataset.copyLanguage === 'javascript' ? 'pre code.language-javascript' : 'pre code';
    await navigator.clipboard.writeText(example.querySelector(selector).textContent.trim());
    feedback.textContent = 'Copied';
  } catch {
    feedback.textContent = 'Select the code below to copy it.';
  }
});
