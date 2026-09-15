<?php

namespace App\Domains\FireMonitoring\Services;

class MitigationHelper
{
    private const AQI_THRESHOLDS = [
        'baik'                => [0, 50],
        'sedang'              => [51, 100],
        'tidak_sehat'         => [101, 200],
        'sangat_tidak_sehat'  => [201, 300],
        'berbahaya'           => [301, PHP_INT_MAX],
    ];

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
     * @param  string|null  $riskCategory  'rendah'|'sedang'|'tinggi'|'sangat_tinggi'|'na'|null
     * @return array{fire_risk: array{category: string}, air_quality: array{category: ?string}}
     */
    public static function forLocation(?string $riskCategory, ?int $aqi): array
    {
        return [
            'fire_risk' => [
                'category' => $riskCategory ?? 'na',
            ],
            'air_quality' => [
                'category' => self::getAqiCategory($aqi),
            ],
        ];
    }
}