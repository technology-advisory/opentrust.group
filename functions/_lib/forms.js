
const JSON_HEADERS = Object.freeze({
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'Pragma':'no-cache',
  'X-Content-Type-Options':'nosniff',
  'X-Frame-Options':'DENY',
  'Referrer-Policy':'no-referrer',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy':'same-origin',
  'Cross-Origin-Resource-Policy':'same-origin',
  'X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet',
  'Strict-Transport-Security':'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
});

export function jsonResponse(payload, status=200, extraHeaders={}) {
  return new Response(JSON.stringify(payload), {
    status,
    headers:{...JSON_HEADERS, ...extraHeaders}
  });
}

function csv(value='') {
  return String(value).split(',').map(item => item.trim()).filter(Boolean);
}

export function requestId() {
  return crypto.randomUUID();
}

export function enforceRequest(request, env, { method='POST' } = {}) {
  if (request.method !== method) {
    return jsonResponse({ok:false,code:'method_not_allowed',message:'Método no permitido.'},405,{
      'Allow':method
    });
  }

  const origin = request.headers.get('Origin');
  const allowed = csv(env.ALLOWED_FORM_ORIGINS || 'https://opentrust.group,https://www.opentrust.group');
  const environment = String(env.ENVIRONMENT || 'production').toLowerCase();

  const requireOrigin = method !== 'GET';

  if (environment === 'production' && requireOrigin) {
    if (!origin || !allowed.includes(origin)) {
      return jsonResponse({ok:false,code:'origin_rejected',message:'Solicitud no permitida.'},403);
    }
  } else if (origin && allowed.length && !allowed.includes(origin)) {
    return jsonResponse({ok:false,code:'origin_rejected',message:'Solicitud no permitida.'},403);
  }

  const secFetchSite = request.headers.get('Sec-Fetch-Site');
  if (secFetchSite && !['same-origin','same-site','none'].includes(secFetchSite)) {
    return jsonResponse({ok:false,code:'cross_site_rejected',message:'Solicitud no permitida.'},403);
  }

  if (method === 'POST') {
    const contentType = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
    if (contentType !== 'application/json') {
      return jsonResponse({ok:false,code:'unsupported_media_type',message:'Formato no admitido.'},415);
    }

    const declared = Number(request.headers.get('Content-Length') || '0');
    if (declared && declared > 16384) {
      return jsonResponse({ok:false,code:'payload_too_large',message:'Solicitud demasiado grande.'},413);
    }
  }

  return null;
}

async function readBodyLimited(request, maxBytes) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      try { await reader.cancel(); } catch (_) {}
      return null;
    }
    chunks.push(value);
  }
  const buffer = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { buffer.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder('utf-8', { fatal:true }).decode(buffer);
}

export async function readJsonStrict(request, maxBytes=16384) {
  let raw;
  try {
    raw = await readBodyLimited(request, maxBytes);
  } catch (_) {
    return { error:jsonResponse({ok:false,code:'invalid_json',message:'Solicitud no válida.'},400) };
  }
  if (raw === null) {
    return { error:jsonResponse({ok:false,code:'payload_too_large',message:'Solicitud demasiado grande.'},413) };
  }

  try {
    const value = JSON.parse(raw);
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error('bad_json');
    return { value };
  } catch (_) {
    return { error:jsonResponse({ok:false,code:'invalid_json',message:'Solicitud no válida.'},400) };
  }
}

