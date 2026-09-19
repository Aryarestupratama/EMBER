<?php

namespace App\Domains\FireMonitoring\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class IqairService
{
    protected string $baseUrl = 'https://api.airvisual.com/v2';
    protected string $apiKey;

    public function __construct()
    {
        $this->apiKey = config('services.iqair.api_key');
    }

    /**
     * @return array{aqi: int, city: ?string, state: ?string, temp_c: ?float, heat_index_c: ?float}|null
     */
    public function nearestCity(float $lat, float $lon): ?array
    {
        try {
            $response = Http::timeout(15)->retry(2, 2000)->get("{$this->baseUrl}/nearest_city", [
                'lat' => $lat,
                'lon' => $lon,
                'key' => $this->apiKey,
            ]);

            if (! $response->successful()) {
                Log::warning('IQAir API non-success', ['status' => $response->status()]);
                return null;
            }

            $data = $response->json('data');

            if (! $data || ! isset($data['current']['pollution']['aqius'])) {
                return null;
            }

            return [
                'aqi'          => (int) $data['current']['pollution']['aqius'],
                'city'         => $data['city'] ?? null,
                'state'        => $data['state'] ?? null,
                // Suhu udara aktual (°C). Bukan field wajib di response — kalau
                // sewaktu-waktu tidak tersedia untuk suatu lokasi/plan, tetap
                // null (bukan 0), konsisten dengan prinsip null ≠ 0 (Rules.md §2).
                'temp_c'       => isset($data['current']['weather']['tp'])
                    ? (float) $data['current']['weather']['tp']
                    : null,
                // "Suhu terasa" — memperhitungkan kelembapan. Sama seperti
                // temp_c, dibiarkan null kalau tidak ada di response.
                'heat_index_c' => isset($data['current']['weather']['heatIndex'])
                    ? (float) $data['current']['weather']['heatIndex']
                    : null,
            ];
        } catch (\Throwable $e) {
            Log::error('IQAir nearest_city() failed', ['message' => $e->getMessage()]);
            return null;
        }
    }
}