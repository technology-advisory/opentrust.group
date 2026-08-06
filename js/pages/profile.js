(() => {
  "use strict";

  const container = document.querySelector("[data-certificaciones]");
  if (!container) return;

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);

  fetch("../data/certificaciones.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((data) => {
      const grupos = Array.isArray(data.grupos) ? data.grupos : [];
      container.innerHTML = grupos.map((grupo) => `
        <article class="cert-card">
          <h3>${escapeHtml(grupo.titulo)}</h3>
          <ul>
            ${(grupo.certificaciones || []).map((cert) => `
              <li>
                <span>${escapeHtml(cert.nombre)}</span>
                ${cert.url ? `<a href="${escapeHtml(cert.url)}" target="_blank" rel="noopener noreferrer">Verificar <span aria-hidden="true">↗</span></a>` : ""}
              </li>`).join("")}
          </ul>
        </article>`).join("");
    })
    .catch((error) => {
      console.error("No se pudieron cargar las certificaciones:", error);
      container.innerHTML = `<p class="load-error">No se pudieron cargar las certificaciones en este momento.</p>`;
    });
})();
(() => {
  "use strict";

  const iconos = {
    "shield-check": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 5.2 3.2 8.4 7 10 3.8-1.6 7-4.8 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-5"/></svg>',
    "building": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13"/><path d="M8 21v-6h8v6M8 10h2M14 10h2"/></svg>',
    "cloud": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6.3 8.8 4.5 4.5 0 0 0 7 18Z"/></svg>',
    "firewall": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v5H3zM3 14h18v5H3zM8 5v5M16 14v5"/></svg>',
    "network": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="5" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="m7 6 4 11M17 6l-4 11M7 5h10"/></svg>',
    "backup": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14v18H5zM8 3v6h8V3M8 17h8"/></svg>',
    "shield": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 5.2 3.2 8.4 7 10 3.8-1.6 7-4.8 7-10V6l-7-3Z"/></svg>',
    "continuity": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v6h-6"/></svg>',
    "ai": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4h6M9 20h6M4 9v6M20 9v6M7 7h10v10H7zM12 1v3M12 20v3M1 12h3M20 12h3"/></svg>'
  };

  async function cargarPerfil() {
    const areas = document.querySelector('[data-especializaciones]');
    const responsabilidades = document.querySelector('[data-responsabilidades]');
    if (!areas && !responsabilidades) return;

    try {
      const respuesta = await fetch('../data/perfil-profesional.json', { cache: 'no-store' });
      if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
      const datos = await respuesta.json();

      if (areas) {
        areas.innerHTML = datos.especializaciones.map(item => `
          <article class="specialization-card">
            <span class="specialization-icon">${iconos[item.icono] || iconos.shield}</span>
            <h3>${escapeHtml(item.titulo)}</h3>
            <p>${escapeHtml(item.descripcion)}</p>
          </article>`).join('');
      }

      if (responsabilidades) {
        responsabilidades.innerHTML = datos.responsabilidades.map(item => `
          <div class="responsibility-item">
            <span aria-hidden="true">✓</span>
            <p>${escapeHtml(item)}</p>
          </div>`).join('');
      }
    } catch (error) {
      console.error('No se pudo cargar el perfil profesional:', error);
      if (areas) areas.innerHTML = '<p class="load-error">No se pudieron cargar las áreas de especialización.</p>';
      if (responsabilidades) responsabilidades.innerHTML = '<p class="load-error">No se pudieron cargar las responsabilidades.</p>';
    }
  }

  function escapeHtml(valor) {
    return String(valor).replace(/[&<>"']/g, caracter => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    })[caracter]);
  }

  cargarPerfil();
})();
