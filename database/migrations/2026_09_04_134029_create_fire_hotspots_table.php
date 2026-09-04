<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fire_hotspots', function (Blueprint $table) {
            $table->id();

            // Dari NASA FIRMS
            $table->decimal('latitude', 9, 5);
            $table->decimal('longitude', 9, 5);
            $table->decimal('brightness', 8, 2)->nullable();
            $table->decimal('scan', 4, 2)->nullable();
            $table->decimal('track', 4, 2)->nullable();
            $table->date('acq_date');
            $table->string('acq_time', 4); // format HHMM
            $table->string('satellite', 20)->nullable();
            $table->string('instrument', 20)->nullable();
            $table->unsignedTinyInteger('confidence'); // 0-100
            $table->string('version', 20)->nullable();
            $table->decimal('bright_t31', 8, 2)->nullable();
            $table->decimal('frp', 8, 2); // Fire Radiative Power
            $table->enum('daynight', ['D', 'N']);

            // Dari BNPB InaRISK
            $table->decimal('bnpb_risk_score', 8, 6)->nullable(); // null = NoData
            $table->enum('bnpb_risk_category', [
                'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na'
            ])->default('na');

            // Dari IQAir (diisi untuk hotspot kategori tinggi/sangat_tinggi)
            $table->unsignedInteger('nearest_city_aqi')->nullable();
            $table->string('nearest_city_name', 100)->nullable();
            $table->string('nearest_city_state', 100)->nullable();

            // Referensi wilayah administratif
            $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();

            $table->timestamp('fetched_at')->useCurrent();
            $table->timestamps();

            $table->index(['acq_date', 'confidence']);
            $table->index(['bnpb_risk_category']);
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fire_hotspots');
    }
};