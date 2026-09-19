<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\AreaCheckCache;
use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Services\GfwService;
use App\Domains\FireMonitoring\Services\GoogleMapsLinkService;
use App\Domains\FireMonitoring\Services\IqairService;
use App\Domains\FireMonitoring\Services\MitigationHelper;
use App\Http\Requests\AreaCheckRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AreaCheckController extends Controller
{
    public function index()
    {
        return Inertia::render('AreaCheck');
    }

    public function resolveMapsLink(Request $request, GoogleMapsLinkService $mapsService)
    {
        $request->validate([
            'url' => ['required', 'string'],
        ]);

        $coords = $mapsService->extractCoordinates($request->input('url'));

        if (!$coords) {
            return response()->json([
                'message' => 'Tidak dapat membaca koordinat dari link tersebut. Pastikan link berasal dari Google Maps dan mengandung lokasi spesifik.',
            ], 422);
        }

        return response()->json($coords);
    }

    public function check(AreaCheckRequest $request, GfwService $gfw, IqairService $iqair)
    {
        $lat = (float) $request->validated('lat');
        $lon = (float) $request->validated('lon');

        [$latRounded, $lonRounded] = [round($lat, 3), round($lon, 3)];

        $cached = AreaCheckCache::where('lat_rounded', $latRounded)
            ->where('lon_rounded', $lonRounded)
            ->first();

        $ttlHours = config('ember.cache_ttl.area_check');

        if ($cached && $cached->cached_at->diffInHours(now()) < $ttlHours) {
            return response()->json($this->formatResponse($cached, $lat, $lon));
        }

        $risk = $gfw->getRiskScore($lat, $lon);
        $aqiResult = $iqair->nearestCity($lat, $lon);

        $cache = AreaCheckCache::updateOrCreate(
            ['lat_rounded' => $latRounded, 'lon_rounded' => $lonRounded],
            [
                'gfw_risk_score'     => $risk['risk_score'],
                'gfw_risk_category'  => $risk['risk_category'],
                'aqi'                => $aqiResult['aqi'] ?? null,
                'nearest_city_name'  => $aqiResult['city'] ?? null,
                'temp_c'             => $aqiResult['temp_c'] ?? null,
                'heat_index_c'       => $aqiResult['heat_index_c'] ?? null,
                'cached_at'          => now(),
            ]
        );

        return response()->json($this->formatResponse($cache, $lat, $lon));
    }

    protected function formatResponse(AreaCheckCache $cache, float $lat, float $lon): array
    {
        $radiusKm = config('ember.area_check_radius_km');

        $nearbyHotspots = $this->findNearbyHotspots($lat, $lon, $radiusKm);

        // Konten rekomendasi mitigasi diambil dari satu sumber kebenaran
        // (config/ember.php via MitigationHelper), bukan dihardcode di frontend.
        $mitigation = MitigationHelper::forLocation($cache->gfw_risk_category, $cache->aqi);

        return [
            'location' => ['lat' => $lat, 'lon' => $lon],
            'risk' => [
                'score'    => $cache->gfw_risk_score ? (float) $cache->gfw_risk_score : null,
                'category' => $cache->gfw_risk_category,
            ],
            'air_quality' => [
                'aqi'      => $cache->aqi,
                'category' => MitigationHelper::getAqiCategory($cache->aqi),
                'city'     => $cache->nearest_city_name,
            ],
            'weather' => [
                'temp_c'       => $cache->temp_c ? (float) $cache->temp_c : null,
                'heat_index_c' => $cache->heat_index_c ? (float) $cache->heat_index_c : null,
            ],
            'nearby_hotspots' => [
                'count'          => $nearbyHotspots->count(),
                'nearest_km'     => $nearbyHotspots->first()['distance_km'] ?? null,
                'radius_km'      => $radiusKm,
            ],
            'mitigation' => [
                'fire_risk'    => $mitigation['fire_risk'],
                'air_quality'  => $mitigation['air_quality'],
            ],
            'cached_at' => $cache->cached_at->toIso8601String(),
        ];
    }

    /**
     * Cari hotspot dalam radius tertentu menggunakan Haversine
     * (query lokal, bukan panggilan API  sesuai prinsip cache-first).
     */
    protected function findNearbyHotspots(float $lat, float $lon, int $radiusKm)
    {
        // Haversine formula langsung di SQL untuk performa
        $hotspots = FireHotspot::selectRaw(
            "*, (6371 * acos(cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) + sin(radians(?)) *
                sin(radians(latitude)))) AS distance_km",
            [$lat, $lon, $lat]
        )
            ->having('distance_km', '<=', $radiusKm)
            ->orderBy('distance_km')
            ->limit(20)
            ->get();

        return $hotspots;
    }
}