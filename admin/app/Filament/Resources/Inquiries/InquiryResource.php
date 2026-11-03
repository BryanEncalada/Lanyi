<?php

namespace App\Filament\Resources\Inquiries;

use App\Filament\Resources\Inquiries\Pages\ManageInquiries;
use App\Models\Inquiry;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class InquiryResource extends Resource
{
    protected static ?string $model = Inquiry::class;

    protected static ?string $modelLabel = 'consulta';

    protected static ?string $pluralModelLabel = 'Consultas de contacto';

    protected static ?int $navigationSort = 8;

    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-envelope';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema->components([TextInput::make('name')->label('Nombre')->disabled(), TextInput::make('email')->label('Correo')->disabled(), TextInput::make('phone')->label('Teléfono')->disabled(), Textarea::make('message')->label('Mensaje')->rows(8)->disabled(), Toggle::make('handled')->label('Atendida')]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('created_at')->label('Fecha')->dateTime('d/m/Y H:i')->timezone('America/Lima')->sortable(), TextColumn::make('name')->label('Nombre')->searchable(), TextColumn::make('email')->label('Correo')->searchable(), IconColumn::make('handled')->label('Atendida')->boolean()])->defaultSort('created_at', 'desc')->filters([TernaryFilter::make('handled')->label('Atendida')])->recordActions([EditAction::make()->label('Ver / atender'), DeleteAction::make()]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageInquiries::route('/')];
    }
}
