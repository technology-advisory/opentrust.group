document.addEventListener('DOMContentLoaded', () => {
  const dialog = document.getElementById('imageViewer');
  const viewerImage = document.getElementById('viewerImage');
  const closeViewer = document.getElementById('closeViewer');

  document.querySelectorAll('.shot-image').forEach(button => {
    button.addEventListener('click', () => {
      viewerImage.src = button.dataset.image;
      viewerImage.alt = button.querySelector('img')?.alt || 'Captura ampliada';
      dialog.showModal();
    });
  });

  closeViewer?.addEventListener('click', () => dialog.close());
  dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && dialog?.open) dialog.close(); });

  const tabs = [...document.querySelectorAll('[data-doc-target]')];
  const panels = [...document.querySelectorAll('.hld-example-panel')];
  const activate = tab => {
    tabs.forEach(t => {
      const active = t === tab;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', String(active));
    });
    panels.forEach(p => {
      const active = p.id === tab.dataset.docTarget;
      p.classList.toggle('is-active', active);
      p.hidden = !active;
    });
  };
  tabs.forEach(tab => tab.addEventListener('click', () => activate(tab)));

  const protectedArea = event => event.target.closest?.('.protected-doc-viewer,.hld-copy-protected');
  ['contextmenu','dragstart','selectstart','copy'].forEach(type => {
    document.addEventListener(type, event => {
      if (protectedArea(event)) event.preventDefault();
    });
  });
  document.addEventListener('keydown', event => {
    const active = document.querySelector('.protected-doc-viewer:hover');
    if (!active) return;
    const key = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && ['c','s','p','u'].includes(key)) {
      event.preventDefault();
      event.stopPropagation();
    }
  });
});
