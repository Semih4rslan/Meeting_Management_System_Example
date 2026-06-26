<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Meeting extends Model
{
    use HasFactory;

    protected $fillable = ['title', 'description', 'start_time', 'end_time', 'user_id'];

    // Bir toplantının birden fazla katılımcısı (user) olabilir
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}