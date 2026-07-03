# OpenTrust Group

**Hub intermedio y puerta de acceso al ecosistema de conocimiento abierto para construir confianza digital.**

## 🎯 Descripción

OpenTrust Group es una página hub que conecta los diferentes proyectos del ecosistema de conocimiento abierto:

- **GRCreal**: Gobierno, Riesgo, Cumplimiento e IA
- **FraudeDigital**: Concienciación frente al fraude digital
- **LexRadar**: El radar jurídico de jurisprudencia
- **Technology Advisory**: Arquitectura, infraestructura y ciberseguridad

## 🚀 Características Técnicas

- ✨ Responsive design mobile-first
- 🎨 Menú hamburguesa SVG para móvil
- 📱 Optimizado para todos los dispositivos (560px - 1200px+)
- 🔍 SEO avanzado (meta tags, JSON-LD, Open Graph)
- ♿ Accesibilidad (WCAG 2.1)
- ⚡ Rendimiento optimizado (caché, compresión)
- 🔒 Headers de seguridad
- 📊 Datos estructurados para buscadores

## 📁 Estructura

```
opentrust.group/
├── index.html              # Página principal con SEO optimizado
├── css/
│   ├── global.css         # Estilos globales + menú responsive
│   └── home.css           # Estilos específicos de home
├── js/
│   └── main.js            # Lógica del menú y carga de datos
├── data/
│   └── ecosistema.json    # Datos de los proyectos
├── site.webmanifest       # PWA manifest
├── robots.txt             # Rastreabilidad para buscadores
├── .htaccess              # Optimizaciones de servidor
├── favicon.ico
├── favicon-16x16.png
├── favicon-32x32.png
└── apple-touch-icon.png
```

## 🔧 Instalación y Despliegue

### Local
```bash
# Simplemente servir los archivos con cualquier servidor web:
python -m http.server 8000
# O con Node.js:
npx http-server
```

### GitHub Pages / Vercel / Netlify
1. Subir la carpeta al repositorio
2. Configurar como rama de despliegue (si es GitHub Pages)
3. El sitio se servirá automáticamente

### Servidor Web (Apache/Nginx)
- Incluye `.htaccess` para Apache
- Asegúrese de tener `mod_rewrite` y `mod_deflate` habilitados
- Para Nginx, traducir las reglas del `.htaccess` manualmente

## 📊 SEO y Metadatos

- **Meta tags**: Descripción, robots, canonical
- **Open Graph**: Optimizado para redes sociales
- **Twitter Card**: Previsualizaciones en X/Twitter
- **JSON-LD**: Schema.org estructurado
- **Favicons**: Múltiples formatos y tamaños
- **Responsive**: Meta viewport configurado

## 📱 Responsividad

- **Desktop (>960px)**: Diseño de 4 columnas
- **Tablet (768px-960px)**: Diseño de 2 columnas
- **Mobile (<768px)**: Menú hamburguesa SVG + 1 columna
- **Mini (<560px)**: Ajustes de tipografía y espaciado

## ♿ Accesibilidad

- Contraste WCAG AA+
- Menú hamburguesa con aria-labels
- Navegación por teclado completa
- SVGs con atributos role/aria apropiados
- Semántica HTML correcta

## 🔐 Seguridad

- HTTPS recomendado
- Headers de seguridad en `.htaccess`
- X-Frame-Options, X-Content-Type-Options
- Política de referrer segura

## 🎨 Personalización

### Colores
Los colores principales están definidos en CSS como variables:
```css
--brand: #0d7188        /* Azul principal */
--brand-dark: #12384a   /* Azul oscuro */
--bg: #f4f8fb          /* Fondo */
--surface: #ffffff     /* Superficies */
```

### Datos del Ecosistema
Editar `data/ecosistema.json` para actualizar los proyectos:
```json
{
  "name": "Nombre del proyecto",
  "url": "https://...",
  "tagline": "Breve descripción",
  "description": "Descripción completa",
  "icon": "shield|alert|radar|network"
}
```

## 📈 Rendimiento

- Tamaño total: <50KB (assets + CSS minificado)
- Sin dependencias externas
- Caché agresivo para assets estáticos
- Compresión GZIP habilitada

## 📝 Mantenimiento

- Actualizar `data/ecosistema.json` cuando cambien los proyectos
- Revisar links de contacto
- Mantener meta tags actualizados
- Validar Open Graph con herramientas de redes sociales

## 📄 Licencia

Ecosistema de conocimiento abierto. Uso libre para la comunidad profesional.

---

**Última actualización**: 2026-07-03
**Responsable**: Miguel Ángel Carriazo (Karry)
**Sitio**: https://opentrust.group/
