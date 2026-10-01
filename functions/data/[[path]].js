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

const TARGET_PATH = "/data/certificaciones.json";

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Esta Function solo modifica el comportamiento del JSON central.
  // El resto de /data/* continúa sirviéndose normalmente.
  if (url.pathname !== TARGET_PATH) {
    return context.next();
  }

  const origin = request.headers.get("Origin");

  // Preflight CORS, si algún consumidor lo necesitase en el futuro.
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

  // El catálogo es de solo lectura.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        "Allow": "GET, HEAD, OPTIONS",
      },
    });
  }

  // Obtiene el recurso estático original.
  const response = await context.next();

  // Clonamos la respuesta para poder modificar sus cabeceras.
  const hardenedResponse = new Response(response.body, response);
  const headers = hardenedResponse.headers;

  // Nunca dejamos un wildcard heredado.
  headers.delete("Access-Control-Allow-Origin");

  // Evita problemas de caché entre orígenes distintos.
  const vary = headers.get("Vary");
  if (!vary) {
    headers.set("Vary", "Origin");
  } else if (!vary.split(",").map(v => v.trim().toLowerCase()).includes("origin")) {
    headers.set("Vary", `${vary}, Origin`);
  }

  // Solo reflejamos orígenes expresamente autorizados.
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
  }

  // Cache corta para permitir actualizar certificaciones con rapidez.
  headers.set("Cache-Control", "public, max-age=300, must-revalidate");
  headers.set("X-Content-Type-Options", "nosniff");

  return hardenedResponse;
}
