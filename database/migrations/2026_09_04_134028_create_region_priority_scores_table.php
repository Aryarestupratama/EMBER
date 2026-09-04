<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('region_priority_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('region_id')->constrained()->cascadeOnDelete();
            $table->date('score_date');

            $table->decimal('avg_bnpb_risk_score', 8, 6)->nullable();
            $table->unsignedInteger('hotspot_count')->default(0);
            $table->decimal('normalized_hotspot_frequency', 6, 5)->default(0);
            $table->unsignedInteger('avg_aqi')->nullable();
            $table->decimal('normalized_aqi_impact', 6, 5)->nullable();

            $table->decimal('priority_score', 6, 5); // hasil akhir formula
            $table->enum('priority_rank_category', [
                'rendah', 'sedang', 'tinggi', 'sangat_tinggi'
            ]);

            $table->timestamps();

            $table->unique(['region_id', 'score_date']);
            $table->index('priority_score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('region_priority_scores');
    }
};