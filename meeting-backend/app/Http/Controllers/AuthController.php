<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Kuralları Tanımla
        $rules = [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
        ];

        // 2. Türkçe Hata Mesajlarını Tanımla
        $messages = [
            'name.required' => 'İsim alanı boş bırakılamaz.',
            'email.required' => 'E-posta adresi gereklidir.',
            'email.email' => 'Lütfen geçerli bir e-posta adresi giriniz.',
            'email.unique' => 'Bu e-posta adresi zaten başka bir kullanıcı tarafından alınmış.',
            'password.required' => 'Şifre alanı boş bırakılamaz.',
            'password.min' => 'Şifre güvenliğiniz için en az 8 karakter olmalıdır.',
        ];

        // Doğrulamayı Başlat
        $request->validate($rules, $messages);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'Kaydınız başarıyla tamamlandı!'], 201);
    }

    public function login(Request $request)
    {
        // Giriş yaparken de boş bırakılan alanları yakalayan kısım
        $rules = [
            'email' => 'required|email',
            'password' => 'required'
        ];

        $messages = [
            'email.required' => 'Giriş yapmak için e-posta adresinizi yazmalısınız.',
            'email.email' => 'Lütfen geçerli bir e-posta biçimi kullanın.',
            'password.required' => 'Şifrenizi girmeyi unuttunuz.',
        ];

        $request->validate($rules, $messages);

        $user = User::where('email', $request->email)->first();

        // Şifre veya E-posta yanlışsa
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'E-posta adresi veya şifre hatalı!'], 401);
        }

        return response()->json([
            'access_token' => $user->createToken('auth_token')->plainTextToken,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }
}