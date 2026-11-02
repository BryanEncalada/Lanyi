<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

class CreateAdministrator extends Command
{
    protected $signature = 'admin:create';

    protected $description = 'Crear un administrador sin contraseñas predeterminadas';

    public function handle(): int
    {
        $data = ['name' => $this->ask('Nombre'), 'email' => $this->ask('Correo'), 'password' => $this->secret('Contraseña (mínimo 12 caracteres)')];
        $validator = Validator::make($data, ['name' => 'required|string|max:255', 'email' => 'required|email|max:255|unique:users,email', 'password' => 'required|string|min:12|max:128']);
        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }
        if ($data['password'] !== $this->secret('Repite la contraseña')) {
            $this->error('Las contraseñas no coinciden.');

            return self::FAILURE;
        }
        User::create([...$data, 'is_admin' => true, 'is_active' => true]);
        $this->info('Administrador creado.');

        return self::SUCCESS;
    }
}
