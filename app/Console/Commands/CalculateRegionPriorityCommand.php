<?php

namespace App\Console\Commands;

use App\Domains\FireMonitoring\Jobs\CalculateRegionPriorityJob;
use Illuminate\Console\Command;

class CalculateRegionPriorityCommand extends Command
{
    protected $signature = 'ember:calculate-priority';

    protected $description = 'Hitung ulang Priority Score harian tiap wilayah';

    public function handle(): int
    {
        $this->info('Menjalankan CalculateRegionPriorityJob...');

        (new CalculateRegionPriorityJob())->handle(
            app(\App\Domains\FireMonitoring\Services\GfwService::class),
        );

        $this->info('Selesai.');
        return self::SUCCESS;
    }
}