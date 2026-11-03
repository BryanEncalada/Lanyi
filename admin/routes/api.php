<?php

use App\Http\Controllers\CatalogController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\EditorialController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:120,1')->group(function () {
    Route::get('/testimonios', [EditorialController::class, 'testimonials']);
    Route::get('/contenido/{kind}', [EditorialController::class, 'index'])->whereIn('kind', ['blog', 'proyectos']);
    Route::get('/contenido/{kind}/{slug}', [EditorialController::class, 'show'])->whereIn('kind', ['blog', 'proyectos']);
    Route::get('/categorias', [CatalogController::class, 'categories']);
    Route::get('/{kind}', [CatalogController::class, 'index'])->whereIn('kind', ['pisos', 'accesorios']);
    Route::get('/{kind}/{slug}', [CatalogController::class, 'show'])->whereIn('kind', ['pisos', 'accesorios']);
});

Route::post('/contacto', [ContactController::class, 'store'])->middleware('throttle:5,1');
Route::get('/sitemap.xml', SitemapController::class)->middleware('throttle:30,1');
