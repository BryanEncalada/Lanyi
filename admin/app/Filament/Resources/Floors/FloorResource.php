<?php

namespace App\Filament\Resources\Floors;

use App\Filament\Resources\CatalogProductResource;
use App\Filament\Resources\Floors\Pages\ManageFloors;

class FloorResource extends CatalogProductResource
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-squares-2x2';

    protected static ?string $navigationLabel = 'Pisos';

    protected static ?string $modelLabel = 'piso';

    protected static ?string $pluralModelLabel = 'Pisos';

    protected static ?int $navigationSort = 1;

    public static function kind(): string
    {
        return 'pisos';
    }

    public static function getPages(): array
    {
        return ['index' => ManageFloors::route('/')];
    }
}
