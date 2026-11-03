<?php

namespace App\Http\Controllers;

use App\Models\ContentEntry;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function __invoke(): Response
    {
        $base = rtrim(config('catalog.frontend_url'), '/');
        abort_unless(filter_var($base, FILTER_VALIDATE_URL), 503);
        $links = array_map(fn ($p) => ['path' => $p, 'updated' => null], ['/', '/piso-laminado/', '/pisos', '/accesorios', '/nosotros', '/blog', '/proyectos', '/contacto']);
        foreach (Product::published()->with('category.parent')->get() as $p) {
            if ($p->category->published()) {
                $links[] = ['path' => '/'.$p->kind.'/'.$p->slug, 'updated' => $p->updated_at->toAtomString()];
            }
        }
        foreach (ContentEntry::published()->get() as $entry) {
            $links[] = ['path' => '/'.$entry->kind.'/'.$entry->slug, 'updated' => $entry->updated_at->toAtomString()];
        }
        $xml = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
        foreach ($links as $link) {
            $xml .= '<url><loc>'.htmlspecialchars($base.$link['path'], ENT_XML1 | ENT_QUOTES, 'UTF-8').'</loc>'.($link['updated'] ? '<lastmod>'.$link['updated'].'</lastmod>' : '').'</url>';
        }

        return response($xml.'</urlset>', 200, ['Content-Type' => 'application/xml; charset=UTF-8']);
    }
}
