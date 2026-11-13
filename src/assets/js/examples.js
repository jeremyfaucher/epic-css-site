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
  const selector = button.dataset.copyLanguage === 'javascript' ? 'pre code.language-javascript' : 'pre code';
  const code = example.querySelector(selector).textContent.trim();
  const notice = button.dataset.copyLanguage === 'javascript' ? '' :
    example.querySelector('[data-example-copy-notice]')?.content.textContent.trim();
  const payload = notice ? `${notice}\n${code}` : code;
  const fallback = example.querySelector('[data-example-copy-fallback]');
  try {
    await navigator.clipboard.writeText(payload);
    feedback.textContent = 'Copied';
    if (fallback) fallback.hidden = true;
  } catch {
    if (notice && fallback) {
      fallback.hidden = false;
      const source = fallback.querySelector('[data-example-copy-source]');
      source.value = payload;
      source.focus();
      source.select();
      feedback.textContent = 'Clipboard unavailable. Complete HTML with license selected below; copy it manually.';
    } else feedback.textContent = 'Select the code below to copy it.';
  }
});
