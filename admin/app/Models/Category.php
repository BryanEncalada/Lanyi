<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Validation\ValidationException;

class Category extends Model
{
    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'sort_order' => 'integer'];
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(self::class, 'parent_id');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function published(): bool
    {
        $node = $this;
        $seen = [];
        while ($node) {
            if (! $node->is_active || isset($seen[$node->id])) {
                return false;
            } $seen[$node->id] = true;
            $node = $node->parent;
        }

        return true;
    }

    protected static function booted(): void
    {
        static::saving(function (self $category) {
            if (! in_array($category->kind, ['pisos', 'accesorios'], true)) {
                throw ValidationException::withMessages(['kind' => 'Tipo inválido.']);
            }
            if ($category->exists && $category->isDirty('kind') && ($category->products()->exists() || $category->children()->exists())) {
                throw ValidationException::withMessages(['kind' => 'No cambies el tipo de una categoría con productos o subcategorías.']);
            }
            $parent = $category->parent_id ? self::find($category->parent_id) : null;
            $seen = [];
            while ($parent) {
                if ($parent->kind !== $category->kind || $parent->id === $category->id || isset($seen[$parent->id])) {
                    throw ValidationException::withMessages(['parent_id' => 'Selecciona una categoría padre del mismo tipo, sin ciclos.']);
                }
                $seen[$parent->id] = true;
                $parent = $parent->parent;
            }
        });
    }
}
