document.addEventListener('DOMContentLoaded', () => {
  renderHeader();
  initYear();
  loadEcosystem();
  initMenuToggle();
  initMenuLinks();
});

function renderHeader() {
  const headerContainer = document.getElementById('site-header');

  if (!headerContainer) {
    console.warn('No se encontró el contenedor #site-header en el HTML.');
    return;
  }

  headerContainer.innerHTML = `
    <a href="/" class="brand" aria-label="OpenTrust Group inicio">
      <span class="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" role="img">
          <path d="M32 4 54 12v17c0 14.6-8.9 25.6-22 31C18.9 54.6 10 43.6 10 29V12L32 4Z"/>
          <path d="M23 33.5 29.2 40 43 24"/>
          <path d="M22 18h20M18 26h28"/>
        </svg>
      </span>
      <span class="brand-text">OpenTrust<br><strong>Group</strong></span>
    </a>
    <button class="menu-toggle" id="menu-toggle" aria-label="Alternar menú de navegación" aria-expanded="false" aria-controls="main-nav">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="6" x2="21" y2="6" class="hamburger-line"></line>
        <line x1="3" y1="12" x2="21" y2="12" class="hamburger-line"></line>
        <line x1="3" y1="18" x2="21" y2="18" class="hamburger-line"></line>
      </svg>
    </button>
  `;
}

function initMenuToggle() {
  const toggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('main-nav');

  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('active');
    toggle.setAttribute('aria-expanded', isOpen);
  });
}

function initYear() {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
}

function initMenuLinks() {
  const nav = document.getElementById('main-nav');
  const toggle = document.getElementById('menu-toggle');
  const links = nav ? nav.querySelectorAll('a') : [];

  links.forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function renderProjectCard(item, iconMap) {
  const svgContent = iconMap[item.icon] || '';
  const isComingSoon = item.status === 'coming-soon';

  const card = `
    <article class="project-card${isComingSoon ? ' project-card--coming-soon' : ''}">
      <div class="project-head">
        <div class="project-icon" aria-hidden="true">
          <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3">
            ${svgContent}
          </svg>
        </div>
        <h3>${item.name}</h3>
      </div>
      <p class="tagline"><strong>${item.tagline}</strong></p>
      <p>${item.description}</p>
      ${isComingSoon ? '<span class="project-status">Próximamente</span>' : '<span class="visit">Visitar →</span>'}
    </article>
  `;

  return isComingSoon
    ? `<div class="ecosystem-card-link ecosystem-card-link--disabled" aria-label="${item.name}, próximamente">${card}</div>`
    : `<a href="${item.url}" target="_blank" rel="noopener" class="ecosystem-card-link">${card}</a>`;
}

async function loadEcosystem() {
  const container = document.getElementById('ecosystem-grid');
  if (!container) return;

  const iconMap = {
    shield: `<path d="M32 8 52 16v15c0 13-8 22-20 27-12-5-20-14-20-27V16l20-8Z"/><path d="M24 33l6 6 12-15"/>`,
    alert: `<circle cx="32" cy="32" r="20"/><path d="M32 19v16"/><circle cx="32" cy="45" r="2"/>`,
    radar: `<circle cx="32" cy="32" r="20"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="5"/><path d="M32 12v20l14 7"/>`,
    network: `<circle cx="32" cy="32" r="20"/><path d="M12 32h40M32 12c7 7 10 14 10 20s-3 13-10 20M32 12c-7 7-10 14-10 20s3 13 10 20"/>`,
    ai: `<path d="M20 18h24a6 6 0 0 1 6 6v16a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6V24a6 6 0 0 1 6-6Z"/><path d="M25 38V27l7-4 7 4v11l-7 4-7-4Z"/><path d="M32 23v19M25 27l14 11M39 27 25 38"/><path d="M25 12v6M39 12v6M25 46v6M39 46v6M8 27h6M8 37h6M50 27h6M50 37h6"/>`,
    diagram: `<rect x="12" y="12" width="12" height="12" rx="2"/><rect x="40" y="12" width="12" height="12" rx="2"/><rect x="26" y="40" width="12" height="12" rx="2"/><path d="M24 18h16M46 24v8M32 24v16"/>`,
    clipboard: `<path d="M24 10h16v8H24z"/><path d="M20 14h24a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z"/><path d="M24 30h16M24 38h12"/>`
  };

  try {
    const response = await fetch('data/ecosistema.json');
    if (!response.ok) throw new Error('No se pudo recuperar el JSON del ecosistema');

    const data = await response.json();
    const docs = data.filter(item => item.category === 'docs');
    const apps = data.filter(item => item.category === 'apps');

    container.innerHTML = `
      <div class="ecosystem-group">
        <h3 class="ecosystem-group-title">Portales web de documentación</h3>
        <div class="ecosystem-grid-list ecosystem-grid-list--docs">
          ${docs.map(item => renderProjectCard(item, iconMap)).join('')}
        </div>
      </div>
      <div class="ecosystem-group">
        <h3 class="ecosystem-group-title">Aplicaciones</h3>
        <div class="ecosystem-grid-list ecosystem-grid-list--apps">
          ${apps.map(item => renderProjectCard(item, iconMap)).join('')}
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error al cargar el ecosistema dinámico:', error);
    container.innerHTML = '<p class="error-msg">Error al conectar con el ecosistema de conocimiento.</p>';
  }
}
