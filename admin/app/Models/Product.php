<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class Product extends Model
{
    use SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['usage' => 'array', 'colors' => 'array', 'color_families' => 'array', 'technical' => 'array', 'legacy_photo' => 'array', 'gallery' => 'array', 'price' => 'decimal:2', 'height' => 'integer', 'is_active' => 'boolean', 'is_featured' => 'boolean', 'sort_order' => 'integer'];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function scopePublished($query)
    {
        return $query->where('is_active', true)->whereHas('category', fn ($q) => $q->where('is_active', true));
    }

    public function imagePaths(): array
    {
        return array_values(array_filter(array_merge([$this->primary_image], $this->gallery ?? [])));
    }

    public static function validImagePath(string $path): bool
    {
        return (bool) preg_match('~^products/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$~D', $path);
    }

    protected static function booted(): void
    {
        static::saving(function (self $p) {
            $category = Category::find($p->category_id);
            if (! $category || $category->kind !== $p->kind) {
                throw ValidationException::withMessages(['category_id' => 'La categoría debe pertenecer al tipo de producto.']);
            }
            foreach ($p->imagePaths() as $path) {
                if (! self::validImagePath($path)) {
                    throw ValidationException::withMessages(['primary_image' => 'Ruta de imagen inválida.']);
                }
            }
        });
        static::updated(function (self $p) {
            $old = array_filter(array_merge([$p->getOriginal('primary_image')], $p->getOriginal('gallery') ?? []));
            self::removeUnusedImages(array_diff($old, $p->imagePaths()));
        });
        static::deleted(fn (self $p) => self::removeUnusedImages($p->imagePaths()));
    }

    private static function removeUnusedImages(array $paths): void
    {
        foreach ($paths as $path) {
            if (! self::validImagePath($path)) {
                continue;
            }
            $used = self::query()->where(function ($q) use ($path) {
                $q->where('primary_image', $path)->orWhereJsonContains('gallery', $path);
            })->exists();
            if (! $used) {
                Storage::disk('media')->delete($path);
            }
        }
    }
}
