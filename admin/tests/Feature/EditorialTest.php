<?php

namespace Tests\Feature;

use App\Filament\Resources\Articles\Pages\ManageArticles;
use App\Filament\Resources\Inquiries\Pages\ManageInquiries;
use App\Filament\Resources\Projects\Pages\ManageProjects;
use App\Filament\Resources\Testimonials\Pages\ManageTestimonials;
use App\Models\ContentEntry;
use App\Models\Inquiry;
use App\Models\Testimonial;
use App\Models\User;
use Database\Seeders\EditorialDraftSeeder;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class EditorialTest extends TestCase
{
    use RefreshDatabase;

    private function administrator(): void
    {
        $this->actingAs(User::create(['name' => 'Editor', 'email' => 'editor@example.test', 'password' => 'clave-segura-123', 'is_admin' => true, 'is_active' => true]));
        Filament::setCurrentPanel(Filament::getPanel('admin'));
    }

    private function article(array $overrides = []): ContentEntry
    {
        return ContentEntry::create([...['kind' => 'blog', 'slug' => 'articulo', 'title' => 'Título completo', 'excerpt' => 'Resumen', 'body' => "## Encabezado\n\nContenido completo del artículo.", 'is_active' => true, 'published_at' => now(), 'category' => 'Consejos', 'sort_order' => 0], ...$overrides]);
    }

    public function test_api_only_publishes_active_content_at_its_publication_date(): void
    {
        $p = $this->article();
        $this->article(['slug' => 'borrador', 'is_active' => false]);
        $this->article(['slug' => 'futuro', 'published_at' => now()->addDay()]);
        $this->getJson('/api/contenido/blog')->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.body', "## Encabezado\n\nContenido completo del artículo.");
        $this->getJson('/api/contenido/proyectos/articulo')->assertNotFound();
        $this->getJson('/api/contenido/blog/futuro')->assertNotFound();
        $p->delete();
        $this->getJson('/api/contenido/blog/articulo')->assertNotFound();
    }

    public function test_same_slug_can_be_used_in_article_and_project(): void
    {
        $this->article();
        $this->article(['kind' => 'proyectos', 'material' => 'Bambú', 'location' => 'Lima']);
        $this->getJson('/api/contenido/proyectos/articulo')->assertOk()->assertJsonPath('data.material', 'Bambú');
    }

    public function test_native_article_form_edits_full_content_and_uploads_gallery(): void
    {
        Storage::fake('media');
        $this->administrator();
        Livewire::test(ManageArticles::class)->callAction(CreateAction::class, data: ['title' => 'Guía', 'slug' => 'guia', 'excerpt' => 'Resumen real', 'body' => "## Guía\n\nTexto largo", 'category' => 'Consejos', 'tags' => ['Madera'], 'is_active' => true, 'published_at' => now()->timezone('America/Lima')->format('Y-m-d H:i:s'), 'sort_order' => 0, 'cover_image' => [UploadedFile::fake()->image('portada.jpg')], 'gallery' => [UploadedFile::fake()->image('detalle.png')]])->assertHasNoActionErrors();
        $entry = ContentEntry::firstOrFail();
        $this->assertSame('blog', $entry->kind);
        Storage::disk('media')->assertExists($entry->cover_image);
        $this->getJson('/api/contenido/blog/guia')->assertJsonCount(1, 'data.gallery');
        Livewire::test(ManageArticles::class)->callTableAction(EditAction::class, $entry, data: ['body' => 'Texto actualizado'])->assertHasNoTableActionErrors();
        $this->assertSame('Texto actualizado', $entry->fresh()->body);
        $cover = $entry->cover_image;
        Livewire::test(ManageArticles::class)->callTableAction(DeleteAction::class, $entry)->assertHasNoTableActionErrors();
        $this->assertSoftDeleted($entry);
        Storage::disk('media')->assertMissing($cover);
    }

    public function test_projects_have_separate_native_maintenance(): void
    {
        $this->administrator();
        Livewire::test(ManageProjects::class)->callAction(CreateAction::class, data: ['title' => 'Proyecto real', 'slug' => 'proyecto-real', 'excerpt' => 'Descripción del espacio', 'body' => 'Historia completa del proyecto', 'material' => 'Madera', 'location' => 'Breña', 'published_at' => now()->timezone('America/Lima')->format('Y-m-d H:i:s'), 'is_active' => true, 'sort_order' => 0])->assertHasNoActionErrors();
        $this->getJson('/api/contenido/proyectos')->assertJsonCount(1, 'data');
        $this->getJson('/api/contenido/blog')->assertJsonCount(0, 'data');
    }

    public function test_testimonials_require_publication_and_permission(): void
    {
        $this->administrator();
        Livewire::test(ManageTestimonials::class)->callAction(CreateAction::class, data: ['name' => 'Cliente', 'quote' => 'Muy buena atención', 'location' => 'Lima', 'is_active' => true, 'consent_confirmed' => false, 'sort_order' => 0])->assertHasNoActionErrors();
        $this->getJson('/api/testimonios')->assertJsonCount(0, 'data');
        Testimonial::firstOrFail()->update(['consent_confirmed' => true]);
        $this->getJson('/api/testimonios')->assertJsonCount(1, 'data')->assertJsonPath('data.0.name', 'Cliente');
    }

    public function test_contact_records_consultation_without_accepting_handled_flag(): void
    {
        $payload = ['name' => 'Cliente', 'email' => 'cliente@example.test', 'phone' => '999999999', 'message' => 'Quisiera cotizar un piso para mi sala.', 'consent' => true, 'handled' => true];
        $this->postJson('/api/contacto', $payload)->assertCreated()->assertJsonMissingPath('data');
        $this->assertDatabaseHas('inquiries', ['email' => 'cliente@example.test', 'handled' => false, 'consent' => true]);
        $this->getJson('/api/contacto')->assertStatus(405);
    }

    public function test_contact_requires_consent_valid_email_and_rejects_honeypot(): void
    {
        $this->postJson('/api/contacto', ['name' => 'Cliente', 'email' => 'mal', 'message' => 'corto'])->assertUnprocessable()->assertJsonValidationErrors(['email', 'message', 'consent']);
        $this->postJson('/api/contacto', ['name' => 'Bot', 'email' => 'bot@example.test', 'message' => 'Mensaje automático', 'consent' => true, 'website' => 'https://spam.test'])->assertUnprocessable()->assertJsonValidationErrors('website');
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_only_administrators_can_read_and_handle_inquiries(): void
    {
        $this->get('/admin/inquiries')->assertRedirect('/admin/login');
        $this->administrator();
        $inquiry = Inquiry::create(['name' => 'Cliente', 'email' => 'a@example.test', 'message' => 'Consulta privada', 'consent' => true]);
        Livewire::test(ManageInquiries::class)->callTableAction(EditAction::class, $inquiry, data: ['handled' => true])->assertHasNoTableActionErrors();
        $this->assertTrue($inquiry->fresh()->handled);
    }

    public function test_sitemap_uses_configured_frontend_and_excludes_drafts(): void
    {
        config(['catalog.frontend_url' => 'https://test.example']);
        $this->article();
        $this->article(['slug' => 'oculto', 'is_active' => false]);
        $this->get('/api/sitemap.xml')->assertOk()->assertHeader('Content-Type', 'application/xml; charset=UTF-8')->assertSee('https://test.example/blog/articulo', false)->assertDontSee('/blog/oculto', false);
    }

    public function test_seed_imports_existing_content_as_non_destructive_drafts(): void
    {
        $this->seed(EditorialDraftSeeder::class);
        $this->assertDatabaseCount('content_entries', 11);
        $p = ContentEntry::firstOrFail();
        $p->update(['title' => 'Editado']);
        $this->seed(EditorialDraftSeeder::class);
        $this->assertSame('Editado', $p->fresh()->title);
        $this->getJson('/api/contenido/blog')->assertJsonCount(0, 'data');
        $this->assertDatabaseCount('testimonials', 0);
    }
}
