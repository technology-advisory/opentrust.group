const viewer = document.querySelector('#viewer');
const viewerImage = viewer ? viewer.querySelector('img') : null;

document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    if (!viewer || !viewerImage) return;
    viewerImage.src = button.dataset.image;
    viewer.showModal();
  });
});

const closeViewer = document.querySelector('#closeViewer');
if (closeViewer) closeViewer.addEventListener('click', () => viewer.close());

if (viewer) {
  viewer.addEventListener('click', event => {
    if (event.target === viewer) viewer.close();
  });
}

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && viewer?.open) viewer.close();
});
