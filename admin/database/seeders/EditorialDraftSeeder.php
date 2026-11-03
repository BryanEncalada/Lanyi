<?php

namespace Database\Seeders;

use App\Models\ContentEntry;
use Illuminate\Database\Seeder;

class EditorialDraftSeeder extends Seeder
{
    public function run(): void
    {
        foreach (json_decode(file_get_contents(database_path('data/editorial.json')), true, flags: JSON_THROW_ON_ERROR) as $data) {
            if (ContentEntry::withTrashed()->where('kind', $data['kind'])->where('slug', $data['slug'])->exists()) {
                continue;
            }
            ContentEntry::create([...$data, 'is_active' => false, 'published_at' => now()]);
        }
    }
}
