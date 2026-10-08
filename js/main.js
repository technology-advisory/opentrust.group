
// =========================================================
// OpenTrust · navegación global canónica
// Una única definición de menú para todas las páginas que cargan /js/main.js.
// Para volver a PRO, cambiar SOLO OPEN_TRUST_STATUS_URL.
// =========================================================
const OPEN_TRUST_STATUS_URL = 'https://status.opentrust.group/';

(() => {
  const items = [
    { label: 'Inicio', href: '/' },
    { label: 'Ecosistema', href: '/ecosistema/' },
    { label: 'Trayectoria', href: '/sobre-mi/' },
    { label: 'Sobre OpenTrust', href: '/sobre-opentrust/' },
    { label: 'Legal', href: '/legal/', className: 'nav-legal-solid' },
    {
      label: 'Estado Webs/Apps',
      href: OPEN_TRUST_STATUS_URL,
      className: 'nav-status-solid',
      external: true
    }
  ];

  const normalize = pathname => {
    if (!pathname) return '/';
    const clean = pathname.replace(/index\.html$/i, '').replace(/\/+$/, '');
    return clean || '/';
  };

  const current = normalize(location.pathname);

  document.querySelectorAll('[data-main-nav]').forEach(nav => {
    nav.innerHTML = '';

    items.forEach(item => {
      const link = document.createElement('a');
      link.textContent = item.label;
      link.href = item.href;

      if (item.className) link.classList.add(item.className);

      if (item.external) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      } else {
        const itemPath = normalize(new URL(item.href, location.origin).pathname);
        const active =
          itemPath === '/'
            ? current === '/'
            : current === itemPath || current.startsWith(itemPath + '/');

        if (active) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      }

      nav.appendChild(link);
    });
  });
})();


(() => {
  "use strict";

  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-main-nav]");

  if (toggle && nav) {
    const setMenuState = open => {
      nav.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    };

    toggle.addEventListener("click", () => {
      setMenuState(!nav.classList.contains("open"));
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && nav.classList.contains("open")) {
        setMenuState(false);
        toggle.focus();
      }
    });

    document.addEventListener("pointerdown", event => {
      if (!nav.classList.contains("open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      setMenuState(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && nav.classList.contains("open")) setMenuState(false);
    });
  }

  const search = document.querySelector("[data-search]");
  if (search) {
    search.addEventListener("keydown", event => {
      if (event.key !== "Enter") return;
      const value = search.value.trim().toLowerCase();
      if (!value) return;

      const cards = Array.from(document.querySelectorAll("[data-search-target]"));
      const match = cards.find(card => (card.dataset.searchTarget || "").toLowerCase().includes(value));
      if (match) {
        match.scrollIntoView({ behavior: "smooth", block: "center" });
        match.classList.add("is-found");
        setTimeout(() => match.classList.remove("is-found"), 1200);
      }
    });
  }

  document.querySelectorAll("a[href]").forEach(link => {
    const raw = link.getAttribute("href");
    if (!raw || raw.startsWith("#") || raw.startsWith("mailto:") || raw.startsWith("tel:")) return;

    try {
      const url = new URL(raw, location.href);
      if (/^https?:$/.test(url.protocol) && url.origin !== location.origin) {
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      }
    } catch (_) {}
  });
})();


// Ecosystem counters from the canonical inventory.
fetch('/data/ecosistema.json', {credentials:'same-origin'})
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(items => {
    if (!Array.isArray(items)) return;
    const knowledge = items.filter(i => i.category === 'docs').length;
    const apps = items.filter(i => i.category === 'apps').length;
    document.querySelectorAll('[data-count-knowledge]').forEach(el => el.textContent = knowledge);
    document.querySelectorAll('[data-count-apps]').forEach(el => el.textContent = apps);
  })
  .catch(() => {});

// Keyboard shortcut for the global search.
document.addEventListener('keydown', event => {
  if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return;
  const tag = document.activeElement && document.activeElement.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  const input = document.querySelector('[data-search]');
  if (input) { event.preventDefault(); input.focus(); }
});


