<?php

namespace App\Domains\FireMonitoring\Services;

/**
 * MitigationHelper
 *
 * Bertugas memetakan kategori risiko karhutla (gfw_risk_category) dan
 * level AQI ke konten rekomendasi mitigasi resmi (BNPB/standar AQI US EPA).
 *
 * Prinsip:
 * - Tidak ada panggilan HTTP di sini — murni lookup dari config statis
 *   (config/ember.php → MITIGATION_CONTENT), konsisten dengan Rules.md §7
 *   (threshold/konten sebagai constant, bukan magic value di logic).
 * - null/kategori tidak dikenal TIDAK pernah default ke kategori 'rendah'
 *   atau AQI 'baik' — selalu jatuh ke fallback 'na' / 'tidak_diketahui'
 *   yang eksplisit menyatakan data tidak tersedia (selaras prinsip
 *   null ≠ 0 di Rules.md §2 dan Design.md §6 soal RiskBadge).
 */
class MitigationHelper
{
    /**
     * Ambang batas AQI mengikuti skala AQI US EPA yang sudah dipakai
     * IQAir (kolom nearest_city_aqi). Didefinisikan sekali di sini,
     * dipakai konsisten oleh getAqiCategory().
     */
    private const AQI_THRESHOLDS = [
        'baik'                => [0, 50],
        'sedang'              => [51, 100],
        'tidak_sehat'         => [101, 200],
        'sangat_tidak_sehat'  => [201, 300],
        'berbahaya'           => [301, PHP_INT_MAX],
    ];

    /**
     * Ambil konten mitigasi untuk kategori risiko karhutla tertentu.
     *
     * @param  string|null  $riskCategory  'rendah'|'sedang'|'tinggi'|'sangat_tinggi'|'na'|null
     * @param  bool  $full  true → kembalikan full_guidance (array poin), false → short_text (string)
     * @return string|array
     */
    public static function forFireRisk(?string $riskCategory, bool $full = false): string|array
    {
        $content = config('ember.MITIGATION_CONTENT.fire_risk');

        // Kategori null/tidak dikenal selalu jatuh ke 'na', tidak pernah ke 'rendah'
        $entry = $content[$riskCategory] ?? $content['na'];

        return $full ? $entry['full_guidance'] : $entry['short_text'];
    }

    /**
     * Ambil konten mitigasi berdasarkan nilai AQI mentah (bukan kategori).
     * Kategorisasi dilakukan di sini agar single source of truth untuk
     * breakpoint AQI ada di satu tempat (AQI_THRESHOLDS di atas).
     *
     * @param  int|null  $aqi  nilai AQI mentah, mis. dari nearest_city_aqi
     * @param  bool  $full
     * @return string|array
     */
    public static function forAirQuality(?int $aqi, bool $full = false): string|array
    {
        $content = config('ember.MITIGATION_CONTENT.air_quality');

        $category = self::getAqiCategory($aqi);

        if ($category === null) {
            // AQI tidak tersedia — tidak pernah diperlakukan sebagai 'baik'
            return $full
                ? ['Data kualitas udara untuk lokasi/wilayah ini belum tersedia.']
                : 'Data kualitas udara belum tersedia.';
        }

        $entry = $content[$category];

        return $full ? $entry['full_guidance'] : $entry['short_text'];
    }

    /**
     * Konversi nilai AQI mentah menjadi kunci kategori (mengikuti AQI_THRESHOLDS).
     * Mengembalikan null jika AQI null — dipetakan eksplisit sebagai
     * "data tidak tersedia", bukan default ke kategori 'baik'.
     */
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
     * Convenience method: ambil kedua rekomendasi (fire risk + air quality)
     * sekaligus untuk dipakai di SummaryCard / halaman detail lokasi.
     *
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