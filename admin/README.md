# Administración de Lanyi Pisos

Aplicación Laravel independiente en `admin/`. Angular permanece en `../web/`. El panel está en `/admin`; la API pública, en `/api`.

## Estado comprobado

- PHP local 8.4.27, Laravel 13.39.0, Filament 5.11.0, Livewire 4.4.8. Versiones fijadas en composer.lock.
- Composer resolvió dependencias con PHP 8.4.0 y `ext-bcmath: false`, sin ignorar requisitos.
- 16 pruebas PHP / 113 aserciones: migraciones SQLite, importación no destructiva, endpoints, separación de tipos, publicación, categorías padre, permisos, login/logout, CRUD nativo, contraseña con hash, carga/reemplazo/borrado de imágenes, rechazo de formato/tamaño y rutas inválidas.
- Las mismas pruebas pasaron con funciones BCMath deshabilitadas y el calculador nativo de brick/math seleccionado **solo en el bootstrap de pruebas**. PHP Windows incluye BCMath; esto simula su ausencia y no sustituye la verificación del PHP real del hosting.
- Angular: compilación de producción y 5 pruebas de transición de catálogo.
- **No se ha conectado MySQL ni desplegado en cPanel.** No se han ejecutado migraciones remotas. El CRUD se probó contra SQLite local; debe repetirse en MySQL antes de publicar.
- Sin usuarios/contraseñas predeterminados. Los seeders importan productos, nunca cuentas.
- Las fotografías heredadas son los recortes que ya usa Angular, no nuevos archivos comerciales. Se conservan hasta reemplazarlas por imágenes en el administrador.

## Arquitectura y datos

`Product` comparte estructura entre pisos y accesorios; `kind` los separa en recursos Filament y API. Guarda nombre, SKU, slug, categoría, descripción, material, acabado, espesor/altura, especificación, precio decimal opcional, usos, colores, características técnicas, imágenes, publicación, destacado y orden.

`Category` admite jerarquía por `parent_id`. No permite ciclos, padres de otro tipo ni eliminar categorías con productos (incluidos eliminados) o subcategorías. Despublicar un padre oculta también sus descendientes y productos en la API.

La combinación `kind + slug` es única: se conserva `madera-nogal` tanto en pisos como en accesorios. El SKU es único globalmente. Los SKU iniciales PIS-/ACC- son identificadores internos de importación, no códigos comerciales proporcionados por la empresa. El slug no se cambia al editar para conservar enlaces.

La importación de `database/data/catalog.json` conserva los **4 pisos y 9 accesorios** originales, sus campos y recortes. Es idempotente: no sobrescribe cambios ni vuelve a crear productos eliminados. El borrado de productos es lógico; las imágenes que dejan de utilizarse se eliminan físicamente. No se ofrece restauración de imágenes. Haz copias de seguridad antes de borrar.

## Desarrollo local

Requisitos: PHP 8.4, Composer 2, extensiones indicadas en la sección hosting. Node se utiliza solamente para compilar Angular localmente.

Desde `admin/`:

```powershell
composer install
Copy-Item .env.example .env
php artisan key:generate
```

Edita .env para la prueba **local**:

```dotenv
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
DB_CONNECTION=sqlite
DB_DATABASE=D:/Proyectos/Lanyi/admin/database/database.sqlite
SESSION_SECURE_COOKIE=false
FRONTEND_ORIGINS=http://localhost:4200,http://127.0.0.1:4200
```

Crea el archivo SQLite vacío si no existe, luego:

```powershell
php artisan migrate --seed
php artisan admin:create
php artisan serve --host=127.0.0.1 --port=8000
php artisan test
```

`admin:create` solicita nombre/correo y contraseña oculta con confirmación (mínimo 12 caracteres). No pases contraseñas como argumentos ni las guardes en el repositorio. El último administrador activo no se puede eliminar ni desactivar. Las operaciones de administración requieren una cuenta activa con permiso de administrador.

