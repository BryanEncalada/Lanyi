<?php

namespace App\Filament\Resources\Users;

use App\Filament\Resources\Users\Pages\ManageUsers;
use App\Models\User;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class UserResource extends Resource
{
    protected static string|\BackedEnum|null $navigationIcon = 'heroicon-o-users';

    protected static ?string $model = User::class;

    protected static ?string $navigationLabel = 'Administradores';

    protected static ?string $modelLabel = 'administrador';

    protected static ?string $pluralModelLabel = 'Administradores';

    protected static ?string $recordTitleAttribute = 'name';

    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->label('Nombre')->required()->maxLength(255),
            TextInput::make('email')->label('Correo')->email()->required()->maxLength(255)->unique(ignoreRecord: true),
            TextInput::make('password')->label('Contraseña')->password()->revealable()->minLength(12)->maxLength(128)->required(fn (string $operation) => $operation === 'create')->dehydrated(fn (?string $state) => filled($state))->helperText('Mínimo 12 caracteres. En edición, déjala vacía para conservarla.'),
            Toggle::make('is_admin')->label('Acceso de administrador')->default(true),
            Toggle::make('is_active')->label('Activo')->default(true),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([TextColumn::make('name')->label('Nombre')->searchable(), TextColumn::make('email')->label('Correo')->searchable(), IconColumn::make('is_admin')->label('Administrador')->boolean(), IconColumn::make('is_active')->label('Activo')->boolean()])->recordActions([EditAction::make(), DeleteAction::make()->visible(fn (User $record) => $record->id !== auth()->id())]);
    }

    public static function getPages(): array
    {
        return ['index' => ManageUsers::route('/')];
    }
}
