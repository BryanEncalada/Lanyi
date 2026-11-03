<?php

namespace App\Models;

use App\Models\Concerns\HasEditorialImages;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasEditorialImages;

    protected $guarded = ['id'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'consent_confirmed' => 'boolean', 'sort_order' => 'integer'];
    }
}
