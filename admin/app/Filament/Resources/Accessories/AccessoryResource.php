<?php

namespace App\Filament\Resources\Accessories;

use App\Filament\Resources\Accessories\Pages\ManageAccessories;
use App\Filament\Resources\CatalogProductResource;

class AccessoryResource extends CatalogProductResource
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-cube';

    protected static ?string $navigationLabel = 'Accesorios';

    protected static ?string $modelLabel = 'accesorio';

    protected static ?string $pluralModelLabel = 'Accesorios';

    protected static ?int $navigationSort = 2;

    public static function kind(): string
    {
        return 'accesorios';
    }

    public static function getPages(): array
    {
        return ['index' => ManageAccessories::route('/')];
    }
}
