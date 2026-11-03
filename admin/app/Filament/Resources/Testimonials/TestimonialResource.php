<?php

namespace App\Filament\Resources\Testimonials;

use App\Filament\Resources\EditorialResource;
use App\Filament\Resources\Testimonials\Pages\ManageTestimonials;
use App\Models\Testimonial;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TestimonialResource extends Resource
{
    protected static ?string $model = Testimonial::class;

    protected static ?string $modelLabel = 'testimonio';

    protected static ?string $pluralModelLabel = 'Testimonios';

    protected static ?int $navigationSort = 7;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->label('Nombre del cliente')->required()->maxLength(150),
            TextInput::make('location')->label('Distrito / ubicación')->maxLength(255),
            Textarea::make('quote')->label('Testimonio real')->required()->maxLength(3000)->rows(5),
            EditorialResource::image('cover_image')->label('Fotografía (opcional)'),
            Toggle::make('consent_confirmed')->label('Confirmo que el testimonio es real y tenemos autorización para publicarlo')->default(false),
            Toggle::make('is_active')->label('Publicado')->default(false),
            TextInput::make('sort_order')->label('Orden')->integer()->minValue(0)->default(0)->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->label('Cliente')->searchable(), TextColumn::make('location')->label('Ubicación'), IconColumn::make('is_active')->label('Publicado')->boolean(), IconColumn::make('consent_confirmed')->label('Autorización')->boolean()])->defaultSort('sort_order')->recordActions([EditAction::make(), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageTestimonials::route('/')];
    }
}
