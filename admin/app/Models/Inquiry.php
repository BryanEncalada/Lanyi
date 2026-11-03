<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = ['name', 'email', 'phone', 'message', 'consent', 'handled'];

    protected function casts(): array
    {
        return ['consent' => 'boolean', 'handled' => 'boolean'];
    }
}
