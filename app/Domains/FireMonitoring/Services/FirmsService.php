<?php

namespace App\Domains\FireMonitoring\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FirmsService
{
    protected string $baseUrl = 'https://firms.modaps.eosdis.nasa.gov/api';
    protected string $mapKey;

    public function __construct()
    {
        $this->mapKey = config('services.firms.map_key');
    }

    /**
     * Ambil hotspot kebakaran di wilayah Indonesia (bounding box),
     * beberapa hari terakhir, via FIRMS Area API.
     *
     * @param int $days Jumlah hari ke belakang (1-10 sesuai batas FIRMS)
     * @param string|null $sensor Override sensor default dari config
     * @return array<int, array> Baris hotspot hasil parse CSV
     */
    public function fetchIndonesiaHotspots(int $days = 1, ?string $sensor = null): array
    {
        $sensor = $sensor ?? config('ember.firms_default_sensor');
        $bbox = config('ember.firms_bbox_indonesia');

        $url = "{$this->baseUrl}/area/csv/{$this->mapKey}/{$sensor}/{$bbox}/{$days}";

        try {
            $response = Http::timeout(30)->retry(2, 2000)->get($url);

            if (! $response->successful()) {
                Log::warning('FIRMS API returned non-success status', [
                    'status' => $response->status(),
                    'body'   => substr($response->body(), 0, 500),
                ]);
                return [];
            }

            return $this->parseCsv($response->body());
        } catch (\Throwable $e) {
            Log::error('FIRMS API request failed', ['message' => $e->getMessage()]);
            return [];
        }
    }

    /**
     * Parse CSV response FIRMS menjadi array asosiatif per baris.
     * Kolom sesuai Architecture.md §3.1.
     */
    protected function parseCsv(string $csv): array
    {
        $lines = array_filter(array_map('trim', explode("\n", $csv)));

        if (count($lines) < 2) {
            return []; // hanya header atau kosong
        }

        $header = str_getcsv(array_shift($lines));

        $rows = [];
        foreach ($lines as $line) {
            $values = str_getcsv($line);

            if (count($values) !== count($header)) {
                continue; // skip baris malformed
            }

            $rows[] = array_combine($header, $values);
        }

        return $rows;
    }

    /**
     * Cek validitas MAP_KEY & sisa kuota (opsional, untuk debugging).
     */
    public function checkMapKeyStatus(): ?array
    {
        try {
            $response = Http::timeout(10)->get("{$this->baseUrl}/data_availability/csv/{$this->mapKey}/all");
            return $response->successful() ? $this->parseCsv($response->body()) : null;
        } catch (\Throwable $e) {
            Log::error('FIRMS map key check failed', ['message' => $e->getMessage()]);
            return null;
        }
    }
}