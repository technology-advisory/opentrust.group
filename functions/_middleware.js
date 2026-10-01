const ARQ_STUDIO_PDF_PREFIX = "/assets/arq-studio/";

function isArqStudioPdf(pathname) {
  return (
    pathname.startsWith(ARQ_STUDIO_PDF_PREFIX) &&
    pathname.toLowerCase().endsWith(".pdf")
  );
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // Solo modificamos las respuestas de los PDFs de Arq Studio.
  if (!isArqStudioPdf(url.pathname)) {
    return context.next();
  }

  // Los PDFs son recursos de solo lectura.
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: {
        "Allow": "GET, HEAD",
      },
    });
  }

  const response = await context.next();

  // Clonamos la respuesta para poder ajustar las cabeceras de framing.
  const pdfResponse = new Response(response.body, response);
  const headers = pdfResponse.headers;

  // Permitir iframe únicamente desde el mismo origen.
  headers.delete("X-Frame-Options");
  headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  headers.set("X-Content-Type-Options", "nosniff");

  return pdfResponse;
}
