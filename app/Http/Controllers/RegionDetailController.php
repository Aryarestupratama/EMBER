<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\FireHotspot;
use App\Domains\FireMonitoring\Models\Region;
use App\Domains\FireMonitoring\Services\MitigationHelper;
use Inertia\Inertia;

class RegionDetailController extends Controller
{
    private const COMPASS_DIRECTIONS = [
        'utara', 'timur laut', 'timur', 'tenggara',
        'selatan', 'barat daya', 'barat', 'barat laut',
    ];

    public function show(Region $region)
    {
        $latestScore = $region->latestPriorityScore();

        $hotspots = FireHotspot::where('region_id', $region->id)
            ->where('acq_date', '>=', now()->subDays(7))
            ->orderByDesc('acq_date')
            ->get()
            ->map(fn (FireHotspot $hotspot) => array_merge($hotspot->toArray(), $this->relativePosition(
                (float) $region->centroid_lat,
                (float) $region->centroid_lon,
                (float) $hotspot->latitude,
                (float) $hotspot->longitude,
            )));

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

    private function relativePosition(float $centroidLat, float $centroidLon, float $lat, float $lon): array
    {
        $earthRadiusKm = 6371;

        $latDelta = deg2rad($lat - $centroidLat);
        $lonDelta = deg2rad($lon - $centroidLon);

        $a = sin($latDelta / 2) ** 2
            + cos(deg2rad($centroidLat)) * cos(deg2rad($lat)) * sin($lonDelta / 2) ** 2;
        $distanceKm = $earthRadiusKm * 2 * atan2(sqrt($a), sqrt(1 - $a));

        $bearing = rad2deg(atan2(
            sin($lonDelta) * cos(deg2rad($lat)),
            cos(deg2rad($centroidLat)) * sin(deg2rad($lat))
                - sin(deg2rad($centroidLat)) * cos(deg2rad($lat)) * cos($lonDelta),
        ));
        $bearing = fmod($bearing + 360, 360);

        $directionIndex = (int) round($bearing / 45) % 8;

        return [
            'distance_from_centroid_km' => round($distanceKm, 1),
            'direction_from_centroid'   => self::COMPASS_DIRECTIONS[$directionIndex],
        ];
    }
}