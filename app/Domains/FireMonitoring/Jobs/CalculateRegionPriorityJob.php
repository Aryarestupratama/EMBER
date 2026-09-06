<?php

namespace App\Domains\FireMonitoring\Jobs;

use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Models\Region;
use App\Domains\FireMonitoring\Models\RegionPriorityScore;
use App\Domains\FireMonitoring\Services\GfwService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CalculateRegionPriorityJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(GfwService $gfw): void
    {
        $today = now()->toDateString();
        $sevenDaysAgo = now()->subDays(7)->toDateString();

        $regions = Region::all();

        if ($regions->isEmpty()) {
            Log::warning('CalculateRegionPriorityJob: tidak ada data regions, job dibatalkan');
            return;
        }

        // Hitung dulu jumlah hotspot tertinggi di antara semua wilayah,
        // dipakai sebagai basis normalisasi relatif (Rules.md §3 - Norm_Hotspot_Frequency)
        $hotspotCountsPerRegion = FireHotspot::whereNotNull('region_id')
            ->where('acq_date', '>=', $sevenDaysAgo)
            ->selectRaw('region_id, COUNT(*) as total')
            ->groupBy('region_id')
            ->pluck('total');

        $maxHotspotCount = $hotspotCountsPerRegion->max() ?: 1;

        $aqiScaleMax = config('ember.aqi_scale.max');

        foreach ($regions as $region) {
            $hotspots = FireHotspot::where('region_id', $region->id)
                ->where('acq_date', '>=', $sevenDaysAgo)
                ->get();

            $hotspotCount = $hotspots->count();

            $validRiskScores = $hotspots->pluck('gfw_risk_score')->filter(fn ($s) => ! is_null($s));
            $avgGfwRisk = $validRiskScores->isNotEmpty() ? $validRiskScores->avg() : null;
            $normGfwRisk = $avgGfwRisk ?? 0;

            $normHotspotFrequency = $maxHotspotCount > 0
                ? round($hotspotCount / $maxHotspotCount, 5)
                : 0;

            $validAqi = $hotspots->pluck('nearest_city_aqi')->filter(fn ($a) => ! is_null($a));
            $avgAqi = $validAqi->isNotEmpty() ? round($validAqi->avg()) : null;
            $normAqiImpact = $avgAqi !== null
                ? round(min($avgAqi / $aqiScaleMax, 1), 5)
                : 0;

            $weights = config('ember.priority_score_weights');
            $priorityScore = round(
                ($weights['gfw_risk'] * $normGfwRisk)
                + ($weights['hotspot_frequency'] * $normHotspotFrequency)
                + ($weights['aqi_impact'] * $normAqiImpact),
                5
            );

            $priorityCategory = $gfw->categorizeScore($priorityScore);

            if ($priorityCategory === 'na') {
                $priorityCategory = 'rendah';
            }

            RegionPriorityScore::updateOrCreate(
                ['region_id' => $region->id, 'score_date' => $today],
                [
                    'avg_gfw_risk_score'           => $avgGfwRisk,
                    'hotspot_count'                => $hotspotCount,
                    'normalized_hotspot_frequency' => $normHotspotFrequency,
                    'avg_aqi'                      => $avgAqi,
                    'normalized_aqi_impact'        => $normAqiImpact,
                    'priority_score'               => $priorityScore,
                    'priority_rank_category'       => $priorityCategory,
                ]
            );

            if ($hotspotCount > 0) {
                echo "{$region->name}: hotspot={$hotspotCount}, priority_score={$priorityScore} ({$priorityCategory})\n";
            }
        }

        Log::info('CalculateRegionPriorityJob selesai', ['regions_processed' => $regions->count()]);
    }
}