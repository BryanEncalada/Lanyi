<?php

namespace Tests\Feature;

use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_root_redirects_to_protected_panel(): void
    {
        $this->get('/')->assertRedirect('/admin');
    }
}
