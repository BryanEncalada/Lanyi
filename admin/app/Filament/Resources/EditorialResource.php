<?php

namespace App\Filament\Resources;

use App\Models\ContentEntry;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Validation\Rules\Unique;

abstract class EditorialResource extends Resource
{
    protected static ?string $model = ContentEntry::class;

    protected static ?string $recordTitleAttribute = 'title';

    abstract public static function kind(): string;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('kind', static::kind());
    }

    public static function image(string $name): FileUpload
    {
        return FileUpload::make($name)->disk('media')->directory('editorial')->visibility('public')->image()->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->maxSize(4096)->preventFilePathTampering();
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Contenido')->schema([
                TextInput::make('title')->label('Título')->required()->maxLength(255),
                TextInput::make('slug')->label('Identificador en URL')->required()->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->maxLength(180)->disabled(fn (?ContentEntry $record) => $record !== null)->dehydrated(fn (?ContentEntry $record) => $record === null)->unique(ignoreRecord: true, modifyRuleUsing: fn (Unique $rule) => $rule->where('kind', static::kind())),
                TextInput::make('category')->label('Categoría')->maxLength(255),
                TagsInput::make('tags')->label('Etiquetas'),
                Textarea::make('excerpt')->label('Resumen')->required()->maxLength(1000)->rows(3)->columnSpanFull(),
                Textarea::make('body')->label('Contenido completo')->required()->rows(14)->maxLength(100000)->helperText('Separa los párrafos con una línea vacía. Para subtítulos utiliza ## al inicio de la línea. El contenido se muestra como texto seguro.')->columnSpanFull(),
                TextInput::make('material')->label('Material / tipo de piso')->visible(static::kind() === 'proyectos')->maxLength(255),
                TextInput::make('location')->label('Ubicación')->visible(static::kind() === 'proyectos')->maxLength(255),
            ])->columns(2),
            Section::make('Fotografías')->schema([static::image('cover_image')->label('Portada'), static::image('gallery')->label('Galería')->multiple()->maxFiles(12)->reorderable()->appendFiles()]),
            Section::make('Posicionamiento')->schema([TextInput::make('seo_title')->label('Título para buscadores')->maxLength(100), Textarea::make('seo_description')->label('Descripción para buscadores')->maxLength(300)]),
            Section::make('Publicación')->schema([Toggle::make('is_active')->label('Publicado')->default(false), Toggle::make('is_featured')->label('Destacado')->default(false), DateTimePicker::make('published_at')->label('Fecha de publicación')->timezone('America/Lima')->required()->default(now()), TextInput::make('sort_order')->label('Orden')->integer()->minValue(0)->default(0)->required()])->columns(2),
        ])->columns(1);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([ImageColumn::make('cover_image')->label('Portada')->disk('media'), TextColumn::make('title')->label('Título')->searchable()->sortable(), TextColumn::make('category')->label('Categoría')->searchable(), IconColumn::make('is_active')->label('Publicado')->boolean(), TextColumn::make('published_at')->label('Publicación')->dateTime('d/m/Y H:i')->timezone('America/Lima')->sortable()])->filters([TernaryFilter::make('is_active')->label('Publicado')])->defaultSort('sort_order')->recordActions([EditAction::make(), DeleteAction::make()]);
    }
}
