<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150); // e.g. "Kabupaten Musi Banyuasin"
            $table->string('province', 100);
            $table->string('slug', 180)->unique();
            $table->decimal('centroid_lat', 9, 5);
            $table->decimal('centroid_lon', 9, 5);
            $table->decimal('area_km2', 12, 2)->nullable();
            $table->timestamps();

            $table->index('province');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};