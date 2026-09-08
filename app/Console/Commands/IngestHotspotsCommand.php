<?php

namespace App\Console\Commands;

use App\Domains\FireMonitoring\Jobs\IngestFireHotspotsJob;
use Illuminate\Console\Command;

class IngestHotspotsCommand extends Command
{
    protected $signature = 'ember:ingest-hotspots {--limit= : Batasi jumlah hotspot diproses (untuk testing)}';

    protected $description = 'Ingest hotspot dari NASA FIRMS, enrich dengan GFW risk score & IQAir AQI';

    public function handle(): int
    {
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        $this->info('Menjalankan IngestFireHotspotsJob...');

        (new IngestFireHotspotsJob($limit))->handle(
            app(\App\Domains\FireMonitoring\Services\FirmsService::class),
            app(\App\Domains\FireMonitoring\Services\GfwService::class),
            app(\App\Domains\FireMonitoring\Services\IqairService::class),
        );

        $this->info('Selesai.');
        return self::SUCCESS;
    }
}