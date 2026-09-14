<?php

namespace App\Domains\FireMonitoring\Services;

use Illuminate\Support\Facades\Http;

class GoogleMapsLinkService
{
    // User-Agent mobile asli agar Google mengarahkan ke URL final presisi
    // (bukan fallback ke lokasi berbasis IP server).
    protected const USER_AGENT =
        'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36';

    public function extractCoordinates(string $url): ?array
    {
        $url = trim($url);

        $coords = $this->parseCoordinatesFromUrl($url);
        if ($coords) {
            return $coords;
        }

        if ($this->isShortLink($url)) {
            $resolvedUrl = $this->resolveRedirect($url);
            if ($resolvedUrl) {
                return $this->parseCoordinatesFromUrl($resolvedUrl);
            }
        }

        return null;
    }

    protected function isShortLink(string $url): bool
    {
        return str_contains($url, 'maps.app.goo.gl')
            || str_contains($url, 'goo.gl/maps');
    }

    protected function resolveRedirect(string $url): ?string
    {
        try {
            $response = Http::withHeaders(['User-Agent' => self::USER_AGENT])
                ->withOptions([
                    'allow_redirects' => [
                        'max'             => 5,
                        'track_redirects' => true,
                    ],
                ])
                ->timeout(8)
                ->get($url);

            $finalUrl = (string) $response->effectiveUri();

            // Masih nyangkut di consent page Google -> tidak dapat URL final
            // yang presisi, jangan lanjut menebak koordinat.
            if (str_contains($finalUrl, 'consent.google.com')) {
                return null;
            }

            return $finalUrl;
        } catch (\Throwable $e) {
            report($e);
            return null;
        }
    }

    protected function parseCoordinatesFromUrl(string $url): ?array
    {
        // !3d!4d = koordinat presisi pin, diprioritaskan di atas @lat,lng
        // yang bisa merepresentasikan pusat viewport (bisa bergeser dari pin).
        if (preg_match('/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/', $url, $m)) {
            return ['lat' => (float) $m[1], 'lon' => (float) $m[2]];
        }

        if (preg_match('/@(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $m)) {
            return ['lat' => (float) $m[1], 'lon' => (float) $m[2]];
        }

        if (preg_match('/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/', $url, $m)) {
            return ['lat' => (float) $m[1], 'lon' => (float) $m[2]];
        }

        return null;
    }
}