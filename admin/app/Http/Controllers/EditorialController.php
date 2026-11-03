<?php

namespace App\Http\Controllers;

use App\Models\ContentEntry;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class EditorialController extends Controller
{
    public function index(string $kind): JsonResponse
    {
        return response()->json(['data' => ContentEntry::published()->where('kind', $kind)->orderBy('sort_order')->orderByDesc('published_at')->get()->map(fn ($entry) => $this->serialize($entry))]);
    }

    public function show(string $kind, string $slug): JsonResponse
    {
        return response()->json(['data' => $this->serialize(ContentEntry::published()->where('kind', $kind)->where('slug', $slug)->firstOrFail())]);
    }

    public function testimonials(): JsonResponse
    {
        return response()->json(['data' => Testimonial::where('is_active', true)->where('consent_confirmed', true)->orderBy('sort_order')->get()->map(fn ($t) => ['id' => $t->id, 'name' => $t->name, 'location' => $t->location, 'quote' => $t->quote, 'imageUrl' => $t->cover_image ? Storage::disk('media')->url($t->cover_image) : null])]);
    }

    private function serialize(ContentEntry $entry): array
    {
        return [
            'slug' => $entry->slug, 'title' => $entry->title, 'description' => $entry->excerpt ?? '', 'body' => $entry->body ?? '', 'category' => $entry->category ?? '', 'material' => $entry->material ?? '', 'location' => $entry->location ?? '',
            'tags' => $entry->tags ?? [], 'photo' => $entry->legacy_photo ?? [],
            'imageUrl' => ($entry->cover_image ?? ($entry->gallery[0] ?? null)) ? Storage::disk('media')->url($entry->cover_image ?? $entry->gallery[0]) : null,
            'gallery' => array_map(fn ($p) => Storage::disk('media')->url($p), $entry->gallery ?? []),
            'date' => $entry->published_at->timezone('America/Lima')->toDateString(), 'featured' => $entry->is_featured, 'seoTitle' => $entry->seo_title, 'seoDescription' => $entry->seo_description,
        ];
    }
}
