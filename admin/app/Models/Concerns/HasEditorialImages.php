<?php

namespace App\Models\Concerns;

use App\Models\ContentEntry;
use App\Models\Testimonial;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

trait HasEditorialImages
{
    public function imagePaths(): array
    {
        return array_values(array_filter(array_merge([$this->cover_image], $this->gallery ?? [])));
    }

    public static function bootHasEditorialImages(): void
    {
        static::saving(function ($record) {
            foreach ($record->imagePaths() as $path) {
                if (! preg_match('~^editorial/[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|webp)$~D', $path)) {
                    throw ValidationException::withMessages(['cover_image' => 'Ruta de imagen inválida.']);
                }
            }
        });
        static::updated(function ($record) {
            $old = array_filter(array_merge([$record->getOriginal('cover_image')], $record->getOriginal('gallery') ?? []));
            static::deleteUnusedEditorialImages(array_diff($old, $record->imagePaths()));
        });
        static::deleted(fn ($record) => static::deleteUnusedEditorialImages($record->imagePaths()));
    }

    private static function deleteUnusedEditorialImages(array $paths): void
    {
        foreach ($paths as $path) {
            if (! preg_match('~^editorial/[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|webp)$~D', $path)) {
                continue;
            }
            $used = ContentEntry::where(fn ($q) => $q->where('cover_image', $path)->orWhereJsonContains('gallery', $path))->exists() || Testimonial::where('cover_image', $path)->exists();
            if (! $used) {
                Storage::disk('media')->delete($path);
            }
        }
    }
}
