<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $url = fn ($path) => $path ? Storage::disk('media')->url($path) : null;

        return [
            'seoTitle' => $this->seo_title, 'seoDescription' => $this->seo_description,
            'id' => $this->slug, 'name' => $this->name, 'sku' => $this->sku, 'category' => $this->kind,
            'categoryId' => $this->category_id, 'subcategory' => $this->category->name,
            'description' => $this->description ?? '', 'material' => $this->material ?? '', 'finish' => $this->finish ?? '',
            'priceUnit' => $this->kind === 'accesorios' ? 'ml' : 'm2',
            'height' => $this->height, 'spec' => $this->spec, 'price' => $this->price,
            'usage' => $this->usage ?? [], 'colors' => $this->colors ?? [], 'colorFamilies' => $this->color_families ?? [],
            'photo' => $this->legacy_photo ?? [], 'photoSource' => $this->legacy_source ?? 'catalog',
            'imageUrl' => $url($this->primary_image ?? ($this->gallery[0] ?? null)), 'gallery' => array_map($url, $this->gallery ?? []),
            'featured' => $this->is_featured, 'technical' => $this->technical ?? (object) [],
        ];
    }
}
