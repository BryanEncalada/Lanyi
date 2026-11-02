<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CatalogSeeder extends Seeder
{
    public function run(): void
    {
        foreach (json_decode(file_get_contents(database_path('data/catalog.json')), true, flags: JSON_THROW_ON_ERROR) as $index => $data) {
            $category = Category::firstOrCreate(['kind' => $data['category'], 'slug' => Str::slug($data['material'])], ['name' => $data['material'], 'is_active' => true, 'sort_order' => $index]);
            // Importación no destructiva: nunca sobrescribe un producto administrado o eliminado.
            if (Product::withTrashed()->where('kind', $data['category'])->where('slug', $data['id'])->exists()) {
                continue;
            }
            Product::create([
                'kind' => $data['category'], 'slug' => $data['id'], 'sku' => strtoupper(($data['category'] === 'pisos' ? 'PIS-' : 'ACC-').$data['id']),
                'category_id' => $category->id, 'name' => $data['name'], 'description' => $data['description'], 'material' => $data['material'],
                'finish' => $data['finish'], 'height' => $data['height'] ?? null, 'spec' => $data['spec'] ?? null, 'price' => $data['price'] ?? null,
                'usage' => $data['usage'], 'colors' => $data['colors'], 'color_families' => $data['colorFamilies'],
                'legacy_photo' => $data['photo'], 'legacy_source' => $data['photoSource'] ?? 'catalog',
                'is_active' => true, 'is_featured' => $data['category'] === 'pisos', 'sort_order' => $index,
            ]);
        }
    }
}
