document.querySelectorAll('[data-card-showcase]').forEach((showcase) => {
  const controls = showcase.querySelector('[data-showcase-controls]');
  const tablist = showcase.querySelector('[data-showcase-tabs]');
  const tabs = [...showcase.querySelectorAll('[data-showcase-tab]')];
  const panels = [...showcase.querySelectorAll('[data-showcase-panel]')];
  const codeToggle = showcase.querySelector('[data-showcase-code-toggle]');
  const codePanels = [...showcase.querySelectorAll('[data-example-code]')];
  if (!controls || !tablist || !codeToggle || !tabs.length || panels.length !== tabs.length || codePanels.length !== panels.length) return;

  function selectTab(index, focus = false) {
    tabs.forEach((tab, current) => {
      const selected = current === index;
      tab.setAttribute('aria-selected', String(selected));
      tab.classList.toggle('btn-primary', selected);
      tab.classList.toggle('btn-secondary', !selected);
      tab.classList.toggle('fw-600', selected);
      tab.tabIndex = selected ? 0 : -1;
      panels[current].hidden = !selected;
    });
    if (focus) tabs[index].focus();
  }

  let codeVisible = false;
  function updateCode() {
    codePanels.forEach(panel => { panel.hidden = !codeVisible; });
    codeToggle.setAttribute('aria-expanded', String(codeVisible));
    codeToggle.classList.toggle('btn-primary', codeVisible);
    codeToggle.classList.toggle('btn-secondary', !codeVisible);
    codeToggle.textContent = codeVisible ? 'Hide code' : 'Show code';
  }

  tablist.setAttribute('role', 'tablist');
  tabs.forEach((tab, index) => {
    tab.setAttribute('role', 'tab');
    panels[index].setAttribute('role', 'tabpanel');
    panels[index].setAttribute('aria-labelledby', tab.id);
    panels[index].tabIndex = 0;
    tab.addEventListener('click', () => selectTab(index));
    tab.addEventListener('keydown', (event) => {
      let target;
      if (event.key === 'ArrowRight') target = (index + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') target = (index + tabs.length - 1) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else return;
      event.preventDefault();
      selectTab(target, true);
    });
  });
  codeToggle.addEventListener('click', () => {
    codeVisible = !codeVisible;
    updateCode();
  });
  selectTab(0);
  updateCode();
  controls.hidden = false;
});
