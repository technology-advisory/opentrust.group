document.addEventListener('DOMContentLoaded', () => {
  const ecosystem = document.getElementById('ecosystem-grid');
  if (!ecosystem) return;

  const forceSameTabForApps = () => {
    ecosystem.querySelectorAll('a.ecosystem-card-link').forEach(link => {
      const href = link.getAttribute('href') || '';
      if (
        href.includes('/apps/arq-studio.html') ||
        href.includes('/apps/audithub.html') ||
        href.includes('apps/arq-studio.html') ||
        href.includes('apps/audithub.html')
      ) {
        link.removeAttribute('target');
        link.removeAttribute('rel');
      }
    });
  };

  forceSameTabForApps();

  const observer = new MutationObserver(forceSameTabForApps);
  observer.observe(ecosystem, { childList: true, subtree: true });
});
