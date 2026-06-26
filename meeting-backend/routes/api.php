<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MeetingController;
use App\Http\Controllers\AuthController;
use App\Models\User;


// Public Rotalar :

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);


// Protected Rotalar - Sadece Giriş Yapanlar :


Route::middleware('auth:sanctum')->group(function () {
    
    // Mevcut kullanıcı bilgisi
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Toplantı Yönetimi (CRUD)
    Route::get('/meetings', [MeetingController::class, 'index']);      // Listeleme
    Route::post('/meetings', [MeetingController::class, 'store']);     // Ekleme
    Route::get('/meetings/{id}', [MeetingController::class, 'show']);  // Detay Görüntüleme 
    Route::put('/meetings/{id}', [MeetingController::class, 'update']); // Güncelleme
    Route::delete('/meetings/{id}', [MeetingController::class, 'destroy']); // Silme

    // Katılımcı Seçimi İçin Kullanıcı Listesi
    Route::get('/users', function () {
        // Güvenlik için sadece gerekli alanları dönen kısım
        return User::select('id', 'name', 'email')->get();
    });
    
});