<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $t) {
            $t->string('seo_title')->nullable();
            $t->text('seo_description')->nullable();
        });
        Schema::create('content_entries', function (Blueprint $t) {
            $t->id();
            $t->string('kind', 20);
            $t->string('slug', 180);
            $t->string('title');
            $t->text('excerpt')->nullable();
            $t->longText('body')->nullable();
            $t->string('category')->nullable();
            $t->string('material')->nullable();
            $t->string('location')->nullable();
            $t->json('tags')->nullable();
            $t->string('cover_image')->nullable();
            $t->json('gallery')->nullable();
            $t->json('legacy_photo')->nullable();
            $t->string('seo_title')->nullable();
            $t->text('seo_description')->nullable();
            $t->boolean('is_active')->default(false);
            $t->boolean('is_featured')->default(false);
            $t->timestamp('published_at')->nullable();
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['kind', 'slug']);
            $t->index(['kind', 'is_active', 'published_at']);
        });
        Schema::create('testimonials', function (Blueprint $t) {
            $t->id();
            $t->string('name', 150);
            $t->string('location')->nullable();
            $t->text('quote');
            $t->string('cover_image')->nullable();
            $t->boolean('consent_confirmed')->default(false);
            $t->boolean('is_active')->default(false);
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
        });
        Schema::create('inquiries', function (Blueprint $t) {
            $t->id();
            $t->string('name', 150);
            $t->string('email', 254);
            $t->string('phone', 30)->nullable();
            $t->text('message');
            $t->boolean('consent');
            $t->boolean('handled')->default(false);
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::table('products', fn (Blueprint $t) => $t->dropColumn(['seo_title', 'seo_description']));
        Schema::dropIfExists('inquiries');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('content_entries');
    }
};