// Screenshot lightbox for application pages.
(() => {
  const modal = document.querySelector('[data-lightbox]');
  if (!modal) return;

  const image = modal.querySelector('[data-lightbox-image]');
  const caption = modal.querySelector('[data-lightbox-caption]');
  const close = modal.querySelector('[data-lightbox-close]');
  const prev = modal.querySelector('[data-lightbox-prev]');
  const next = modal.querySelector('[data-lightbox-next]');

  let items = [];
  let index = 0;

  const refresh = () => {
    items = Array.from(document.querySelectorAll('[data-lightbox-item]'))
      .filter(item => {
        const details = item.closest('details');
        return !details || details.open;
      });
  };

  const show = (item) => {
    refresh();
    const found = items.indexOf(item);
    index = found >= 0 ? found : 0;
    const current = items[index];
    if (!current) return;
    image.src = current.dataset.lightboxSrc || current.querySelector('img')?.src || '';
    image.alt = current.dataset.lightboxCaption || current.querySelector('img')?.alt || '';
    caption.textContent = current.dataset.lightboxCaption || '';
    modal.hidden = false;
    document.body.classList.add('lightbox-open');
    close.focus();
  };

  const hide = () => {
    modal.hidden = true;
    image.removeAttribute('src');
    document.body.classList.remove('lightbox-open');
  };

  const step = (delta) => {
    refresh();
    if (!items.length) return;
    index = (index + delta + items.length) % items.length;
    const current = items[index];
    image.src = current.dataset.lightboxSrc || current.querySelector('img')?.src || '';
    image.alt = current.dataset.lightboxCaption || current.querySelector('img')?.alt || '';
    caption.textContent = current.dataset.lightboxCaption || '';
  };

  document.addEventListener('click', event => {
    const button = event.target.closest('[data-lightbox-item] .app-shot-open');
    if (!button) return;
    event.preventDefault();
    show(button.closest('[data-lightbox-item]'));
  });

  close?.addEventListener('click', hide);
  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));

  modal.addEventListener('click', event => {
    if (event.target === modal) hide();
  });

  document.addEventListener('keydown', event => {
    if (modal.hidden) return;
    if (event.key === 'Escape') hide();
    if (event.key === 'ArrowLeft') step(-1);
    if (event.key === 'ArrowRight') step(1);
  });
})();




