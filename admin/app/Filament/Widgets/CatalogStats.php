<?php

namespace App\Filament\Widgets;

use App\Models\Product;
use App\Models\User;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class CatalogStats extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Pisos publicados', Product::published()->where('kind', 'pisos')->count())->description('Gestiona los productos del catálogo')->color('primary'),
            Stat::make('Accesorios publicados', Product::published()->where('kind', 'accesorios')->count()),
            Stat::make('Administradores activos', User::where('is_active', true)->where('is_admin', true)->count()),
        ];
    }
}
