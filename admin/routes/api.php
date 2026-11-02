<?php

use App\Http\Controllers\CatalogController;
use Illuminate\Support\Facades\Route;

Route::middleware('throttle:120,1')->group(function () {
    Route::get('/categorias', [CatalogController::class, 'categories']);
    Route::get('/{kind}', [CatalogController::class, 'index'])->whereIn('kind', ['pisos', 'accesorios']);
    Route::get('/{kind}/{slug}', [CatalogController::class, 'show'])->whereIn('kind', ['pisos', 'accesorios']);
});
