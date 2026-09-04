<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

# Schedule::job(new \App\Domains\FireMonitoring\Jobs\IngestFireHotspotsJob)->everySixHours();
# Schedule::job(new \App\Domains\FireMonitoring\Jobs\CalculateRegionPriorityJob)->dailyAt('01:00');