// Arq Studio horizontal corporate document viewer.
(() => {
  const shell = document.querySelector('.arq-document-shell-corporate');
  if (!shell) return;

  const viewport = shell.querySelector('.arq-document-viewport-horizontal');
  const pagesWrap = shell.querySelector('[data-doc-pages]');
  const pages = Array.from(shell.querySelectorAll('[data-doc-page]'));
  const currentEl = shell.querySelector('[data-doc-current]');
  const totalEl = shell.querySelector('[data-doc-total]');
  const zoomLabel = shell.querySelector('[data-doc-zoom-label]');
  const prevBtn = shell.querySelector('[data-doc-prev]');
  const nextBtn = shell.querySelector('[data-doc-next]');
  const prevSide = shell.querySelector('[data-doc-prev-side]');
  const nextSide = shell.querySelector('[data-doc-next-side]');
  const zoomOut = shell.querySelector('[data-doc-zoom-out]');
  const zoomIn = shell.querySelector('[data-doc-zoom-in]');
  const fitBtn = shell.querySelector('[data-doc-fit]');
  const fullBtn = shell.querySelector('[data-doc-fullscreen]');

  let index = 0;
  let zoom = 100;
  let touchStartX = null;

  if (totalEl) totalEl.textContent = String(pages.length);

  const render = (direction = 'next') => {
    pagesWrap?.classList.toggle('is-prev', direction === 'prev');

    pages.forEach((page, i) => {
      page.classList.toggle('is-active', i === index);
      page.classList.remove('zoom-70','zoom-80','zoom-90','zoom-100','zoom-110','zoom-120','zoom-130','zoom-140','zoom-150');
      if (i === index) {
        page.classList.add(`zoom-${zoom}`);
      }
    });

    if (currentEl) currentEl.textContent = String(index + 1);
    if (zoomLabel) zoomLabel.textContent = `${zoom}%`;

    const atStart = index === 0;
    const atEnd = index === pages.length - 1;
    [prevBtn, prevSide].forEach(btn => { if (btn) btn.disabled = atStart; });
    [nextBtn, nextSide].forEach(btn => { if (btn) btn.disabled = atEnd; });
  };

  const go = (nextIndex) => {
    const clamped = Math.max(0, Math.min(nextIndex, pages.length - 1));
    if (clamped === index) return;
    const direction = clamped < index ? 'prev' : 'next';
    index = clamped;
    render(direction);
  };

  const setZoom = (value) => {
    zoom = Math.max(70, Math.min(150, value));
    render();
  };

  const fit = () => {
    zoom = 100;
    render();
  };

  [prevBtn, prevSide].forEach(btn => btn?.addEventListener('click', () => go(index - 1)));
  [nextBtn, nextSide].forEach(btn => btn?.addEventListener('click', () => go(index + 1)));
  zoomOut?.addEventListener('click', () => setZoom(zoom - 10));
  zoomIn?.addEventListener('click', () => setZoom(zoom + 10));
  fitBtn?.addEventListener('click', fit);

  fullBtn?.addEventListener('click', async () => {
    try {
      if (!document.fullscreenElement) await shell.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  });

  viewport?.addEventListener('keydown', event => {
    if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
      event.preventDefault();
      go(index + 1);
    }
    if (['ArrowLeft', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      go(index - 1);
    }
    if (event.key === 'Home') {
      event.preventDefault();
      go(0);
    }
    if (event.key === 'End') {
      event.preventDefault();
      go(pages.length - 1);
    }
  });

  viewport?.addEventListener('touchstart', event => {
    touchStartX = event.changedTouches?.[0]?.clientX ?? null;
  }, { passive: true });

  viewport?.addEventListener('touchend', event => {
    if (touchStartX === null) return;
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX;
    const delta = endX - touchStartX;
    if (Math.abs(delta) > 45) {
      if (delta < 0) go(index + 1);
      else go(index - 1);
    }
    touchStartX = null;
  }, { passive: true });

  render();
})();


// Trayectoria · certificaciones desde /data/certificaciones.json
(() => {
  const modal = document.querySelector('[data-cert-modal]');
  const openBtns = [...document.querySelectorAll('[data-cert-open]')];
  if (!modal || !openBtns.length) return;

  const groupsEl = modal.querySelector('[data-cert-groups]');
  const modalMeta = modal.querySelector('[data-cert-modal-meta]');
  const countEl = document.querySelector('[data-cert-count]');
  const updatedEl = document.querySelector('[data-cert-updated]');
  let loaded = false;
  let lastFocused = null;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const safeCredentialUrl = value => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    try {
      const url = raw.startsWith('/') ? new URL(raw, location.origin) : new URL(raw);
      if (!/^https?:$/.test(url.protocol)) return '';
      if (raw.startsWith('/') && url.origin !== location.origin) return '';
      return url.href;
    } catch (_) {
      return '';
    }
  };

  async function loadCerts() {
    if (loaded) return;
    try {
      const response = await fetch('/data/certificaciones.json', {cache:'no-store'});
      if (!response.ok) throw new Error('HTTP ' + response.status);
      const data = await response.json();
      const hiddenCerts = new Set([
        'Google Cloud Skill Badges (Networking, Security, Terraform, Load Balancing, App Dev)'
      ]);
      const groups = Array.isArray(data.grupos)
        ? [...data.grupos].sort((a,b)=>(a.orden||0)-(b.orden||0)).map(group => ({
            ...group,
            certificaciones: (group.certificaciones || []).filter(cert => !hiddenCerts.has(String(cert.nombre || '').trim()))
          }))
        : [];
      const total = groups.reduce((n,g)=>n + (Array.isArray(g.certificaciones) ? g.certificaciones.length : 0), 0);

      if (countEl) countEl.textContent = `${total} certificaciones y acreditaciones profesionales`;
      const updated = data.updated_at || data.version || '';
      if (updatedEl) updatedEl.textContent = updated ? `Fuente centralizada · actualización ${updated}` : 'Fuente centralizada en OpenTrust.';
      if (modalMeta) modalMeta.textContent = `${total} credenciales${updated ? ` · actualización ${updated}` : ''}`;

      groupsEl.innerHTML = groups.map(group => {
        const items = (group.certificaciones || []).map(cert => {
          const name = esc(cert.nombre);
          const credentialUrl = safeCredentialUrl(cert.url);
          const link = credentialUrl ? `<a href="${esc(credentialUrl)}" target="_blank" rel="noopener noreferrer">Ver credencial ↗</a>` : '';
          return `<div class="trajectory-cert-item"><span>${name}</span>${link}</div>`;
        }).join('');
        return `<section class="trajectory-cert-group"><h3>${esc(group.titulo)}</h3><div class="trajectory-cert-list">${items}</div></section>`;
      }).join('') || '<p>No hay certificaciones disponibles.</p>';
      loaded = true;
    } catch (error) {
      groupsEl.innerHTML = '<p>No ha sido posible cargar en este momento la fuente central de certificaciones.</p>';
      if (modalMeta) modalMeta.textContent = 'Fuente central no disponible';
    }
  }

  async function openModal() {
    lastFocused = document.activeElement;
    modal.hidden = false;
    modal.setAttribute('aria-hidden','false');
    document.body.classList.add('cert-modal-open');
    await loadCerts();
    modal.querySelector('[data-cert-close]')?.focus();
  }
  function closeModal() {
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('cert-modal-open');
    lastFocused?.focus?.();
  }

  openBtns.forEach(el => el.addEventListener('click', openModal));
  modal.querySelectorAll('[data-cert-close]').forEach(el => el.addEventListener('click', closeModal));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) closeModal();
  });

  // Carga discreta al entrar en viewport para que el contador esté actualizado sin interacción.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { loadCerts(); io.disconnect(); }
    }, {rootMargin:'250px'});
    io.observe(openBtn);
  }
})();


