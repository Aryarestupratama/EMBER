<?php

use App\Domains\FireMonitoring\Jobs\CalculateRegionPriorityJob;
use App\Domains\FireMonitoring\Jobs\IngestFireHotspotsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::job(new IngestFireHotspotsJob)->everySixHours();
Schedule::job(new CalculateRegionPriorityJob)->dailyAt('01:00');