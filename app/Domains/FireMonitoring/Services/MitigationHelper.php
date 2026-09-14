<?php

namespace App\Domains\FireMonitoring\Services;

/**
 * Memetakan kategori risiko karhutla dan level AQI ke konten mitigasi
 * (BNPB/standar AQI US EPA). Murni lookup dari config, tanpa HTTP.
 *
 * null/kategori tidak dikenal selalu jatuh ke 'na'/'tidak_diketahui',
 * tidak pernah default ke 'rendah' atau 'baik'.
 */
class MitigationHelper
{
    private const AQI_THRESHOLDS = [
        'baik'                => [0, 50],
        'sedang'              => [51, 100],
        'tidak_sehat'         => [101, 200],
        'sangat_tidak_sehat'  => [201, 300],
        'berbahaya'           => [301, PHP_INT_MAX],
    ];

    /**
     * @param  string|null  $riskCategory  'rendah'|'sedang'|'tinggi'|'sangat_tinggi'|'na'|null
     * @param  bool  $full  true -> full_guidance (array), false -> short_text (string)
     */
    public static function forFireRisk(?string $riskCategory, bool $full = false): string|array
    {
        $content = config('ember.MITIGATION_CONTENT.fire_risk');

        $entry = $content[$riskCategory] ?? $content['na'];

        return $full ? $entry['full_guidance'] : $entry['short_text'];
    }

    public static function forAirQuality(?int $aqi, bool $full = false): string|array
    {
        $content = config('ember.MITIGATION_CONTENT.air_quality');

        $category = self::getAqiCategory($aqi);

        if ($category === null) {
            return $full
                ? ['Data kualitas udara untuk lokasi/wilayah ini belum tersedia.']
                : 'Data kualitas udara belum tersedia.';
        }

        $entry = $content[$category];

        return $full ? $entry['full_guidance'] : $entry['short_text'];
    }

    public static function getAqiCategory(?int $aqi): ?string
    {
        if ($aqi === null) {
            return null;
        }

        foreach (self::AQI_THRESHOLDS as $category => [$min, $max]) {
            if ($aqi >= $min && $aqi <= $max) {
                return $category;
            }
        }

        return null;
    }

    /**
     * @return array{fire_risk: array, air_quality: array}
     */
    public static function forLocation(?string $riskCategory, ?int $aqi): array
    {
        return [
            'fire_risk' => [
                'short_text'    => self::forFireRisk($riskCategory, full: false),
                'full_guidance' => self::forFireRisk($riskCategory, full: true),
            ],
            'air_quality' => [
                'category'      => self::getAqiCategory($aqi),
                'short_text'    => self::forAirQuality($aqi, full: false),
                'full_guidance' => self::forAirQuality($aqi, full: true),
            ],
        ];
    }
}