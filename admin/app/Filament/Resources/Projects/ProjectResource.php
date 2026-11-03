<?php

namespace App\Filament\Resources\Projects;

use App\Filament\Resources\EditorialResource;
use App\Filament\Resources\Projects\Pages\ManageProjects;

class ProjectResource extends EditorialResource
{
    protected static ?string $modelLabel = 'proyecto';

    protected static ?string $pluralModelLabel = 'Proyectos';

    protected static ?string $navigationLabel = 'Proyectos';

    protected static ?int $navigationSort = 6;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-photo';

    public static function kind(): string
    {
        return 'proyectos';
    }

    public static function getPages(): array
    {
        return ['index' => ManageProjects::route('/')];
    }
}
