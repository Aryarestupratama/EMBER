<?php

namespace App\Domains\FireMonitoring\Jobs;

use App\Domains\FireMonitoring\Models\DataIngestionLog;
use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Services\FirmsService;
use App\Domains\FireMonitoring\Services\GfwService;
use App\Domains\FireMonitoring\Services\IqairService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class IngestFireHotspotsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param int|null $limit Batasi jumlah hotspot diproses (untuk testing).
     *                        Null = proses semua (mode production).
     */
    public function __construct(protected ?int $limit = null)
    {
    }

    public function handle(
        FirmsService $firms,
        GfwService $gfw,
        IqairService $iqair
    ): void {
        $this->ingestFirms($firms, $gfw, $iqair);
    }

    protected function ingestFirms(FirmsService $firms, GfwService $gfw, IqairService $iqair): void
    {
        $log = DataIngestionLog::create([
            'source'     => 'firms',
            'status'     => 'success',
            'started_at' => now(),
        ]);

        $processed = 0;

        try {
            $hotspots = $firms->fetchIndonesiaHotspots(1);

            if (empty($hotspots)) {
                $log->update([
                    'status'        => 'failed',
                    'error_message' => 'FIRMS API returned no data',
                    'finished_at'   => now(),
                ]);
                Log::warning('IngestFireHotspotsJob: FIRMS returned empty, job stopped');
                return;
            }

            if ($this->limit) {
                $hotspots = array_slice($hotspots, 0, $this->limit);
            }

            $hasFailures = false;

            foreach ($hotspots as $row) {
                try {
                    $lat = (float) $row['latitude'];
                    $lon = (float) $row['longitude'];

                    $risk = $gfw->getRiskScore($lat, $lon);

                    if (is_null($risk['risk_score'])) {
                        $hasFailures = true;
                    }

                    $hotspotData = [
                        'latitude'          => $lat,
                        'longitude'         => $lon,
                        'brightness'        => $row['brightness'] ?? null,
                        'scan'              => $row['scan'] ?? null,
                        'track'             => $row['track'] ?? null,
                        'acq_date'          => $row['acq_date'],
                        'acq_time'          => $row['acq_time'],
                        'satellite'         => $row['satellite'] ?? null,
                        'instrument'        => $row['instrument'] ?? null,
                        'confidence'        => (int) $row['confidence'],
                        'version'           => $row['version'] ?? null,
                        'bright_t31'        => $row['bright_t31'] ?? null,
                        'frp'               => $row['frp'],
                        'daynight'          => $row['daynight'],
                        'gfw_risk_score'    => $risk['risk_score'],
                        'gfw_risk_category' => $risk['risk_category'],
                        'fetched_at'        => now(),
                    ];

                    if (in_array($risk['risk_category'], ['tinggi', 'sangat_tinggi'])) {
                        $aqi = $iqair->nearestCity($lat, $lon);

                        if ($aqi) {
                            $hotspotData['nearest_city_aqi']   = $aqi['aqi'];
                            $hotspotData['nearest_city_name']  = $aqi['city'];
                            $hotspotData['nearest_city_state'] = $aqi['state'];
                        } else {
                            $hasFailures = true;
                        }
                    }

                    FireHotspot::updateOrCreate(
                        [
                            'latitude'  => $hotspotData['latitude'],
                            'longitude' => $hotspotData['longitude'],
                            'acq_date'  => $hotspotData['acq_date'],
                            'acq_time'  => $hotspotData['acq_time'],
                        ],
                        $hotspotData
                    );

                    $processed++;

                    echo "Processed: {$lat}, {$lon} -> {$risk['risk_category']} ({$risk['risk_score']})\n";
                } catch (\Throwable $e) {
                    Log::error('IngestFireHotspotsJob: gagal proses 1 hotspot', [
                        'message' => $e->getMessage(),
                        'row'     => $row,
                    ]);
                    $hasFailures = true;
                }
            }

            $log->update([
                'status'            => $hasFailures ? 'partial' : 'success',
                'records_processed' => $processed,
                'finished_at'       => now(),
            ]);

            Log::info('IngestFireHotspotsJob selesai', [
                'processed' => $processed,
                'partial'   => $hasFailures,
            ]);
        } catch (\Throwable $e) {
            $log->update([
                'status'            => 'failed',
                'records_processed' => $processed,
                'error_message'     => $e->getMessage(),
                'finished_at'       => now(),
            ]);

            Log::error('IngestFireHotspotsJob gagal total', ['message' => $e->getMessage()]);
        }
    }
}