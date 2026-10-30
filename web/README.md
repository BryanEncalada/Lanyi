# Lanyi Pisos

Proyecto Angular existente, con componentes standalone, SCSS y navegación mediante Angular Router.

## Desarrollo

```sh
npm install
npm start
```

- Home: http://localhost:4200/
- Pisos: http://localhost:4200/pisos
- Accesorios (zócalos y rodones): http://localhost:4200/accesorios
- Nosotros: http://localhost:4200/nosotros
- Las rutas anteriores /zocalos y /productos redirigen a /accesorios.

Las páginas cargan de forma diferida dentro del único router-outlet de App. Header, Footer y el acceso flotante a WhatsApp se montan una sola vez en el layout.

## Catálogo y contenido

- Catálogo: src/app/shared/data/products.ts.
- Pisos destacados y catálogo de Pisos: src/app/shared/data/floors.ts.
- Pisos y Accesorios usan Products con datos de categoría en las rutas, sin duplicar la plantilla ni mezclar productos.
- Nosotros reutiliza la imagen del proyecto y la identifica como referencial.
- Todos los iconos de WhatsApp usan el mismo SVG del componente Icon.
- Componentes reutilizables: ProductCard, Icon y ReferencePhoto.
- Filtros combinables: material, color, acabado, altura y uso. Orden por nombre o altura, contador y estado sin resultados.
- En móvil los filtros se despliegan mediante un botón y el menú se convierte en un panel.
- Los botones de cotización abren WhatsApp con el producto seleccionado; no envían mensajes automáticamente.
- Home incluye detalles de pisos y proyectos y lectura de publicaciones en diálogos nativos.

Los productos, precios, testimonios y proyectos de la propuesta son contenido ilustrativo tomado de las referencias. Revisar la información comercial antes de publicar. La fotografía principal de Home es la que ya estaba en el proyecto. Las demás fotografías usan encuadres CSS de las referencias adjuntas, por lo que se recomienda reemplazarlas por originales de alta resolución. Ver public/images/references/README.md.

## Compilación y publicación

```sh
npm run build
```

Salida estática: dist/web/browser. El servidor de producción debe servir index.html como fallback para rutas de Angular que no sean archivos; así /pisos, /accesorios y /nosotros también funcionan al entrar directamente o recargar. Por ejemplo, en Nginx: `try_files $uri $uri/ /index.html;`.

No se han añadido dependencias ni servicios externos.

## Verificación

Compilación de producción y revisión en navegador de Home y Productos en escritorio, tablet y móvil. Se verificaron filtros combinados, orden, limpieza, estado vacío, navegación Angular, menú móvil, enlaces de cotización y detalles de pisos.
