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