En este equipo se instaló PHP/Composer portable en `C:/Users/clip_/.codex/tmp/lanyi-php84/`, sin cambios globales. Si no están en PATH:

```powershell
$env:Path='C:\Users\clip_\.codex\tmp\lanyi-php84;'+$env:Path
php C:\Users\clip_\.codex\tmp\lanyi-php84\composer.phar install
```

## API pública

- GET /api/pisos
- GET /api/pisos/{slug}
- GET /api/accesorios
- GET /api/accesorios/{slug}
- GET /api/categorias

Solo GET/HEAD, respuestas JSON bajo `data`, límite de 120 solicitudes/minuto por IP. No hay endpoints públicos de escritura. Productos inactivos, eliminados o de categorías ocultas no se publican; detalle inexistente responde 404. Los listados devuelven todo el catálogo publicado, ordenado por orden/id, para mantener los filtros locales de Angular.

La respuesta conserva el contrato Angular (`id = slug`, `category = pisos|accesorios`, `photo`, `photoSource`) y añade SKU, categoryId, subcategory, imageUrl, gallery, featured y technical. No devuelve usuarios ni rutas internas privadas. Las URLs públicas de fotos se construyen desde APP_URL.

## Conectar Angular sin recompilar

Edita `web/public/catalog-config.json` en desarrollo, o el mismo archivo ya publicado en la raíz de Angular:

```json
{
  "apiBaseUrl": "https://TU-SUBDOMINIO-ADMIN/api",
  "fallbackOnError": true
}
```

El dominio es un marcador: sustituir por el real. No poner credenciales en este JSON.

- URL vacía: catálogo estático actual.
- Error de red/servidor/contrato inválido: respaldo estático cuando fallbackOnError=true.
- Respuesta correcta, incluso `data: []`: la API manda. No se recuperan productos retirados.
- Pisos y accesorios se actualizan independientemente; un error no mezcla categorías.
- Las categorías de la API alimentan el filtro de categoría; se conservan los demás filtros y rutas.
- Inicio, listados y detalles usan un servicio común. Las fotos subidas sustituyen a los recortes; la galería aparece en la ficha.
- Mientras se descarga la configuración, puede verse el catálogo de respaldo. La sincronización ocurre al cargar la aplicación; para ver cambios del panel, recarga la web.
- Una vez completada la transición, se recomienda `fallbackOnError: false`: un fallo de API deja el listado vacío y evita que reaparezcan productos antiguos del respaldo. Con true, pueden reaparecer durante una caída. Es una decisión explícita de transición.

Pruebas desde `web/`: `npm run test:catalog` y `npm run build`.

## Preparar MySQL sin SSH ni migraciones en producción

1. Crear en cPanel una base MySQL y un usuario; asignarlo exclusivamente a esa base con permisos de la aplicación. Todavía no hay credenciales: .env.example las deja vacías.
2. Preparar una **base MySQL local/de ensayo** (preferentemente la misma versión/motor que el hosting). No usar el SQLite de desarrollo para generar SQL de MySQL.
3. En una copia local de admin, configurar DB_CONNECTION=mysql y sus credenciales locales; ejecutar localmente `php artisan migrate --seed` y `php artisan admin:create`.
4. Repetir las pruebas de CRUD, imágenes, filtros y API con esa base. La suite automatizada usa SQLite por defecto; para MySQL crea una base exclusiva de pruebas y cambia su configuración de testing, nunca una base con datos reales: RefreshDatabase es destructivo para la base de pruebas.
5. Exportar desde MySQL local con phpMyAdmin o mysqldump **estructura y datos**, incluyendo la tabla migrations y el usuario creado con su contraseña ya hasheada. No incluir cuentas temporales de revisión. Importar el SQL mediante phpMyAdmin en cPanel.
6. Configurar .env remoto con el nombre/usuario reales de cPanel y una contraseña robusta. No subir ni importar archivos .sqlite.
7. Para futuras actualizaciones del esquema, preparar y revisar SQL incremental en MySQL de ensayo, respaldar y aplicarlo vía phpMyAdmin. No volver a importar todo el catálogo ni reemplazar tablas con datos reales.

