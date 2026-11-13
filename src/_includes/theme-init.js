(() => {
  const root = document.documentElement;
  const key = 'epic-css-theme';
  const valid = value => value === 'light' || value === 'dark';
  let mode = 'dark';
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) mode = saved;
  } catch { /* Storage may be unavailable; the control still works for this page. */ }
  const apply = value => {
    mode = value;
    root.setAttribute('data-theme', mode);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.setAttribute('aria-pressed', String(mode === 'dark'));
      button.textContent = `Dark mode: ${mode === 'dark' ? 'on' : 'off'}`;
      button.hidden = false;
    });
  };
  // Runs before styles are loaded so a saved light preference precedes first paint.
  apply(mode);
  const enhance = () => {
    apply(mode);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        apply(mode === 'dark' ? 'light' : 'dark');
        try { localStorage.setItem(key, mode); } catch { /* Keep the in-page choice. */ }
      });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance, { once: true });
  else enhance();
  window.addEventListener('storage', event => {
    if (event.key === key) apply(valid(event.newValue) ? event.newValue : 'dark');
  });
})();
