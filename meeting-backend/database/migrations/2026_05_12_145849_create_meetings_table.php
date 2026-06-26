<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('meetings', function (Blueprint $table) {
            $table->id();
            $table->string('title'); // Toplantı başlığı
            $table->text('description')->nullable(); // Açıklama (isteğe bağlı)
            $table->dateTime('start_time'); // Başlangıç zamanı
            $table->dateTime('end_time'); // Bitiş zamanı
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // Toplantıyı oluşturan kullanıcı (user silinirse toplantıları da silinir)
            $table->timestamps(); // Oluşturulma ve güncellenme tarihleri
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('meetings');
    }
};
