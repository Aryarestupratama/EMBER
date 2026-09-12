<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\DataIngestionLog;
use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Models\Region;
use App\Domains\FireMonitoring\Models\RegionPriorityScore;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Ambil tanggal data hotspot TERAKHIR yang tersedia (bukan asumsi "hari ini")
        $latestHotspotDate = FireHotspot::max('acq_date');

        $hotspots = $latestHotspotDate
            ? FireHotspot::whereDate('acq_date', $latestHotspotDate)
                ->select(['id', 'latitude', 'longitude', 'acq_date', 'gfw_risk_category', 'confidence', 'frp', 'region_id'])
                // region:id,name — cuma ambil kolom yang dipakai frontend (nama wilayah),
                // bukan seluruh baris Region, biar payload ke Dashboard tetap ringan
                // walau hotspot-nya banyak. region_id BISA null (proses assign di
                // ingest bisa gagal/lewat untuk sebagian baris, lihat data live),
                // jadi frontend tetap wajib fallback kalau relasinya kosong.
                ->with('region:id,name')
                ->get()
            : collect();

        // Sama untuk priority score — ambil tanggal terakhir yang ada datanya
        $latestScoreDate = RegionPriorityScore::max('score_date');

        $stats = [
            'total_hotspots'    => $hotspots->count(),
            'high_risk_regions' => $latestScoreDate
                ? RegionPriorityScore::whereDate('score_date', $latestScoreDate)
                    ->whereIn('priority_rank_category', ['tinggi', 'sangat_tinggi'])
                    ->count()
                : 0,
            'worst_aqi' => $latestHotspotDate
                ? FireHotspot::whereDate('acq_date', $latestHotspotDate)
                    ->whereNotNull('nearest_city_aqi')
                    ->orderByDesc('nearest_city_aqi')
                    ->first(['nearest_city_aqi', 'nearest_city_name'])
                : null,
            'last_updated' => DataIngestionLog::where('source', 'firms')
                ->where('status', '!=', 'failed')
                ->latest('finished_at')
                ->first()
                ?->finished_at,
            'data_date' => $latestHotspotDate,
            // Total wilayah yang di-seed sistem (selalu 502, tidak tergantung
            // ada/tidaknya hotspot hari itu) — dipakai untuk stat
            // "Wilayah Terpantau", dipisah dari topRegions.length (yang cuma
            // menampilkan 10 wilayah teratas di ranking).
            'total_regions' => Region::count(),
        ];

        $topRegions = $latestScoreDate
            ? RegionPriorityScore::with('region')
                ->whereDate('score_date', $latestScoreDate)
                ->orderByDesc('priority_score')
                ->limit(10)
                ->get()
            : collect();

        return Inertia::render('Dashboard', [
            'hotspots'   => $hotspots,
            'stats'      => $stats,
            'topRegions' => $topRegions,
        ]);
    }
}