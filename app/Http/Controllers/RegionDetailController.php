<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Models\Region;
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

        return Inertia::render('RegionDetail', [
            'region'    => $region,
            'score'     => $latestScore,
            'hotspots'  => $hotspots,
        ]);
    }
}