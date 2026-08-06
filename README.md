# OpenTrust Group · Web corporativa limpia v2.3

Sitio estático corporativo de OpenTrust Group.

## Ejecución local

No requiere Node.js ni dependencias.

Puede abrirse con cualquier servidor estático, por ejemplo:

- Visual Studio Code + Live Server
- Python: `python -m http.server 10005`

## Estructura

- `index.html`: portada corporativa
- `sobre-mi/`: trayectoria profesional
- `legal/`: información legal
- `apps/`: páginas de productos
- `css/`: todo el CSS del sitio
- `js/`: todo el JavaScript del sitio
- `data/`: contenido reutilizable en JSON
- `assets/`: imágenes y documentos de producto

## Sistema compartido

- `css/site.css`
- `js/site-shell.js`

Controlan el header, navegación, ancho, footer, responsive y comportamiento de enlaces.

## Regla de enlaces

- Páginas internas de `opentrust.group`: misma pestaña.
- Dominios y subdominios externos/diferentes: nueva pestaña.

## No incluido

- Node.js
- npm
- SMTP
- `.env`
- `cv-admin`
- registros de correo o IP
- PDF privado
- backups y archivos `.bak`

## Correcciones v2.3

- Restaurado `data/certificaciones.json`.
- Restaurada la fotografía de la trayectoria profesional.
- Restaurada la captura real de Link Studio.
- Corregidas las rutas JavaScript de Arq Studio y Privacy Studio.
- Eliminada la referencia obsoleta a `sobre-mi/assets/vida-profesional.css`.
- Nuevo header corporativo premium, compartido por todas las páginas.
- Validación automática completa de referencias locales.

## Corrección estructural v2.3

El header y el footer son componentes únicos e invariables:

- HTML generado exclusivamente por `js/site-shell.js`.
- Estilos definidos exclusivamente por `css/site.css`.
- Los CSS de página no contienen selectores del header o footer.
- `site.css` se carga siempre después del CSS específico de cada página.

## Cierre v2.3

Todas las páginas internas de `/apps/` reciben automáticamente desde
`js/site-shell.js` un enlace accesible **Volver al ecosistema**.

No se ha maquetado cada aplicación por separado.
