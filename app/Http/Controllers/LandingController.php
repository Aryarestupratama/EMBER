<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\DataIngestionLog;
use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Models\RegionPriorityScore;
use Inertia\Inertia;

class LandingController extends Controller
{
    public function index()
    {
        $today = now()->toDateString();

        return Inertia::render('Landing', [
            'stats' => [
                'total_hotspots' => FireHotspot::whereDate('acq_date', $today)->count(),

                'high_risk_regions' => RegionPriorityScore::whereDate('score_date', $today)
                    ->whereIn('priority_rank_category', ['tinggi', 'sangat_tinggi'])
                    ->count(),

                // Rules.md §4: setiap halaman yang menampilkan data wajib
                // menampilkan timestamp "data terakhir diperbarui" dari
                // data_ingestion_logs — bukan klaim jadwal statis di frontend.
                // Diambil dari log ingest terakhir yang selesai (success/partial),
                // lintas sumber (firms/gfw/iqair), agar mencerminkan kondisi
                // nyata meski salah satu sumber sedang gagal (Architecture.md §6).
                'data_updated_at' => DataIngestionLog::whereIn('status', ['success', 'partial'])
                    ->whereNotNull('finished_at')
                    ->latest('finished_at')
                    ->first()
                    ?->finished_at,
            ],
            'previewHotspots' => FireHotspot::whereDate('acq_date', $today)
                ->select(['id', 'latitude', 'longitude', 'gfw_risk_category', 'confidence', 'frp'])
                ->limit(50)
                ->get(),
        ]);
    }
}