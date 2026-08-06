document.addEventListener('DOMContentLoaded', () => {
  const tabs = Array.from(document.querySelectorAll('[data-hld-target]'));
  if (!tabs.length) return;

  const panels = Array.from(document.querySelectorAll('.hld-example-panel'));

  const activate = tab => {
    const targetId = tab.dataset.hldTarget;

    tabs.forEach(item => {
      const active = item === tab;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-selected', String(active));
      item.tabIndex = active ? 0 : -1;
    });

    panels.forEach(panel => {
      const active = panel.id === targetId;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab));

    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();

      let nextIndex = index;
      if (event.key === 'ArrowRight') nextIndex = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') nextIndex = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      tabs[nextIndex].focus();
      activate(tabs[nextIndex]);
    });
  });
});

// Protección disuasoria de las páginas HLD renderizadas.
// No impide capturas de pantalla ni el acceso mediante herramientas de desarrollo.
const protectedHldArea = event =>
  event.target.closest?.('.hld-example-viewer, .hld-example-page');

document.addEventListener('contextmenu', event => {
  if (!protectedHldArea(event)) return;
  event.preventDefault();
});

document.addEventListener('dragstart', event => {
  if (!protectedHldArea(event)) return;
  event.preventDefault();
});

document.addEventListener('selectstart', event => {
  if (!protectedHldArea(event)) return;
  event.preventDefault();
});

document.addEventListener('copy', event => {
  if (!protectedHldArea(event)) return;
  event.preventDefault();
});

document.addEventListener('keydown', event => {
  const activeInsideViewer =
    document.activeElement?.closest?.('.hld-example-viewer') ||
    document.querySelector('.hld-example-viewer:hover');

  if (!activeInsideViewer) return;

  const key = event.key.toLowerCase();
  const blocked =
    (event.ctrlKey || event.metaKey) &&
    ['c', 's', 'p', 'u'].includes(key);

  if (blocked) {
    event.preventDefault();
    event.stopPropagation();
  }
});

