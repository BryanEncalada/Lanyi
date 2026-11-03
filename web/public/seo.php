<?php

/**
 * HTML metadata bridge for shared hosting. Uses the public read-only API;
 * never reads Laravel credentials. Apache sends detail routes and sitemap here.
 */
declare(strict_types=1);
header('X-Content-Type-Options: nosniff');
$config = json_decode((string) @file_get_contents(__DIR__.'/catalog-config.json'), true) ?? [];
$base = rtrim((string) ($config['apiBaseUrl'] ?? ''), '/');
$parts = parse_url($base);
$validBase = is_array($parts) && in_array($parts['scheme'] ?? '', ['http', 'https'], true) && ! isset($parts['user']) && ! isset($parts['pass']) && ! isset($parts['query']) && ! isset($parts['fragment']);
if (($_GET['mode'] ?? '') === 'robots') {
    $host = (string) ($_SERVER['HTTP_HOST'] ?? 'test.lanyipisos.com');
    if (! preg_match('/^[a-z0-9.-]+(?::[0-9]+)?$/iD', $host)) {
        $host = 'test.lanyipisos.com';
    }
    header('Content-Type: text/plain; charset=UTF-8');
    echo "User-agent: *\nAllow: /\nDisallow: /seo.php\nSitemap: https://".$host."/sitemap.xml\n";
    exit;
}
function publicApi(string $url): array
{
    if (! function_exists('curl_init')) {
        return [503, ''];
    }
    $body = '';
    $handle = curl_init($url);
    curl_setopt_array($handle, [CURLOPT_FOLLOWLOCATION => false, CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_TIMEOUT => 8, CURLOPT_HTTPHEADER => ['Accept: application/json, application/xml'], CURLOPT_WRITEFUNCTION => function ($ch, string $chunk) use (&$body): int {
        if (strlen($body) + strlen($chunk) > 4194304) {
            return 0;
        }$body .= $chunk;

        return strlen($chunk);
    }]);
    $ok = curl_exec($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_HTTP_CODE);
    curl_close($handle);

    return [$ok === false ? 503 : $status, $body];
}
if (($_GET['mode'] ?? '') === 'sitemap') {
    if (! $validBase) {
        http_response_code(503);
        exit('Sitemap temporalmente no disponible.');
    }
    [$status,$xml] = publicApi($base.'/sitemap.xml');
    if ($status !== 200 || ! str_starts_with(ltrim($xml), '<?xml')) {
        http_response_code(503);
        exit('Sitemap temporalmente no disponible.');
    }
    header('Content-Type: application/xml; charset=UTF-8');
    echo $xml;
    exit;
}
$site = json_decode((string) @file_get_contents(__DIR__.'/site-config.json'), true) ?? [];
$pagePath = '/'.trim((string) ($_GET['page'] ?? parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH)), '/');
$preset = $site['pages'][$pagePath] ?? null;
$kind = (string) ($_GET['kind'] ?? '');
$slug = (string) ($_GET['slug'] ?? '');
$known = in_array($kind, ['pisos', 'accesorios', 'blog', 'proyectos'], true) && preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/D', $slug);
$title = 'Página no encontrada | Lanyi Pisos';
$description = 'El enlace solicitado no está disponible.';
$image = '/images/hero/hero01.jpeg';
$status = 404;
$data = [];
if (is_array($preset)) {
    $title = $preset['title'];
    $description = $preset['description'];
    $status = 200;
} elseif ($known && $validBase) {
    $endpoint = in_array($kind, ['blog', 'proyectos'], true) ? '/contenido/'.$kind.'/'.$slug : '/'.$kind.'/'.$slug;
    [$status,$json] = publicApi($base.$endpoint);
    $decoded = json_decode($json, true);
    if ($status === 200 && is_array($decoded['data'] ?? null)) {
        $data = $decoded['data'];
        $title = (($data['seoTitle'] ?? '') ?: ($data['title'] ?? $data['name'] ?? 'Lanyi Pisos')).' | Lanyi Pisos';
        $description = (string) (($data['seoDescription'] ?? '') ?: ($data['description'] ?? 'Pisos y acabados para tus espacios.'));
        $candidate = $data['imageUrl'] ?? null;
        if (is_string($candidate) && filter_var($candidate, FILTER_VALIDATE_URL) && in_array(parse_url($candidate, PHP_URL_SCHEME), ['https', 'http'], true)) {
            $image = $candidate;
        }
    } elseif ($status !== 404) {
        $status = 503;
        $title = 'Catálogo temporalmente no disponible | Lanyi Pisos';
        $description = 'Intenta nuevamente más tarde o contáctanos por WhatsApp.';
    }
} elseif ($known) {
    $status = 503;
    $title = 'Catálogo temporalmente no disponible | Lanyi Pisos';
}
http_response_code($status === 200 ? 200 : ($status === 404 ? 404 : 503));
header('Content-Type: text/html; charset=UTF-8');
$host = (string) ($_SERVER['HTTP_HOST'] ?? 'test.lanyipisos.com');
if (! preg_match('/^[a-z0-9.-]+(?::[0-9]+)?$/iD', $host)) {
    $host = 'test.lanyipisos.com';
}
$origin = (str_starts_with($host, 'localhost') || str_starts_with($host, '127.0.0.1') ? 'http://' : 'https://').$host;
$canonical = $origin.($known ? '/'.$kind.'/'.$slug : (parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH) ?: '/'));
$indexable = in_array(strtolower(explode(':', $host)[0]), $site['indexableHosts'] ?? ['lanyipisos.com', 'www.lanyipisos.com'], true);
if (is_array($preset)) {
    $canonical = $origin.($preset['canonicalPath'] ?? $pagePath);
}
if ($indexable) {
    $canonical = rtrim($site['productionOrigin'] ?? 'https://lanyipisos.com', '/').substr($canonical, strlen($origin));
}
$image = str_starts_with($image, '/') ? $origin.$image : $image;
$escape = fn (string $s): string => htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$html = (string) @file_get_contents(__DIR__.'/index.html');
$html = preg_replace('~<meta\s+name=["\']robots["\'][^>]*>~is', '', $html);
$html = preg_replace_callback('~<title>.*?</title>~is', fn () => '<title>'.$escape($title).'</title>', $html);
$html = preg_replace('~<meta\s+name=["\']description["\'][^>]*>~is', '', $html);
$html = preg_replace('~<(?:meta\s+(?:property=["\']og:[^>]*|name=["\']twitter:[^>]*)|link\s+rel=["\']canonical[^>]*)>~is', '', $html);
$tags = '<meta name="description" content="'.$escape($description).'"><link rel="canonical" href="'.$escape($canonical).'">';
foreach (['og:title' => $title, 'og:description' => $description, 'og:image' => $image, 'og:url' => $canonical, 'og:type' => $kind === 'blog' ? 'article' : 'website'] as $property => $value) {
    $tags .= '<meta property="'.$property.'" content="'.$escape($value).'">';
}
$tags .= '<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="'.$escape($image).'">';
if ($status !== 200 || ! $indexable) {
    $tags .= '<meta name="robots" content="noindex,follow">';
} else {
    $tags .= '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">';
}
$org = $site['organization'] ?? ['name' => 'Lanyi Pisos', 'url' => 'https://lanyipisos.com/'];
$schema = ['@context' => 'https://schema.org', '@graph' => [
    ['@type' => 'Organization', 'name' => $org['name'], 'url' => $org['url'], 'logo' => $org['logo'] ?? null, 'sameAs' => $org['sameAs'] ?? []],
    ['@type' => 'WebSite', 'name' => 'Lanyi Pisos', 'url' => $origin.'/', 'inLanguage' => 'es-PE'],
    ['@type' => $kind === 'blog' ? 'Article' : 'WebPage', 'name' => $title, 'url' => $canonical, 'description' => $description, 'image' => $image, 'inLanguage' => 'es-PE'],
    ['@type' => 'BreadcrumbList', 'itemListElement' => [['@type' => 'ListItem', 'position' => 1, 'name' => 'Inicio', 'item' => $origin.'/'], ['@type' => 'ListItem', 'position' => 2, 'name' => $title, 'item' => $canonical]]],
]];
$tags .= '<meta property="og:site_name" content="Lanyi Pisos"><meta property="og:locale" content="es_PE">';
$tags .= '<script id="lanyi-structured-data" type="application/ld+json">'.json_encode($schema, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE).'</script>';
$html = str_replace('</head>', $tags.'</head>', $html);
$summary = '<noscript><main><h1>'.$escape($title).'</h1><p>'.$escape($description).'</p>';
if (! empty($data['body'])) {
    $summary .= '<div style="white-space:pre-line">'.$escape((string) $data['body']).'</div>';
}
$html = str_replace('</body>', $summary.'</main></noscript></body>', $html);
echo $html;
