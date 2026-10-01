const ALLOWED_ORIGINS = new Set([
  "https://grcreal.com",
  "https://www.grcreal.com",
  "https://technology-advisory.es",
  "https://www.technology-advisory.es",
  "https://cyberlibrary-ai.es",
  "https://www.cyberlibrary-ai.es",
  "https://fraudedigital.es",
  "https://www.fraudedigital.es",
]);

const CERTIFICATIONS_PATH = "/data/certificaciones.json";
const ARQ_STUDIO_PDF_PREFIX = "/assets/arq-studio/";

function appendVaryOrigin(headers) {
  const vary = headers.get("Vary");

  if (!vary) {
    headers.set("Vary", "Origin");
    return;
  }

  const values = vary
    .split(",")
    .map((value) => value.trim().toLowerCase());

  if (!values.includes("origin")) {
    headers.set("Vary", `${vary}, Origin`);
  }
}

function isArqStudioPdf(pathname) {
  return (
    pathname.startsWith(ARQ_STUDIO_PDF_PREFIX) &&
    pathname.toLowerCase().endsWith(".pdf")
  );
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  /*
   * 1) Catálogo central de certificaciones:
   *    CORS dinámico y restringido a los orígenes autorizados.
   */
  if (url.pathname === CERTIFICATIONS_PATH) {
    const origin = request.headers.get("Origin");

    if (request.method === "OPTIONS") {
      const headers = new Headers({
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
      });

      if (origin && ALLOWED_ORIGINS.has(origin)) {
        headers.set("Access-Control-Allow-Origin", origin);
      }

      return new Response(null, {
        status: origin && ALLOWED_ORIGINS.has(origin) ? 204 : 403,
        headers,
      });
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          "Allow": "GET, HEAD, OPTIONS",
        },
      });
    }

    const response = await context.next();
    const hardenedResponse = new Response(response.body, response);
    const headers = hardenedResponse.headers;

    headers.delete("Access-Control-Allow-Origin");
    appendVaryOrigin(headers);

    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers.set("Access-Control-Allow-Origin", origin);
    }

    headers.set("Cache-Control", "public, max-age=300, must-revalidate");
    headers.set("X-Content-Type-Options", "nosniff");

    return hardenedResponse;
  }

  /*
   * 2) PDFs de Arq Studio:
   *    permitir que solo páginas del mismo origen los embeban en iframe.
   *    Se elimina X-Frame-Options: DENY porque bloquearía incluso el iframe
   *    same-origin y se sustituye la política frame-ancestors global.
   */
  if (isArqStudioPdf(url.pathname)) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          "Allow": "GET, HEAD",
        },
      });
    }

    const response = await context.next();
    const pdfResponse = new Response(response.body, response);
    const headers = pdfResponse.headers;

    headers.delete("X-Frame-Options");
    headers.set("Content-Security-Policy", "frame-ancestors 'self'");
    headers.set("X-Content-Type-Options", "nosniff");

    return pdfResponse;
  }

  // Resto del sitio: sin cambios.
  return context.next();
}