// OpenTrust · canonical About page route for pages still carrying the legacy anchor.
document.querySelectorAll('a[href="/sobre-mi/#opentrust"]').forEach(link => {
  link.setAttribute('href', '/sobre-opentrust/');
});


// Global navigation: ensure Legal is present as the solid trust/legal action.
document.querySelectorAll('[data-main-nav]').forEach(nav => {
  let legal = nav.querySelector('a[href="/legal/"]');
  if (!legal) {
    legal = document.createElement('a');
    legal.href = '/legal/';
    legal.textContent = 'Legal';
    const about = nav.querySelector('a[href="/sobre-opentrust/"], a[href="/sobre-mi/#opentrust"]');
    if (about) about.insertAdjacentElement('afterend', legal);
    else nav.appendChild(legal);
  }
  legal.classList.add('nav-legal-solid');
  if (location.pathname === '/legal/' || location.pathname === '/legal/index.html') {
    legal.classList.add('active');
  }
});


// Security evidence modal.
(() => {
  const modal = document.querySelector('[data-security-evidence-modal]');
  if (!modal) return;

  const title = modal.querySelector('[data-security-evidence-title]');
  const panels = Array.from(modal.querySelectorAll('[data-security-evidence-panel]'));
  const labels = {
    headers: 'Cabeceras de seguridad',
    tls: 'Configuración SSL/TLS',
    events: 'Eventos de seguridad',
    activity: 'Tráfico y mitigación'
  };

  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden','true');
    document.body.classList.remove('trust-evidence-open');
    panels.forEach(p => p.hidden = true);
  };

  document.querySelectorAll('[data-security-evidence-open]').forEach(button => {
    button.addEventListener('click', () => {
      const key = button.dataset.securityEvidenceOpen;
      panels.forEach(p => p.hidden = p.dataset.securityEvidencePanel !== key);
      if (title) title.textContent = labels[key] || 'Evidencia de seguridad';
      modal.hidden = false;
      modal.setAttribute('aria-hidden','false');
      document.body.classList.add('trust-evidence-open');
    });
  });

  modal.querySelectorAll('[data-security-evidence-close]').forEach(el => el.addEventListener('click', close));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.hidden) close();
  });
})();


