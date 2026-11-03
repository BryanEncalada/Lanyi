<?php

namespace App\Policies;

use App\Models\Testimonial;
use App\Models\User;

class TestimonialPolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_admin && $user->is_active ? null : false;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Testimonial $record): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, Testimonial $record): bool
    {
        return true;
    }

    public function delete(User $user, Testimonial $record): bool
    {
        return true;
    }
}
