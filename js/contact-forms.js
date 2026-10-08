
(() => {
  'use strict';

  const CONFIG_URL = '/api/form-config';
  const CONTACT_URL = '/api/contact';
  const SECURITY_URL = '/api/security-report';
  const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

  let configPromise = null;
  let turnstilePromise = null;
  let widgetId = null;
  let dialog = null;

  const TOPICS = [
    ['architecture','Arquitectura e infraestructura'],
    ['cybersecurity','Ciberseguridad'],
    ['grc','GRC, cumplimiento y regulación'],
    ['resilience','Resiliencia y continuidad'],
    ['ai','Inteligencia Artificial'],
    ['applications','Aplicaciones OpenTrust'],
    ['collaboration','Colaboración profesional'],
    ['legal_privacy','Legal, privacidad o ejercicio de derechos'],
    ['other','Otra consulta']
  ];

  const SECURITY_TYPES = [
    ['vulnerability','Posible vulnerabilidad'],
    ['exposure','Exposición de información'],
    ['configuration','Configuración de seguridad'],
    ['suspicious','Comportamiento sospechoso'],
    ['other','Otro asunto de seguridad']
  ];

  function el(tag, attrs = {}, text = '') {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'class') node.className = value;
      else if (key.startsWith('data-')) node.setAttribute(key, value);
      else if (key in node) node[key] = value;
      else node.setAttribute(key, value);
    });
    if (text) node.textContent = text;
    return node;
  }

  function ensureDialog() {
    if (dialog) return dialog;
    dialog = el('dialog', { class: 'ot-contact-dialog', 'aria-labelledby': 'ot-form-title' });
    document.body.appendChild(dialog);

    dialog.addEventListener('close', () => {
      document.body.classList.remove('ot-modal-open');
      if (widgetId !== null && window.turnstile) {
        try { window.turnstile.remove(widgetId); } catch (_) {}
      }
      widgetId = null;
      dialog.replaceChildren();
    });

    // El formulario solo se cierra mediante el botón explícito de cierre.
    // Evita perder datos al hacer clic fuera del diálogo.
    dialog.addEventListener('click', event => {
      if (event.target === dialog) {
        event.preventDefault();
      }
    });

    // Evita cierre accidental con Escape y pérdida de datos introducidos.
    dialog.addEventListener('cancel', event => {
      event.preventDefault();
    });

    return dialog;
  }

  async function getConfig() {
    if (!configPromise) {
      configPromise = fetch(CONFIG_URL, {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      }).then(async response => {
        if (!response.ok) throw new Error('config_unavailable');
        return response.json();
      });
    }
    return configPromise;
  }

  function loadTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstilePromise) return turnstilePromise;

    turnstilePromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-opentrust-turnstile]');
      if (existing) {
        existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
        existing.addEventListener('error', reject, { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = TURNSTILE_SRC;
      script.async = true;
      script.defer = true;
      script.dataset.opentrustTurnstile = 'true';
      script.onload = () => resolve(window.turnstile);
      script.onerror = () => reject(new Error('turnstile_load_failed'));
      document.head.appendChild(script);
    });
    return turnstilePromise;
  }

  function addField(grid, { name, label, type='text', required=false, minlength, maxlength, placeholder='', span=false, options=null, help='' }) {
    const wrap = el('div', { class: `ot-field${span ? ' ot-span-2' : ''}` });
    const lbl = el('label', { htmlFor: `ot-${name}` });
    lbl.append(document.createTextNode(label));
    if (!required) lbl.append(el('small', {}, ' · opcional'));

    let input;
    if (options) {
      input = el('select', { id:`ot-${name}`, name, required });
      input.append(el('option', { value:'' }, 'Selecciona una opción'));
      options.forEach(([value, text]) => input.append(el('option', { value }, text)));
    } else if (type === 'textarea') {
      input = el('textarea', { id:`ot-${name}`, name, required, minlength, maxlength, placeholder });
    } else {
      input = el('input', { id:`ot-${name}`, name, type, required, minlength, maxlength, placeholder });
    }

    wrap.append(lbl, input);
    if (help) {
      const helpNode = el('small', { class:'ot-field-help', id:`ot-${name}-help` }, help);
      input.setAttribute('aria-describedby', helpNode.id);
      wrap.append(helpNode);
    }
    grid.append(wrap);
    return input;
  }

  function buildPrivacyLayer() {
    const box = el('div', { class:'ot-privacy-layer' });
    const strong = el('strong', {}, 'Información básica de protección de datos. ');
    const text = document.createTextNode(
      'Los datos facilitados se tratarán únicamente para gestionar y responder esta comunicación, ' +
      'aplicando minimización y medidas de seguridad. No se utilizarán para publicidad ni elaboración de perfiles. '
    );
    const link = el('a', { href:'/legal/#privacidad' }, 'Política de privacidad');
    box.append(strong, text, link, document.createTextNode('.'));
    return box;
  }

  function buildShell(kind) {
    const isSecurity = kind === 'security';
    const shell = el('div', { class:'ot-form-shell' });
    const head = el('div', { class:'ot-form-head' });
    const copy = el('div');
    copy.append(
      el('p', { class:'ot-form-kicker' }, isSecurity ? 'SECURITY · RESPONSIBLE DISCLOSURE' : 'CONTACTO · OPENTRUST GROUP'),
      el('h2', { id:'ot-form-title' }, isSecurity ? 'Reportar un asunto de seguridad' : '¿En qué puedo ayudarte?'),
      el('p', {}, isSecurity
        ? 'Canal estructurado para comunicar vulnerabilidades o comportamientos de seguridad.'
        : 'Cuéntame brevemente qué necesitas y el contexto necesario para poder responderte.')
    );
    const close = el('button', { type:'button', class:'ot-form-close', ariaLabel:'Cerrar formulario' }, '×');
    close.addEventListener('click', () => dialog.close());
    head.append(copy, close);

    const scroll = el('div', { class:'ot-form-scroll' });
    const form = el('form', { class:'ot-form-grid', noValidate:true });
    form.dataset.formKind = kind;

    const hp = el('div', { class:'ot-honeypot', ariaHidden:'true' });
    hp.append(el('label', { htmlFor:'ot-website' }, 'No rellenar este campo'));
    hp.append(el('input', { id:'ot-website', name:'website', type:'text', tabIndex:-1, autoComplete:'off' }));
    form.append(hp);

    const started = el('input', { type:'hidden', name:'_startedAt', value:String(Date.now()) });
    const token = el('input', { type:'hidden', name:'turnstileToken', value:'' });
    form.append(started, token);

    if (isSecurity) {
      addField(form, { name:'name', label:'Nombre o alias', maxlength:80, placeholder:'Cómo quieres que me dirija a ti', help:'Opcional · máximo 80 caracteres.' });
      addField(form, { name:'email', label:'Email de contacto', type:'email', required:true, maxlength:254, placeholder:'tu@email.com', help:'Obligatorio · introduce una dirección de email válida.' });
      addField(form, { name:'type', label:'Tipo de comunicación', required:true, options:SECURITY_TYPES, help:'Obligatorio · selecciona el tipo que mejor describa el reporte.' });
      addField(form, { name:'asset', label:'Activo o URL afectada', maxlength:500, placeholder:'https://…', help:'Opcional · si lo indicas, debe ser una URL http:// o https:// · máximo 500 caracteres.' });
      addField(form, { name:'message', label:'Descripción y reproducción mínima', type:'textarea', required:true, minlength:20, maxlength:6000, span:true, placeholder:'Describe el comportamiento, impacto y pasos mínimos para reproducirlo…', help:'Obligatorio · mínimo 20 y máximo 6.000 caracteres.' });

      const warning = el('div', { class:'ot-form-warning' });
      warning.textContent = 'No envíes contraseñas, tokens, claves privadas, datos personales de terceros, datos extraídos ni adjuntos. Facilita únicamente la evidencia mínima necesaria para comprender el problema.';
      form.append(warning);
    } else {
      addField(form, { name:'name', label:'Nombre', required:true, minlength:2, maxlength:80, placeholder:'Tu nombre', help:'Obligatorio · mínimo 2 y máximo 80 caracteres.' });
      addField(form, { name:'email', label:'Email', type:'email', required:true, maxlength:254, placeholder:'tu@email.com', help:'Obligatorio · introduce una dirección de email válida.' });
      addField(form, { name:'organization', label:'Organización', maxlength:120, placeholder:'Empresa u organización', help:'Opcional · máximo 120 caracteres.' });
      const topic = addField(form, { name:'topic', label:'¿En qué puedo ayudarte?', required:true, options:TOPICS, help:'Obligatorio · selecciona una categoría.' });
      if (dialog.dataset.preselectTopic) topic.value = dialog.dataset.preselectTopic;
      addField(form, { name:'subject', label:'Asunto', required:true, minlength:4, maxlength:140, span:true, placeholder:'Resume brevemente el motivo del contacto', help:'Obligatorio · mínimo 4 y máximo 140 caracteres.' });
      addField(form, { name:'message', label:'Mensaje', type:'textarea', required:true, minlength:20, maxlength:4000, span:true, placeholder:'Incluye únicamente la información necesaria para poder valorar y responder tu consulta…', help:'Obligatorio · mínimo 20 y máximo 4.000 caracteres. No incluyas contraseñas, tokens, claves privadas ni información sensible innecesaria.' });
    }

    form.append(buildPrivacyLayer());

    const turnstileWrap = el('div', { class:'ot-turnstile-wrap' });
    const tsStatus = el('p', { class:'ot-turnstile-status' }, 'Preparando verificación antiabuso…');
    const tsTarget = el('div', { class:'ot-turnstile-target' });
    turnstileWrap.append(tsStatus, tsTarget);
    form.append(turnstileWrap);

    const footer = el('div', { class:'ot-form-footer' });
    const result = el('p', { class:'ot-form-result', role:'status', ariaLive:'polite' });
    const submit = el('button', { type:'submit', class:'ot-form-submit', disabled:true }, isSecurity ? 'Enviar reporte' : 'Enviar consulta');
    footer.append(result, submit);
    form.append(footer);

    form.addEventListener('submit', event => submitForm(event, { kind, result, submit, token, tsStatus }));

    scroll.append(form);
    shell.append(head, scroll);
    return { shell, form, token, tsStatus, tsTarget, submit };
  }

  async function renderTurnstile(kind, target, tokenInput, status, submit) {
    try {
      const config = await getConfig();
      if (!config.turnstileEnabled || !config.turnstileSiteKey) {
        status.textContent = 'Verificación Turnstile pendiente de configurar en Cloudflare.';
        status.dataset.state = 'error';
        submit.disabled = true;
        return;
      }

      const turnstile = await loadTurnstile();
      status.textContent = '';
      widgetId = turnstile.render(target, {
        sitekey: config.turnstileSiteKey,
        theme: 'light',
        size: 'flexible',
        appearance: 'always',
        action: kind === 'security' ? 'security_report' : 'contact',
        'feedback-enabled': false,
        callback: value => {
          tokenInput.value = value;
          submit.disabled = false;
        },
        'expired-callback': () => {
          tokenInput.value = '';
          submit.disabled = true;
          status.textContent = 'La verificación ha caducado. Completa de nuevo el control antiabuso.';
        },
        'error-callback': () => {
          tokenInput.value = '';
          submit.disabled = true;
          status.textContent = 'No ha sido posible completar la verificación antiabuso.';
        }
      });
    } catch (_) {
      status.textContent = 'No ha sido posible cargar la verificación antiabuso.';
      submit.disabled = true;
    }
  }

  async function submitForm(event, ctx) {
    event.preventDefault();
    const form = event.currentTarget;
    ctx.result.textContent = '';
    ctx.result.dataset.state = '';

    if (!form.reportValidity()) return;
    if (!ctx.token.value) {
      ctx.result.textContent = 'Completa la verificación antiabuso antes de enviar.';
      ctx.result.dataset.state = 'error';
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    ctx.submit.disabled = true;
    ctx.submit.textContent = 'Enviando…';

    try {
      const response = await fetch(ctx.kind === 'security' ? SECURITY_URL : CONTACT_URL, {
        method:'POST',
        credentials:'same-origin',
        cache:'no-store',
        headers:{
          'Content-Type':'application/json',
          'Accept':'application/json'
        },
        body:JSON.stringify(data)
      });

      const contentType = response.headers.get('content-type') || '';
      const payload = contentType.includes('application/json')
        ? await response.json().catch(() => ({}))
        : {};
      if (!response.ok || !payload.ok) {
        const code = String(payload.code || '').trim();

        if (code === 'delivery_unconfigured') {
          throw new Error('El canal de envío no está disponible en este momento. Inténtalo de nuevo más tarde.');
        }
        if (code === 'delivery_failed') {
          throw new Error('El servicio de correo no ha podido completar el envío. Inténtalo de nuevo más tarde.');
        }
        if (code === 'turnstile_failed' || code === 'turnstile_unconfigured') {
          throw new Error('La verificación antiabuso no ha sido válida. Recarga la página e inténtalo de nuevo.');
        }
        if (code === 'rate_limited' || response.status === 429) {
          throw new Error('Se han realizado demasiados intentos. Espera unos minutos antes de volver a intentarlo.');
        }
        if (response.status === 403) {
          throw new Error('La solicitud ha sido rechazada por el control de seguridad. Recarga la página e inténtalo de nuevo.');
        }
        if (response.status >= 500) {
          throw new Error('El servicio de envío no está disponible temporalmente. Inténtalo de nuevo más tarde.');
        }
        throw new Error(payload.message || `No se ha podido enviar la comunicación (HTTP ${response.status}).`);
      }

      ctx.result.textContent = ctx.kind === 'security'
        ? 'Reporte enviado correctamente.'
        : 'Consulta enviada correctamente.';
      ctx.result.dataset.state = 'success';
      form.reset();
      ctx.token.value = '';
      if (widgetId !== null && window.turnstile) window.turnstile.reset(widgetId);
    } catch (error) {
      ctx.result.textContent = error.message || 'No se ha podido enviar la comunicación.';
      ctx.result.dataset.state = 'error';
      if (widgetId !== null && window.turnstile) {
        try { window.turnstile.reset(widgetId); } catch (_) {}
      }
      ctx.token.value = '';
    } finally {
      ctx.submit.textContent = ctx.kind === 'security' ? 'Enviar reporte' : 'Enviar consulta';
      if (!ctx.token.value) ctx.submit.disabled = true;
    }
  }

  async function openForm(kind, preselectTopic='') {
    const dlg = ensureDialog();
    dlg.dataset.preselectTopic = preselectTopic || '';
    const built = buildShell(kind);
    dlg.replaceChildren(built.shell);
    document.body.classList.add('ot-modal-open');
    dlg.showModal();
    await renderTurnstile(kind, built.tsTarget, built.token, built.tsStatus, built.submit);
  }

  function inferContactType(anchor) {
    if (anchor.dataset.openSecurityReport !== undefined) return { kind:'security', topic:'' };
    const href = anchor.getAttribute('href') || '';
    const decoded = (() => { try { return decodeURIComponent(href); } catch (_) { return href; } })().toLowerCase();
    if (location.pathname.startsWith('/security/') || decoded.includes('security report')) {
      return { kind:'security', topic:'' };
    }
    if (anchor.dataset.contactTopic) return { kind:'contact', topic:anchor.dataset.contactTopic };
    if (location.pathname.startsWith('/legal/')) return { kind:'contact', topic:'legal_privacy' };
    return { kind:'contact', topic:'' };
  }

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href^="mailto:"], [data-open-contact], [data-open-security-report]');
    if (!anchor) return;
    event.preventDefault();
    const inferred = inferContactType(anchor);
    openForm(inferred.kind, inferred.topic);
  }, true);

  window.OpenTrustForms = Object.freeze({
    openContact: topic => openForm('contact', topic || ''),
    openSecurityReport: () => openForm('security')
  });
})();
