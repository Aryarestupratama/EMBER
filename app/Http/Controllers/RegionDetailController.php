<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Models\Region;
use App\Domains\FireMonitoring\Services\MitigationHelper;
use Inertia\Inertia;

class RegionDetailController extends Controller
{
    public function show(Region $region)
    {
        $latestScore = $region->latestPriorityScore();

        $hotspots = FireHotspot::where('region_id', $region->id)
            ->where('acq_date', '>=', now()->subDays(7))
            ->orderByDesc('acq_date')
            ->get();

        // Level wilayah pakai priority_rank_category (bukan gfw_risk_category
        // per titik hotspot), sama-sama pakai skala rendah/sedang/tinggi/
        // sangat_tinggi/na sehingga MitigationHelper bisa dipakai langsung
        // (Rules.md §3). Jika belum ada skor sama sekali (belum dihitung
        // hari itu), diperlakukan sebagai 'na' — bukan default 'rendah'.
        $mitigation = MitigationHelper::forLocation(
            $latestScore?->priority_rank_category ?? 'na',
            $latestScore?->avg_aqi ?? null
        );

        return Inertia::render('RegionDetail', [
            'region'     => $region,
            'score'      => $latestScore,
            'hotspots'   => $hotspots,
            'mitigation' => $mitigation,
        ]);
    }
}