export function normalizeText(value, maxLength, { multiline=false }={}) {
  let text = String(value ?? '').normalize('NFKC').replace(/\u0000/g,'');

  if (multiline) {
    text = text
      .replace(/\r\n?/g,'\n')
      .replace(/[\u0001-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'');
  } else {
    text = text
      .replace(/[\r\n\t]/g,' ')
      .replace(/[\u0001-\u001F\u007F]/g,'');
  }

  text = text.replace(/[ \t]+/g,' ').trim();

  if (multiline) {
    text = text.replace(/\n{4,}/g,'\n\n\n');
  }

  return text.slice(0,maxLength);
}

export function validEmail(value) {
  const email = String(value || '').trim();
  if (!email || email.length > 254) return false;
  if (/[\r\n]/.test(email)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
}

export function exactKeys(object, allowed) {
  return Object.keys(object).every(key => allowed.includes(key));
}

export function checkAutomationTraps(payload) {
  if (normalizeText(payload.website,200)) {
    return jsonResponse({ok:false,code:'invalid_submission',message:'Solicitud no válida.'},400);
  }

  const startedAt = Number(payload._startedAt);
  if (!Number.isFinite(startedAt)) {
    return jsonResponse({ok:false,code:'invalid_submission',message:'Solicitud no válida.'},400);
  }

  const elapsed = Date.now() - startedAt;
  if (elapsed < 1800 || elapsed > 60 * 60 * 1000) {
    return jsonResponse({ok:false,code:'invalid_submission',message:'Solicitud no válida.'},400);
  }

  return null;
}

export async function verifyTurnstile({ env, request, token, expectedAction }) {
  const secret = env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    return {ok:false,configurationError:true};
  }

  const cleanToken = String(token || '').trim();
  if (!cleanToken || cleanToken.length > 2048) return {ok:false};

  const remoteip = request.headers.get('CF-Connecting-IP') || undefined;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        secret,
        response:cleanToken,
        remoteip,
        idempotency_key:crypto.randomUUID()
      }),
      signal:controller.signal
    });

    if (!response.ok) return {ok:false};
    const result = await response.json();
    if (!result.success) return {ok:false};

    if (expectedAction && result.action !== expectedAction) return {ok:false};

    const allowedHostnames = csv(env.TURNSTILE_ALLOWED_HOSTNAMES || 'opentrust.group,www.opentrust.group');
    if (allowedHostnames.length && (!result.hostname || !allowedHostnames.includes(result.hostname))) {
      return {ok:false};
    }

    return {ok:true};
  } catch (_) {
    return {ok:false};
  } finally {
    clearTimeout(timeout);
  }
}

export function validateContact(payload) {
  const allowedKeys = [
    'name','email','organization','topic','subject','message',
    'website','_startedAt','turnstileToken','cf-turnstile-response'
  ];
  if (!exactKeys(payload,allowedKeys)) return {error:'unexpected_fields'};

  const name = normalizeText(payload.name,80);
  const email = normalizeText(payload.email,254);
  const organization = normalizeText(payload.organization,120);
  const topic = normalizeText(payload.topic,40);
  const subject = normalizeText(payload.subject,140);
  const message = normalizeText(payload.message,4000,{multiline:true});

  const topics = new Set([
    'architecture','cybersecurity','grc','resilience','ai',
    'applications','collaboration','legal_privacy','other'
  ]);

  if (name.length < 2 || !validEmail(email) || !topics.has(topic) || subject.length < 4 || message.length < 20) {
    return {error:'validation_failed'};
  }

  return {value:{name,email,organization,topic,subject,message}};
}

export function validateSecurityReport(payload) {
  const allowedKeys = [
    'name','email','type','asset','message',
    'website','_startedAt','turnstileToken','cf-turnstile-response'
  ];
  if (!exactKeys(payload,allowedKeys)) return {error:'unexpected_fields'};

  const name = normalizeText(payload.name,80);
  const email = normalizeText(payload.email,254);
  const type = normalizeText(payload.type,40);
  const asset = normalizeText(payload.asset,500);
  const message = normalizeText(payload.message,6000,{multiline:true});

  const types = new Set(['vulnerability','exposure','configuration','suspicious','other']);

  if (!validEmail(email) || !types.has(type) || message.length < 20) {
    return {error:'validation_failed'};
  }

  if (asset && !/^https?:\/\/[^\s]+$/iu.test(asset)) {
    return {error:'validation_failed'};
  }

  return {value:{name,email,type,asset,message}};
}
