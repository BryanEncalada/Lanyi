<?php

namespace App\Models;

use App\Models\Concerns\HasEditorialImages;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Validation\ValidationException;

class ContentEntry extends Model
{
    use HasEditorialImages,SoftDeletes;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['tags' => 'array', 'gallery' => 'array', 'legacy_photo' => 'array', 'is_active' => 'boolean', 'is_featured' => 'boolean', 'published_at' => 'datetime', 'sort_order' => 'integer'];
    }

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_active', true)->whereNotNull('published_at')->where('published_at', '<=', now());
    }

    protected static function booted(): void
    {
        static::saving(function (self $entry) {
            if (! in_array($entry->kind, ['blog', 'proyectos'], true)) {
                throw ValidationException::withMessages(['kind' => 'Tipo de contenido inválido.']);
            }
        });
    }
}
