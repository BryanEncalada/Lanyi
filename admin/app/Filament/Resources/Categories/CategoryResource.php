<?php

namespace App\Filament\Resources\Categories;

use App\Filament\Resources\Categories\Pages\ManageCategories;
use App\Models\Category;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Validation\Rules\Unique;

class CategoryResource extends Resource
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-tag';

    protected static ?string $model = Category::class;

    protected static ?string $navigationLabel = 'Categorías';

    protected static ?string $modelLabel = 'categoría';

    protected static ?string $pluralModelLabel = 'Categorías';

    protected static ?string $recordTitleAttribute = 'name';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            Select::make('kind')->label('Tipo')->options(['pisos' => 'Pisos', 'accesorios' => 'Accesorios'])->required()->live(),
            TextInput::make('name')->label('Nombre')->required()->maxLength(255),
            TextInput::make('slug')->label('Identificador')->required()->regex('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')->maxLength(180)->unique(ignoreRecord: true, modifyRuleUsing: fn (Unique $rule, Get $get) => $rule->where('kind', $get('kind'))),
            Select::make('parent_id')->label('Categoría padre (opcional)')->options(fn (Get $get, ?Category $record) => Category::where('kind', $get('kind'))->when($record, fn ($q) => $q->whereKeyNot($record->id))->pluck('name', 'id'))->searchable(),
            Toggle::make('is_active')->label('Publicada')->default(true),
            TextInput::make('sort_order')->label('Orden')->integer()->minValue(0)->default(0)->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->label('Nombre')->searchable(), TextColumn::make('kind')->label('Tipo'), TextColumn::make('parent.name')->label('Padre'), IconColumn::make('is_active')->label('Publicada')->boolean()])->recordActions([EditAction::make(), DeleteAction::make()->visible(fn (Category $record) => ! $record->products()->withTrashed()->exists() && ! $record->children()->exists())]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageCategories::route('/')];
    }
}
