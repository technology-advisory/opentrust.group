document.addEventListener('DOMContentLoaded', () => {
  const viewer = document.getElementById('viewer');
  const viewerImage = viewer?.querySelector('img');
  const closeButton = document.getElementById('closeViewer');
  const imageButtons = document.querySelectorAll('.shot-image[data-image]');

  if (!viewer || !viewerImage || !imageButtons.length) return;

  const openViewer = button => {
    const imageSource = button.dataset.image;
    if (!imageSource) return;

    viewerImage.src = imageSource;
    viewerImage.alt = button.querySelector('img')?.alt || 'Vista ampliada de Arq Studio';

    if (typeof viewer.showModal === 'function') {
      viewer.showModal();
    } else {
      viewer.setAttribute('open', '');
    }
  };

  const closeViewer = () => {
    if (typeof viewer.close === 'function' && viewer.open) {
      viewer.close();
    } else {
      viewer.removeAttribute('open');
    }
    viewerImage.removeAttribute('src');
  };

  imageButtons.forEach(button => {
    button.addEventListener('click', () => openViewer(button));
  });

  closeButton?.addEventListener('click', closeViewer);

  viewer.addEventListener('click', event => {
    const bounds = viewer.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (event.target === viewer && clickedOutside) closeViewer();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && viewer.open) closeViewer();
  });
});
