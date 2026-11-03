<?php

namespace App\Filament\Resources\Articles;

use App\Filament\Resources\Articles\Pages\ManageArticles;
use App\Filament\Resources\EditorialResource;

class ArticleResource extends EditorialResource
{
    protected static ?string $modelLabel = 'artículo';

    protected static ?string $pluralModelLabel = 'Blog';

    protected static ?string $navigationLabel = 'Blog';

    protected static ?int $navigationSort = 5;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-newspaper';

    public static function kind(): string
    {
        return 'blog';
    }

    public static function getPages(): array
    {
        return ['index' => ManageArticles::route('/')];
    }
}
