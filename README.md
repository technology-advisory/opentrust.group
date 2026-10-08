# OpenTrust Group v2

Entorno PRE de `v2.opentrust.group` sobre **Cloudflare Pages + Pages Functions**.

## Cloudflare Pages

Configuración:

- Framework preset: `None`
- Build command: `exit 0`
- Build output directory: raíz del repositorio
- Root directory: `/`

El dominio personalizado se gestiona en Cloudflare; no se usa `CNAME`.

## Pages Functions

- `/api/form-config`
- `/api/contact`
- `/api/security-report`
- `/data/certificaciones.json` (CORS controlado para portales autorizados)

`_routes.json` limita la ejecución de Functions a esas rutas.

## Formularios

Turnstile se carga desde `https://challenges.cloudflare.com`.
El frontend conserva los datos si se pulsa fuera del diálogo o Escape; el cierre se realiza
mediante el botón explícito.

Variables/secretos esperados en Cloudflare (no almacenar valores reales en Git):

- `ENVIRONMENT`
- `ALLOWED_FORM_ORIGINS`
- `TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`
- `TURNSTILE_ALLOWED_HOSTNAMES`
- `FORM_DELIVERY_ENABLED`
- `ZOHO_CLIENT_ID`
- `ZOHO_CLIENT_SECRET`
- `ZOHO_REFRESH_TOKEN`
- `ZOHO_ACCOUNT_ID`
- `ZOHO_FROM_ADDRESS`
- `CONTACT_TO_ADDRESS`
- `SECURITY_TO_ADDRESS`

## PRE -> PRO

Antes de producción, cambiar en `js/main.js` únicamente:

```js
const OPEN_TRUST_STATUS_URL = 'https://status.opentrust.group/';
```

y revisar en Cloudflare los orígenes/hostnames permitidos del entorno productivo.

Los secretos y tokens no forman parte del repositorio.
