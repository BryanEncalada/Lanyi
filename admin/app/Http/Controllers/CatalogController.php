<?php

namespace App\Http\Controllers;

use App\Http\Resources\ProductResource;
use App\Models\Category;
use App\Models\Product;

class CatalogController extends Controller
{
    public function index(string $kind)
    {
        $products = Product::published()->where('kind', $kind)->with('category.parent')->orderBy('sort_order')->orderBy('id')->get()->filter(fn ($p) => $p->category->published())->values();

        return ProductResource::collection($products);
    }

    public function show(string $kind, string $slug)
    {
        $product = Product::published()->where('kind', $kind)->where('slug', $slug)->with('category.parent')->firstOrFail();
        abort_unless($product->category->published(), 404);

        return new ProductResource($product);
    }

    public function categories()
    {
        return response()->json(['data' => Category::orderBy('sort_order')->get()->filter(fn ($c) => $c->published())->values()->map(fn ($c) => ['id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'kind' => $c->kind, 'parentId' => $c->parent_id])]);
    }
}
