<?php

namespace App\Policies;

use App\Models\Inquiry;
use App\Models\User;

class InquiryPolicy
{
    public function before(User $user): ?bool
    {
        return $user->is_admin && $user->is_active ? null : false;
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Inquiry $record): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return false;
    }

    public function update(User $user, Inquiry $record): bool
    {
        return true;
    }

    public function delete(User $user, Inquiry $record): bool
    {
        return true;
    }
}
