<?php

namespace App\Filament\Resources\Floors\Pages;

use App\Filament\Resources\Floors\FloorResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ManageRecords;

class ManageFloors extends ManageRecords
{
    protected static string $resource = FloorResource::class;

    protected function getHeaderActions(): array
    {
        return [CreateAction::make()->mutateDataUsing(fn (array $data): array => [...$data, 'kind' => FloorResource::kind()])];
    }
}
