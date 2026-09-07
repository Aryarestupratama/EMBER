<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\DataIngestionLog;
use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Models\RegionPriorityScore;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $hotspots = FireHotspot::whereDate('acq_date', now()->toDateString())
            ->select(['id', 'latitude', 'longitude', 'gfw_risk_category', 'confidence', 'frp'])
            ->get();

        $stats = [
            'total_hotspots'    => $hotspots->count(),
            'high_risk_regions' => RegionPriorityScore::whereDate('score_date', now()->toDateString())
                ->whereIn('priority_rank_category', ['tinggi', 'sangat_tinggi'])
                ->count(),
            'worst_aqi' => FireHotspot::whereDate('acq_date', now()->toDateString())
                ->whereNotNull('nearest_city_aqi')
                ->orderByDesc('nearest_city_aqi')
                ->first(['nearest_city_aqi', 'nearest_city_name']),
            'last_updated' => DataIngestionLog::where('source', 'firms')
                ->where('status', '!=', 'failed')
                ->latest('finished_at')
                ->value('finished_at'),
        ];

        $topRegions = RegionPriorityScore::with('region')
            ->whereDate('score_date', now()->toDateString())
            ->orderByDesc('priority_score')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboard', [
            'hotspots'   => $hotspots,
            'stats'      => $stats,
            'topRegions' => $topRegions,
        ]);
    }
}