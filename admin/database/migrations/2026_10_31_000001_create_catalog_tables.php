<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $t) {
            $t->boolean('is_admin')->default(false);
            $t->boolean('is_active')->default(true);
        });
        Schema::create('categories', function (Blueprint $t) {
            $t->id();
            $t->string('kind', 20);
            $t->string('name');
            $t->string('slug');
            $t->foreignId('parent_id')->nullable()->constrained('categories')->restrictOnDelete();
            $t->boolean('is_active')->default(true);
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
            $t->unique(['kind', 'slug']);
        });
        Schema::create('products', function (Blueprint $t) {
            $t->id();
            $t->string('kind', 20);
            $t->foreignId('category_id')->constrained()->restrictOnDelete();
            $t->string('slug');
            $t->string('sku')->unique();
            $t->string('name');
            $t->text('description')->nullable();
            $t->string('material')->nullable();
            $t->string('finish')->nullable();
            $t->unsignedSmallInteger('height')->nullable();
            $t->string('spec')->nullable();
            $t->decimal('price', 12, 2)->nullable();
            foreach (['usage', 'colors', 'color_families', 'technical', 'legacy_photo', 'gallery'] as $column) {
                $t->json($column)->nullable();
            }
            $t->string('legacy_source', 20)->nullable();
            $t->string('primary_image')->nullable();
            $t->boolean('is_active')->default(true);
            $t->boolean('is_featured')->default(false);
            $t->unsignedInteger('sort_order')->default(0);
            $t->timestamps();
            $t->softDeletes();
            $t->unique(['kind', 'slug']);
            $t->index(['kind', 'is_active', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('categories');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn(['is_admin', 'is_active']));
    }
};
