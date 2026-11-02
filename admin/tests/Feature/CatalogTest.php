<?php

namespace Tests\Feature;

use App\Filament\Resources\Accessories\Pages\ManageAccessories;
use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Filament\Resources\Floors\Pages\ManageFloors;
use App\Filament\Resources\Users\Pages\ManageUsers;
use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\CatalogSeeder;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Auth\Pages\Login;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Livewire\Livewire;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    private function loginAdmin(): User
    {
        $u = User::create(['name' => 'Prueba', 'email' => 'admin@example.test', 'password' => 'Contraseña-segura-123', 'is_admin' => true, 'is_active' => true]);
        $this->actingAs($u);
        Filament::setCurrentPanel(Filament::getPanel('admin'));

        return $u;
    }

    private function data(string $kind = 'pisos'): array
    {
        $c = Category::create(['kind' => $kind, 'name' => 'Madera', 'slug' => 'madera']);

        return ['kind' => $kind, 'category_id' => $c->id, 'slug' => 'producto-prueba', 'sku' => 'TEST-001', 'name' => 'Producto prueba', 'description' => 'Descripción', 'material' => 'Madera', 'finish' => 'Natural', 'usage' => ['Hogar'], 'colors' => ['#aabbcc'], 'color_families' => ['Roble'], 'is_active' => true, 'sort_order' => 0];
    }

    public function test_seed_preserves_all_products_and_is_non_destructive(): void
    {
        $this->seed(CatalogSeeder::class);
        $this->assertDatabaseCount('products', 13);
        $p = Product::first();
        $p->update(['name' => 'Editado']);
        $this->seed(CatalogSeeder::class);
        $this->assertSame('Editado', $p->fresh()->name);
        $this->assertDatabaseCount('products', 13);
        $this->getJson('/api/pisos')->assertOk()->assertJsonCount(4, 'data');
        $this->getJson('/api/accesorios')->assertOk()->assertJsonCount(9, 'data');
        $this->getJson('/api/pisos/madera-nogal')->assertOk()->assertJsonPath('data.category', 'pisos');
        $this->getJson('/api/accesorios/madera-nogal')->assertOk()->assertJsonPath('data.category', 'accesorios');
    }

    public function test_api_hides_unpublished_deleted_and_hidden_category_products(): void
    {
        $p = Product::create($this->data());
        $this->getJson('/api/pisos/'.$p->slug)->assertOk()->assertJsonMissingPath('data.password');
        $this->getJson('/api/accesorios/'.$p->slug)->assertNotFound();
        $p->update(['is_active' => false]);
        $this->getJson('/api/pisos')->assertJsonCount(0, 'data');
        $this->getJson('/api/pisos/'.$p->slug)->assertNotFound();
        $p->update(['is_active' => true]);
        $p->category->update(['is_active' => false]);
        $this->getJson('/api/pisos/'.$p->slug)->assertNotFound();
        $p->category->update(['is_active' => true]);
        $p->delete();
        $this->getJson('/api/pisos')->assertJsonCount(0, 'data');
        $this->postJson('/api/pisos', [])->assertStatus(405);
    }

    public function test_hidden_parent_hides_descendants_and_category_endpoint(): void
    {
        $p = Product::create($this->data());
        $parent = Category::create(['kind' => 'pisos', 'name' => 'Padre', 'slug' => 'padre', 'is_active' => false]);
        $p->category->update(['parent_id' => $parent->id]);
        $this->getJson('/api/pisos')->assertJsonCount(0, 'data');
        $this->getJson('/api/categorias')->assertJsonCount(0, 'data');
    }

    public function test_access_is_protected_and_password_is_hashed(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');
        $this->get('/admin/login')->assertOk();
        $u = $this->loginAdmin();
        $this->assertTrue(Hash::check('Contraseña-segura-123', $u->password));
        $this->get('/admin')->assertOk();
        $this->get('/admin/floors')->assertOk();
        $u->is_admin = false; // second admin permits deactivation
        User::create(['name' => 'Segundo', 'email' => 'second@example.test', 'password' => 'otra-contraseña-123', 'is_admin' => true]);
        $u->save();
        $this->get('/admin/floors')->assertForbidden();
    }

    public function test_native_resources_create_edit_and_delete_a_floor(): void
    {
        $this->loginAdmin();
        $data = $this->data();
        unset($data['kind']);
        Livewire::test(ManageFloors::class)->callAction(CreateAction::class, data: $data)->assertHasNoActionErrors();
        $p = Product::where('sku', 'TEST-001')->firstOrFail();
        $this->assertSame('pisos', $p->kind);
        Livewire::test(ManageFloors::class)->callTableAction(EditAction::class, $p, data: ['name' => 'Piso editado', 'is_active' => false])->assertHasNoTableActionErrors();
        $this->assertSame('Piso editado', $p->fresh()->name);
        $this->assertFalse($p->fresh()->is_active);
        Livewire::test(ManageFloors::class)->callTableAction(DeleteAction::class, $p)->assertHasNoTableActionErrors();
        $this->assertSoftDeleted($p);
    }

    public function test_accessory_category_and_user_forms_work(): void
    {
        $this->loginAdmin();
        $data = $this->data('accesorios');
        unset($data['kind']);
        Livewire::test(ManageAccessories::class)->callAction(CreateAction::class, data: $data)->assertHasNoActionErrors();
        $this->assertDatabaseHas('products', ['sku' => 'TEST-001', 'kind' => 'accesorios']);
        Livewire::test(ManageCategories::class)->callAction(CreateAction::class, data: ['kind' => 'pisos', 'name' => 'Bambú', 'slug' => 'bambu', 'sort_order' => 0, 'is_active' => true])->assertHasNoActionErrors();
        Livewire::test(ManageUsers::class)->callAction(CreateAction::class, data: ['name' => 'Nuevo', 'email' => 'nuevo@example.test', 'password' => 'una-contraseña-123', 'is_admin' => true, 'is_active' => true])->assertHasNoActionErrors();
        $this->assertTrue(Hash::check('una-contraseña-123', User::where('email', 'nuevo@example.test')->firstOrFail()->password));
    }

    public function test_image_upload_validation_and_cleanup(): void
    {
        Storage::fake('media');
        $this->loginAdmin();
        $data = $this->data();
        unset($data['kind']);
        $data['primary_image'] = [UploadedFile::fake()->image('foto.jpg', 300, 200)];
        $data['gallery'] = [UploadedFile::fake()->image('galeria.png', 300, 200)];
        Livewire::test(ManageFloors::class)->callAction(CreateAction::class, data: $data)->assertHasNoActionErrors();
        $p = Product::firstOrFail();
        $this->assertNotNull($p->primary_image);
        Storage::disk('media')->assertExists($p->primary_image);
        $old = $p->primary_image;
        $p->update(['primary_image' => null]);
        Storage::disk('media')->assertMissing($old);
        $gallery = $p->gallery;
        $p->delete();
        foreach ($gallery as $path) {
            Storage::disk('media')->assertMissing($path);
        }
    }

    public function test_rejects_cross_category_product(): void
    {
        $data = $this->data('accesorios');
        $data['kind'] = 'pisos';
        $this->expectException(ValidationException::class);
        Product::create($data);
    }

    public function test_cannot_disable_last_admin(): void
    {
        $u = $this->loginAdmin();
        $this->expectException(ValidationException::class);
        $u->update(['is_active' => false]);
    }

    public function test_cors_allows_only_configured_frontend(): void
    {
        $this->getJson('/api/pisos', ['Origin' => 'http://localhost:4200'])->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
        $response = $this->getJson('/api/pisos', ['Origin' => 'https://unknown.example']);
        $this->assertNotSame('https://unknown.example', $response->headers->get('Access-Control-Allow-Origin'));
    }

    public function test_login_and_logout_use_native_filament_authentication(): void
    {
        User::create(['name' => 'Admin', 'email' => 'login@example.test', 'password' => 'clave-segura-123', 'is_admin' => true, 'is_active' => true]);
        Filament::setCurrentPanel(Filament::getPanel('admin'));
        Livewire::test(Login::class)->fillForm(['email' => 'login@example.test', 'password' => 'incorrecta'])->call('authenticate')->assertHasFormErrors(['email']);
        $this->assertGuest();
        Livewire::test(Login::class)->fillForm(['email' => 'login@example.test', 'password' => 'clave-segura-123'])->call('authenticate')->assertHasNoFormErrors();
        $this->assertAuthenticated();
        $this->post('/admin/logout')->assertRedirect();
        $this->assertGuest();
    }

    public function test_image_upload_rejects_executable_and_oversized_files(): void
    {
        Storage::fake('media');
        $this->loginAdmin();
        $data = $this->data();
        unset($data['kind']);
        $data['primary_image'] = [UploadedFile::fake()->create('malicioso.php', 1, 'application/x-httpd-php')];
        Livewire::test(ManageFloors::class)->callAction(CreateAction::class, data: $data)->assertHasActionErrors();
        $this->assertDatabaseCount('products', 0);
        $data['primary_image'] = [UploadedFile::fake()->image('grande.jpg')->size(4097)];
        Livewire::test(ManageFloors::class)->callAction(CreateAction::class, data: $data)->assertHasActionErrors();
        $this->assertDatabaseCount('products', 0);
    }

    public function test_replacement_upload_removes_previous_file_and_validates_paths(): void
    {
        Storage::fake('media');
        $this->loginAdmin();
        $p = Product::create($this->data());
        Storage::disk('media')->put('products/anterior.jpg', 'imagen');
        $p->update(['primary_image' => 'products/anterior.jpg']);
        Livewire::test(ManageFloors::class)->callTableAction(EditAction::class, $p, data: ['primary_image' => [UploadedFile::fake()->image('nueva.webp')]])->assertHasNoTableActionErrors();
        Storage::disk('media')->assertMissing('products/anterior.jpg');
        Storage::disk('media')->assertExists($p->fresh()->primary_image);
        $this->expectException(ValidationException::class);
        $p->fresh()->update(['primary_image' => '../.env']);
    }

    public function test_category_cycles_are_rejected(): void
    {
        $a = Category::create(['kind' => 'pisos', 'name' => 'A', 'slug' => 'a']);
        $b = Category::create(['kind' => 'pisos', 'name' => 'B', 'slug' => 'b', 'parent_id' => $a->id]);
        $this->expectException(ValidationException::class);
        $a->update(['parent_id' => $b->id]);
    }
}
