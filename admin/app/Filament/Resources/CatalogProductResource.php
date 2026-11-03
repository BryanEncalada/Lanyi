<?php

namespace App\Filament\Resources;

use App\Models\Category;
use App\Models\Product;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\KeyValue;
use Filament\Forms\Components\Select;
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

abstract class CatalogProductResource extends Resource
{
    protected static ?string $model = Product::class;

    protected static ?string $recordTitleAttribute = 'name';

    abstract public static function kind(): string;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->where('kind', static::kind());
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Información del producto')->schema([
                TextInput::make('name')->label('Nombre')->required()->maxLength(255),
                TextInput::make('sku')->label('SKU')->required()->maxLength(100)->unique(ignoreRecord: true),
                TextInput::make('slug')->label('Identificador en la URL')->required()->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->maxLength(180)->disabled(fn (?Product $record) => $record !== null)->dehydrated(fn (?Product $record) => $record === null)->unique(ignoreRecord: true, modifyRuleUsing: fn (Unique $rule) => $rule->where('kind', static::kind()))->helperText('Se conserva al editar para no romper enlaces.'),
                Select::make('category_id')->label('Categoría / subcategoría')->options(fn () => Category::where('kind', static::kind())->orderBy('name')->pluck('name', 'id'))->required()->searchable()->preload(),
                Textarea::make('description')->label('Descripción')->rows(4)->maxLength(5000)->columnSpanFull(),
            ])->columns(2),
            Section::make('Características técnicas')->schema([
                TextInput::make('material')->label('Material')->required()->maxLength(255),
                TextInput::make('finish')->label('Acabado')->required()->maxLength(255),
                TextInput::make('height')->label(static::kind() === 'pisos' ? 'Espesor (mm)' : 'Altura (mm)')->numeric()->integer()->minValue(1)->maxValue(10000),
                TextInput::make('spec')->label('Especificación resumida')->maxLength(255),
                TextInput::make('price')->label(static::kind() === 'pisos' ? 'Precio referencial S/ por m²' : 'Precio referencial S/ por metro lineal')->helperText('Este precio se utiliza para calcular el importe estimado del material. No incluye instalación ni transporte.')->numeric()->minValue(0)->maxValue(9999999999.99)->step(0.01),
                TagsInput::make('usage')->label('Usos recomendados')->suggestions(['Hogar', 'Oficina', 'Comercial', 'Alto tránsito']),
                TagsInput::make('colors')->label('Colores (código hexadecimal)')->nestedRecursiveRules(['regex:/^#[0-9a-fA-F]{6}$/']),
                TagsInput::make('color_families')->label('Familias de color')->suggestions(['Blanco', 'Beige', 'Arena', 'Natural', 'Roble', 'Canela', 'Nogal', 'Marrón', 'Gris', 'Negro']),
                KeyValue::make('technical')->label('Otras características')->keyLabel('Característica')->valueLabel('Valor')->columnSpanFull(),
            ])->columns(2),
            Section::make('Imágenes')->description('JPG, PNG o WebP. Máximo 4 MB por imagen. Las fotos originales del catálogo se conservan hasta sustituirlas.')->schema([
                static::upload('primary_image')->label('Imagen principal'),
                static::upload('gallery')->label('Galería')->multiple()->maxFiles(8)->reorderable()->appendFiles(),
            ]),
            Section::make('Posicionamiento')->schema([TextInput::make('seo_title')->label('Título para buscadores')->maxLength(100), Textarea::make('seo_description')->label('Descripción para buscadores')->maxLength(300)]),
            Section::make('Publicación')->schema([
                Toggle::make('is_active')->label('Publicado')->default(true),
                Toggle::make('is_featured')->label('Destacado en Inicio')->default(false)->visible(static::kind() === 'pisos'),
                TextInput::make('sort_order')->label('Orden (menor primero)')->numeric()->integer()->minValue(0)->default(0)->required(),
            ])->columns(3),
        ])->columns(1);
    }

    private static function upload(string $field): FileUpload
    {
        return FileUpload::make($field)->disk('media')->directory('products')->visibility('public')->acceptedFileTypes(['image/jpeg', 'image/png', 'image/webp'])->maxSize(4096)->image()->imagePreviewHeight('180')->preventFilePathTampering();
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            ImageColumn::make('primary_image')->label('Imagen')->disk('media')->square(),
            TextColumn::make('name')->label('Producto')->searchable()->sortable(),
            TextColumn::make('sku')->label('SKU')->searchable(),
            TextColumn::make('category.name')->label('Categoría'),
            TextColumn::make('material')->label('Material')->searchable(),
            IconColumn::make('is_active')->label('Publicado')->boolean(),
            TextColumn::make('sort_order')->label('Orden')->sortable(),
        ])->defaultSort('sort_order')->filters([TernaryFilter::make('is_active')->label('Publicado')])->recordActions([EditAction::make(), DeleteAction::make()])->paginated([10, 25, 50]);
    }
}