// OpenTrust · canonical corporate footer shared by every page.
(() => {
  const footer = document.querySelector('body > footer.target-footer, body > footer.ot-global-footer') || Array.from(document.querySelectorAll('body > footer')).at(-1);
  if (!footer) return;

  footer.className = 'ot-global-footer';
  footer.setAttribute('aria-label', 'Pie de página OpenTrust Group');
  footer.innerHTML = `
    <div class="container ot-global-footer-main">
      <div class="ot-global-footer-copy">
        <a class="ot-global-footer-brand" href="/" aria-label="OpenTrust Group, inicio">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 3 19 6v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6l7-3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
            <path d="m9 12 2 2 4-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
          </svg>
          <span>OpenTrust Group</span>
        </a>
        <strong>Experiencia técnica convertida en arquitectura, seguridad y confianza.</strong>
        <p>Un ecosistema independiente para conectar conocimiento, tecnología, regulación, resiliencia e inteligencia artificial con decisiones y soluciones aplicables.</p>
      </div>
      <div class="ot-global-footer-visual" aria-hidden="true">
        <svg viewBox="0 0 360 150" role="img">
          <defs>
            <linearGradient id="otFooterGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="currentColor" stop-opacity=".95"/>
              <stop offset="1" stop-color="#ffffff" stop-opacity=".25"/>
            </linearGradient>
          </defs>
          <path d="M24 107 88 67l58 29 68-58 118 74" fill="none" stroke="url(#otFooterGradient)" stroke-width="2"/>
          <path d="M24 124h308" stroke="currentColor" stroke-opacity=".2"/>
          <circle cx="24" cy="107" r="5" fill="currentColor"/>
          <circle cx="88" cy="67" r="5" fill="currentColor"/>
          <circle cx="146" cy="96" r="5" fill="currentColor"/>
          <circle cx="214" cy="38" r="5" fill="currentColor"/>
          <circle cx="332" cy="112" r="5" fill="currentColor"/>
          <path d="M67 119 118 83M170 116l44-78M259 77l73 35" stroke="currentColor" stroke-opacity=".28" stroke-dasharray="4 5"/>
          <rect x="61" y="113" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-opacity=".55"/>
          <rect x="164" y="110" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-opacity=".55"/>
          <rect x="253" y="71" width="12" height="12" rx="2" fill="none" stroke="currentColor" stroke-opacity=".55"/>
        </svg>
      </div>
    </div>
    <div class="ot-global-footer-bottom">
      <div class="container">
        <span>© 2026 OpenTrust Group</span>
        <span>Conocimiento · Tecnología · Confianza</span>
      </div>
    </div>`;
})();



// OpenTrust · Estado Webs/Apps
// La URL y posición se controlan exclusivamente desde la navegación canónica superior.
document.querySelectorAll('[data-main-nav] a.nav-status-solid').forEach(status => {
  status.href = OPEN_TRUST_STATUS_URL;
  status.textContent = 'Estado Webs/Apps';
  status.target = '_blank';
  status.rel = 'noopener noreferrer';
});



// Home · canonical Conocimiento route.
if (location.pathname === '/' || location.pathname === '/index.html') {
  document.querySelectorAll('[data-main-nav] a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === '#conocimiento' || href === '/#conocimiento') {
      link.setAttribute('href', '/conocimiento/');
    }
  });
}


// =========================================================
// OpenTrust · Header refinement
// - Remove the global header search.
// - Presentation rules live in /css/styles.css to remain compatible with CSP
//   style-src 'self' (no runtime <style> injection).
// =========================================================
(() => {
  const refineHeader = () => {
    document.querySelectorAll('.site-header .search').forEach(search => search.remove());
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refineHeader, { once:true });
  } else {
    refineHeader();
  }
})();


// =========================================================
// OpenTrust · Formularios seguros centralizados
// Carga una sola implementación global para contacto y security reporting.
// =========================================================
(() => {
  if (!document.querySelector('link[data-opentrust-forms]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/css/contact-forms.css';
    link.dataset.opentrustForms = 'styles';
    document.head.appendChild(link);
  }

  if (!document.querySelector('script[data-opentrust-forms]')) {
    const script = document.createElement('script');
    script.src = '/js/contact-forms.js';
    script.defer = true;
    script.dataset.opentrustForms = 'runtime';
    document.head.appendChild(script);
  }
})();

