<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('area_check_cache', function (Blueprint $table) {
            $table->id();
            $table->decimal('lat_rounded', 7, 3); // dibulatkan ~100m presisi
            $table->decimal('lon_rounded', 7, 3);

            $table->decimal('bnpb_risk_score', 8, 6)->nullable();
            $table->enum('bnpb_risk_category', [
                'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na'
            ])->default('na');

            $table->unsignedInteger('aqi')->nullable();
            $table->string('nearest_city_name', 100)->nullable();

            $table->timestamp('cached_at');
            $table->timestamps();

            $table->unique(['lat_rounded', 'lon_rounded']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('area_check_cache');
    }
};