# SEO y medición de Lanyi Pisos

Se revisó el HTML público de https://lanyipisos.com/piso-laminado/ y el contenedor público de Google Tag Manager. Se encontraron Yoast SEO, GTM-5F89S78G y la etiqueta GA4 G-S3DQSC43NL. Estos identificadores son públicos; no otorgan acceso a los informes.

## Implementación

- `public/site-config.json` centraliza títulos, descripciones, dominio principal, identidad y configuración de medición.
- Se conserva `/piso-laminado/`, su título y descripción originales, con el catálogo limitado a laminados.
- El puente PHP entrega metadatos y datos estructurados en el HTML inicial. Angular los actualiza al navegar sin recargar.
- Se reutiliza el contenedor GTM; no se carga una segunda etiqueta gtag.js. Los clics de WhatsApp conservan el evento `ClicButtonWs`, sin incluir números, mensajes ni datos del cliente. Teléfono y correo emiten `contact_click`.
- Cada navegación Angular emite `lanyi_page_view` en dataLayer, con URL sin parámetros ni fragmentos. Este evento no envía por sí solo un segundo page_view a GA4.
- Solo `lanyipisos.com` y `www.lanyipisos.com` están autorizados para medición e indexación. El subdominio test y localhost llevan noindex y no cargan GTM. No se bloquea su rastreo mediante robots.txt porque Google necesita poder leer noindex.
- No se copian la búsqueda interna de WordPress, fechas antiguas ni la imagen de WhatsApp usada antes como portada social.

## Publicación y comprobación pendiente

Volver a compilar y publicar el contenido de `dist/web/browser`, incluidos `.htaccess`, `seo.php` y los JSON públicos. El hosting debe ejecutar PHP. No es un cambio ya desplegado. Conservar la configuración pública de la API apropiada para cada entorno; no publicar archivos .env.

Al publicar en el dominio definitivo, configurar `FRONTEND_URL=https://lanyipisos.com` en Laravel para el sitemap. Mantener las demás URLs antiguas o preparar sus redirecciones antes de sustituir WordPress; esta revisión conservó específicamente la URL solicitada y no constituye una auditoría de todas las URLs antiguas.

En Tag Assistant y GA4, comprobar una visita inicial, cambios de ruta y clics de WhatsApp. El contenedor público revisado no muestra un disparador History Change; la configuración privada de medición mejorada de GA4 no es verificable desde el código público. Si ya mide cambios de historial, conservar ese mecanismo. Si no los mide, configurar en GTM `lanyi_page_view` para enviar page_view, desactivando antes el mecanismo automático equivalente para evitar duplicados. Revisar también el debug_mode observado en el contenedor original desde la cuenta de GTM.

Enviar el sitemap del dominio definitivo en Google Search Console y comprobar indexación. Analytics mide visitas y conversiones; instalarlo no garantiza una posición en Google.

Referencias: https://developers.google.com/analytics/devguides/collection/ga4/measure-spa-gtm y https://developers.google.com/search/docs/fundamentals/seo-starter-guide
