// OpenTrust Group — hardening de exposición de ficheros de repositorio.
// Estas rutas se incluyen expresamente en _routes.json para que Pages Functions
// responda 404 aunque el directorio de salida siga siendo la raíz del repositorio.
const BLOCKED_PATHS = new Set([
  '/README.md',
  '/.dev.vars.example',
  '/.gitignore'
]);

const HEADERS = Object.freeze({
  'Content-Type':'text/plain; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'X-Content-Type-Options':'nosniff',
  'X-Robots-Tag':'noindex, nofollow, noarchive, nosnippet',
  'Strict-Transport-Security':'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'; base-uri 'none'"
});

export async function onRequest(context) {
  const { pathname } = new URL(context.request.url);
  if (BLOCKED_PATHS.has(pathname)) {
    return new Response('Not found', { status:404, headers:HEADERS });
  }
  return context.next();
}
