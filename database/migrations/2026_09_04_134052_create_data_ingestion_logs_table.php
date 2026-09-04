<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_ingestion_logs', function (Blueprint $table) {
            $table->id();
            $table->string('source', 30); // 'firms' | 'inarisk' | 'iqair'
            $table->enum('status', ['success', 'partial', 'failed']);
            $table->unsignedInteger('records_processed')->default(0);
            $table->text('error_message')->nullable();
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_ingestion_logs');
    }
};