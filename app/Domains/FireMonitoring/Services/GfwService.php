<?php

namespace App\Domains\FireMonitoring\Services;

use App\Domains\FireMonitoring\Models\GfwRiskCache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GfwService
{
    protected string $baseUrl = 'https://data-api.globalforestwatch.org';
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.gfw.api_key');
    }

    /**
     * Ambil skor risiko untuk satu titik koordinat.
     * Cek cache database dulu (TTL 30 hari) sebelum panggil API GFW,
     * sesuai prinsip cache-first (Architecture.md #1).
     */
    public function getRiskScore(float $lat, float $lon): array
    {
        [$latRounded, $lonRounded] = $this->roundCoordinates($lat, $lon);

        $cached = GfwRiskCache::where('lat_rounded', $latRounded)
            ->where('lon_rounded', $lonRounded)
            ->first();

        $ttlHours = config('ember.cache_ttl.gfw_risk');

        if ($cached && $cached->cached_at->diffInHours(now()) < $ttlHours) {
            return $this->formatResult($cached);
        }

        $result = $this->fetchFromApi($lat, $lon);

        $cache = GfwRiskCache::updateOrCreate(
            ['lat_rounded' => $latRounded, 'lon_rounded' => $lonRounded],
            array_merge($result, ['cached_at' => now()])
        );

        return $this->formatResult($cache);
    }

    /**
     * Ambil skor risiko untuk BANYAK titik sekaligus.
     * Tetap dicek cache satu-satu (per titik), hanya titik yang
     * belum ada cache valid yang benar-benar panggil API GFW.
     *
     * @param array<int, array{lat: float, lon: float}> $points
     * @return array<int, array> Hasil berurutan sesuai index $points
     */
    public function getRiskScoresForPoints(array $points): array
    {
        return array_map(
            fn ($point) => $this->getRiskScore($point['lat'], $point['lon']),
            $points
        );
    }

    protected function fetchFromApi(float $lat, float $lon): array
    {
        $radiusKm = config('ember.gfw_buffer_radius_km');
        $yearStart = config('ember.gfw_loss_year_start');

        try {
            $geostore = $this->createGeostore($lat, $lon, $radiusKm);

            if (! $geostore) {
                return $this->emptyResult();
            }

            [$geostoreId, $bufferAreaHa] = $geostore;

            $lossArea = $this->queryTreeCoverLoss($geostoreId, $yearStart);

            if (is_null($lossArea)) {
                return $this->emptyResult();
            }

            $lossPercentage = $bufferAreaHa > 0
                ? round(($lossArea / $bufferAreaHa) * 100, 2)
                : 0;

            $riskScore = $this->normalizeScore($lossPercentage);
            $riskCategory = $this->categorizeScore($riskScore);

            return [
                'geostore_id'     => $geostoreId,
                'buffer_area_ha'  => $bufferAreaHa,
                'loss_area_ha'    => $lossArea,
                'loss_percentage' => $lossPercentage,
                'risk_score'      => $riskScore,
                'risk_category'   => $riskCategory,
            ];
        } catch (\Throwable $e) {
            Log::error('GfwService::fetchFromApi failed', [
                'message' => $e->getMessage(), 'lat' => $lat, 'lon' => $lon,
            ]);
            return $this->emptyResult();
        }
    }

    protected function createGeostore(float $lat, float $lon, int $radiusKm): ?array
    {
        $radiusDeg = $radiusKm / 111;
        $polygon = [
            [$lon - $radiusDeg, $lat - $radiusDeg],
            [$lon + $radiusDeg, $lat - $radiusDeg],
            [$lon + $radiusDeg, $lat + $radiusDeg],
            [$lon - $radiusDeg, $lat + $radiusDeg],
            [$lon - $radiusDeg, $lat - $radiusDeg],
        ];

        $response = Http::withHeaders(['x-api-key' => $this->apiKey])
            ->timeout(20)
            ->post("{$this->baseUrl}/geostore", [
                'geometry' => ['type' => 'Polygon', 'coordinates' => [$polygon]],
            ]);

        if ($response->status() !== 201) {
            Log::warning('GFW geostore creation failed', ['status' => $response->status()]);
            return null;
        }

        return [
            $response->json('data.gfw_geostore_id'),
            $response->json('data.gfw_area__ha'),
        ];
    }

    protected function queryTreeCoverLoss(string $geostoreId, int $yearStart): ?float
    {
        $response = Http::withHeaders(['x-api-key' => $this->apiKey])
            ->timeout(20)
            ->get("{$this->baseUrl}/dataset/umd_tree_cover_loss/latest/query/json", [
                'sql' => "SELECT SUM(area__ha) as loss_area FROM data WHERE umd_tree_cover_loss__year >= {$yearStart}",
                'geostore_id' => $geostoreId,
                'geostore_origin' => 'gfw',
            ]);

        if (! $response->successful()) {
            Log::warning('GFW tree cover loss query failed', ['status' => $response->status()]);
            return null;
        }

        return (float) ($response->json('data.0.loss_area') ?? 0);
    }

    /**
     * Normalisasi loss_percentage ke skala 0-1.
     * Skala maksimum ditentukan dari sampel 20 titik hotspot asli
     * (min 0.63%, max 33.88%, rata-rata 18.22%, median 21.09%).
     * Lihat Progress.md untuk log pengujian lengkap.
     */
    protected function normalizeScore(float $lossPercentage): float
    {
        $max = config('ember.gfw_loss_percentage_max');
        return round(min($lossPercentage / $max, 1), 6);
    }

    /**
     * Kategorikan skor 0-1 menggunakan threshold di config/ember.php.
     * NoData / null SELALU dikategorikan 'na', bukan dianggap 0.
     */
    public function categorizeScore(?float $score): string
    {
        if (is_null($score)) {
            return 'na';
        }

        foreach (config('ember.gfw_risk_thresholds') as $category => [$min, $max]) {
            if ($score >= $min && $score < $max) {
                return $category;
            }
        }

        return 'sangat_tinggi';
    }

    protected function roundCoordinates(float $lat, float $lon): array
    {
        return [round($lat, 3), round($lon, 3)];
    }

    protected function emptyResult(): array
    {
        return [
            'geostore_id'     => null,
            'buffer_area_ha'  => null,
            'loss_area_ha'    => null,
            'loss_percentage' => null,
            'risk_score'      => null,
            'risk_category'   => 'na',
        ];
    }

    protected function formatResult(GfwRiskCache $cache): array
    {
        return [
            'risk_score'      => $cache->risk_score ? (float) $cache->risk_score : null,
            'risk_category'   => $cache->risk_category,
            'loss_percentage' => $cache->loss_percentage ? (float) $cache->loss_percentage : null,
        ];
    }
}