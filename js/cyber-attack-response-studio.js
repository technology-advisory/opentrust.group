document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const slides = [...slider.querySelectorAll('.cs-slide')];
    const prev = slider.querySelector('.cs-nav--prev');
    const next = slider.querySelector('.cs-nav--next');
    const dots = slider.querySelector('.cs-dots');
    let index = Math.max(0, slides.findIndex(s => s.classList.contains('is-active')));

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', `Mostrar pantalla ${i + 1}`);
      dot.addEventListener('click', () => show(i));
      dots.appendChild(dot);
    });
    const dotButtons = [...dots.querySelectorAll('button')];
    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === index));
      dotButtons.forEach((d, n) => d.classList.toggle('is-active', n === index));
    }
    prev?.addEventListener('click', () => show(index - 1));
    next?.addEventListener('click', () => show(index + 1));
    show(index);
  });

  const viewer = document.getElementById('cs-viewer');
  const viewerImg = viewer?.querySelector('img');
  const close = document.getElementById('cs-viewer-close');
  document.querySelectorAll('.cs-shot-button[data-image]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!viewer || !viewerImg) return;
      viewerImg.src = btn.dataset.image;
      viewerImg.alt = btn.querySelector('img')?.alt || 'Vista ampliada';
      viewer.showModal();
    });
  });
  close?.addEventListener('click', () => viewer.close());
  viewer?.addEventListener('click', e => {
    if (e.target === viewer) viewer.close();
  });
});
