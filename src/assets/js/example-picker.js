document.querySelectorAll('[data-example-gallery]').forEach(gallery => {
  const links = Array.from(gallery.querySelectorAll('[data-example-choice]'));
  const panels = Array.from(gallery.querySelectorAll('[data-example-panel]'));
  if (!links.length || links.length !== panels.length) return;

  function select(id) {
    const selected = panels.find(panel => panel.id === id) || panels[0];
    panels.forEach(panel => {
      panel.hidden = panel !== selected;
      panel.dispatchEvent(new Event('examplevisibilitychange'));
    });
    links.forEach(link => {
      const active = link.hash === '#' + selected.id;
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
      link.classList.toggle('active', active);
    });
  }
  function fromHash() {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch { id = ''; }
    const target = document.getElementById(id);
    select(target?.closest('[data-example-panel]')?.id || id);
  }
  links.forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    select(link.hash.slice(1));
    if (window.location.hash !== link.hash) window.history.pushState(null, '', link.hash);
  }));
  window.addEventListener('hashchange', fromHash);
  fromHash();
});
