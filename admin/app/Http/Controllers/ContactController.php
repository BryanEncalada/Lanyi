<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['name' => 'required|string|max:150', 'email' => 'required|email:rfc|max:254', 'phone' => 'nullable|string|max:30', 'message' => 'required|string|min:10|max:4000', 'consent' => 'required|accepted', 'website' => 'nullable|string|max:0']);
        Inquiry::create([...array_intersect_key($data, array_flip(['name', 'email', 'phone', 'message'])), 'consent' => true]);

        return response()->json(['message' => 'Recibimos tu consulta. Nuestro equipo se pondrá en contacto contigo.'], 201);
    }
}
