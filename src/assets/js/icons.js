(() => {
  const library = document.querySelector('[data-icon-library]');
  if (!library) return;
  const sizeControl = library.querySelector('[data-icon-size]');
  const cards = [...library.querySelectorAll('[data-icon-card]')];
  function updateSize() {
    const size = Number(sizeControl.value);
    if (![16, 24, 32, 48].includes(size)) return;
    for (const card of cards) {
      const svg = card.querySelector('[data-icon-preview] svg');
      svg.setAttribute('width', size);
      svg.setAttribute('height', size);
      card.querySelector('[data-icon-source]').value = new XMLSerializer().serializeToString(svg);
      card.querySelector('[data-icon-feedback]').textContent = '';
    }
  }
  sizeControl.disabled = false;
  sizeControl.addEventListener('change', updateSize);
  updateSize();
  for (const card of cards) {
    const button = card.querySelector('[data-copy-icon]');
    const source = card.querySelector('[data-icon-source]');
    const feedback = card.querySelector('[data-icon-feedback]');
    button.hidden = false;
    button.addEventListener('click', async () => {
      button.disabled = true;
      feedback.textContent = '';
      try {
        await navigator.clipboard.writeText(source.value);
        feedback.textContent = `${card.dataset.iconName} SVG copied.`;
      } catch {
        card.querySelector('details').open = true;
        source.focus();
        source.select();
        feedback.textContent = 'Clipboard unavailable. SVG selected below; copy it manually.';
      } finally {
        button.disabled = false;
      }
    });
  }
})();
