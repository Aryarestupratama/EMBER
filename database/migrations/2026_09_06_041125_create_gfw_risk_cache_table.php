<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gfw_risk_cache', function (Blueprint $table) {
            $table->id();
            $table->decimal('lat_rounded', 7, 3);
            $table->decimal('lon_rounded', 7, 3);

            $table->string('geostore_id', 100)->nullable();
            $table->decimal('buffer_area_ha', 12, 2)->nullable();
            $table->decimal('loss_area_ha', 12, 2)->nullable();
            $table->decimal('loss_percentage', 6, 2)->nullable();
            $table->decimal('risk_score', 6, 5)->nullable();
            $table->enum('risk_category', [
                'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na'
            ])->default('na');

            $table->timestamp('cached_at');
            $table->timestamps();

            $table->unique(['lat_rounded', 'lon_rounded']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gfw_risk_cache');
    }
};