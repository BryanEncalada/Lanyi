<?php

namespace App\Models;

use Filament\Models\Contracts\FilamentUser;
use Filament\Panel;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Validation\ValidationException;

class User extends Authenticatable implements FilamentUser
{
    use HasFactory,Notifiable;

    protected $fillable = ['name', 'email', 'password', 'is_admin', 'is_active'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return ['password' => 'hashed', 'email_verified_at' => 'datetime', 'is_admin' => 'boolean', 'is_active' => 'boolean'];
    }

    public function canAccessPanel(Panel $panel): bool
    {
        return $this->is_admin && $this->is_active;
    }

    protected static function booted(): void
    {
        static::saving(function (self $u) {
            if ($u->exists && $u->getOriginal('is_admin') && $u->getOriginal('is_active') && (! $u->is_admin || ! $u->is_active)) {
                self::ensureAnotherAdmin($u);
            }
        });
        static::deleting(function (self $u) {
            if ($u->is_admin && $u->is_active) {
                self::ensureAnotherAdmin($u);
            }
        });
    }

    private static function ensureAnotherAdmin(self $u): void
    {
        if (! self::whereKeyNot($u->id)->where('is_admin', true)->where('is_active', true)->exists()) {
            throw ValidationException::withMessages(['is_active' => 'Debe quedar al menos un administrador activo.']);
        }
    }
}