No existe instalador web, ruta para migraciones ni creación pública de administradores.

## Desplegar en cPanel

### 1. PHP y extensiones

Seleccionar PHP 8.4 en el subdominio. Verificar CLI local y PHP web remoto: ctype, curl, DOM/XML, fileinfo, filter, hash, intl, mbstring, openssl, PCRE, PDO + pdo_mysql, session, tokenizer y GD. SQLite/PDO SQLite se requieren solo para pruebas locales. ZIP facilita Composer local; Composer usa el binario local.

BCMath no es requisito de esta resolución. Composer no debe instalar con `--ignore-platform-reqs`. Ejecuta `composer check-platform-reqs --no-dev` con un PHP equivalente al hosting y revisa las extensiones del panel cPanel; la configuración PHP CLI no demuestra la configuración web del servidor.

La matriz completa puede revisarse en [Laravel](https://laravel.com/docs/13.x/deployment) y [Filament](https://filamentphp.com/docs/5.x/introduction/installation). Si falta una extensión obligatoria, pedirla al proveedor antes de desplegar.

Ajustar `upload_max_filesize` al menos a 4M y `post_max_size` preferentemente a 64M para galería. Ajustar memory_limit (por ejemplo 256M) según el plan y los tamaños reales.

### 2. Preparar archivos localmente

En una copia limpia para distribución, no sobre el entorno de desarrollo:

```powershell
composer install --no-dev --prefer-dist --optimize-autoloader --no-interaction
php artisan filament:assets
composer check-platform-reqs --no-dev
```

No ejecutar Vite en el servidor: este panel usa los assets nativos publicados por Filament, sin tema personalizado. Incluir vendor/ y public/css/filament, public/js/filament y public/fonts/filament, aunque estén ignorados por Git. El lockfile debe acompañar al código.

No subir .env local, SQLite, tests, node_modules, logs ni cachés de desarrollo. No ejecutar config:cache/route:cache en Windows para subirlos; pueden contener configuración/rutas locales. Mantener los directorios de storage y bootstrap/cache con sus archivos .gitignore y sin contenido de ejecución.

Generar una APP_KEY **para producción** localmente con `php artisan key:generate --show`; copiarla al .env remoto, mantenerla privada y conservarla en siguientes despliegues.

### 3. Document root y archivos privados

Opción preferida: subir Laravel fuera del directorio público, por ejemplo:

```text
/home/USUARIO/apps/lanyi-admin/             Laravel privado, .env y vendor
/home/USUARIO/apps/lanyi-admin/public/      Document root del subdominio
```

cPanel debe apuntar el subdominio a **public/**. No apuntarlo a la raíz de Laravel ni colocar .env/vendor/database dentro de un directorio servido públicamente.

Si cPanel obliga a alojar el document root dentro de public_html:

- Laravel privado en /home/USUARIO/apps/lanyi-admin.
- Copiar **solo el contenido de public/** a /home/USUARIO/public_html/SUBDOMINIO.
- En el index.php de ese public externo, ajustar los tres paths hacia storage/framework/maintenance.php, vendor/autoload.php y bootstrap/app.php para apuntar a Laravel privado.
- Separar la carga de la aplicación: `$app = require '/home/USUARIO/apps/lanyi-admin/bootstrap/app.php';`, luego `$app->usePublicPath(__DIR__);`, después `$app->handleRequest(Request::capture());`. Conservar el resto del front controller oficial.
- Configurar `MEDIA_ROOT=/home/USUARIO/public_html/SUBDOMINIO/uploads` en .env para que el disco de imágenes use ese directorio.
- Copiar también .htaccess de public y uploads/.htaccess; activar “Mostrar archivos ocultos” en cPanel. Nunca improvisar moviendo todos los archivos privados a public_html.

Permisos orientativos: archivos 644 y directorios 755. storage/, bootstrap/cache/ y el directorio público uploads/ necesitan escritura para el usuario PHP; ajustar según el proveedor, **no 777**.

### 4. Variables remotas

```dotenv
APP_NAME="Lanyi Pisos"
APP_ENV=production
APP_DEBUG=false
APP_KEY=VALOR_GENERADO_LOCALMENTE
APP_URL=https://SUBDOMINIO-ADMIN
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
DB_CONNECTION=mysql
DB_HOST=HOST_INDICADO_POR_PROVEEDOR
DB_PORT=3306
DB_DATABASE=NOMBRE_REAL_CPANEL
DB_USERNAME=USUARIO_REAL_CPANEL
DB_PASSWORD=CONTRASEÑA_REAL
SESSION_DRIVER=file
SESSION_ENCRYPT=true
SESSION_SECURE_COOKIE=true
CACHE_STORE=file
QUEUE_CONNECTION=sync
FILESYSTEM_DISK=media
FRONTEND_ORIGINS=https://DOMINIO-WEB,https://www.DOMINIO-WEB
```

Los valores en mayúsculas son marcadores, no credenciales. FRONTEND_ORIGINS admite una lista exacta separada por comas, sin espacios ni rutas. Añadir el subdominio de ensayo Angular si se utiliza. CORS solo cubre la API y no permite credenciales ni escrituras cruzadas.

Activar AutoSSL y redirección HTTPS desde cPanel para ambos sitios. No activar trusted proxies indiscriminadamente. Si el proveedor termina TLS en un proxy y Laravel detecta HTTP, solicitar sus IP/rangos y configurarlos explícitamente antes de publicar.

### 5. Imágenes y seguridad

El disco media guarda rutas relativas `products/archivo-aleatorio.jpg` en public/uploads. No requiere storage:link ni enlaces simbólicos. URL pública: APP_URL/uploads/....

El formulario limita a JPG/PNG/WebP de 4 MB y 8 imágenes de galería, valida MIME/imagen y bloquea rutas ajenas inyectadas en FileUpload. Nombres aleatorios; no se conserva el nombre original. No se permite SVG ni ejecutables. uploads/.htaccess impide ejecución de scripts y listado de directorio en Apache; confirmar que el hosting respeta .htaccess. Las imágenes públicas no deben contener información privada.

Reemplazar/quitar imágenes elimina archivos antiguos cuando ningún producto activo/no eliminado los referencia. Borrar el producto elimina sus archivos no compartidos. Archivos subidos en una operación interrumpida pueden quedar huérfanos: revisar en mantenimiento, nunca borrar la carpeta completa. Respaldar MySQL y uploads conjuntamente.

### 6. Angular y comprobación final

Compilar Angular localmente: `npm run build`. Subir el contenido de `web/dist/web/browser/` al document root de la web, conservando su .htaccess para router-outlet/rutas directas. Configurar catalog-config.json con la API real.

Comprobar en hosting:
- /admin/login, login/logout, permisos y administrador inactivo.
- Crear/editar/desactivar/eliminar un piso y un accesorio, SKU único, categorías y subcategorías.
- Subir/reemplazar/quitar principal y galería; confirmar URL/HTTPS y bloqueo de ejecución.
- /api/pisos, /api/accesorios, fichas y categorías: únicamente publicados y tipo correcto.
- Angular Inicio, Pisos, Accesorios, fichas directas, filtros, galería y WhatsApp en escritorio y móvil.
- CORS desde el dominio real, ausencia de contenido mixto y rutas Angular al recargar.
- .env, composer.json, database/ y vendor/ no accesibles desde Internet.
- Respaldos y acceso del usuario propietario.

Estos pasos remotos quedan pendientes hasta disponer de base de datos y acceso al hosting.
