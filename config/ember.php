<?php

return [

    /*
    |--------------------------------------------------------------------
    | REFERENSI HISTORIS (tidak dipakai lagi)
    |--------------------------------------------------------------------
    | Threshold ini awalnya dihitung dari statistik layer BNPB InaRISK
    | (mean: 0.407, stdv: 0.351). Diganti ke GFW karena instabilitas
    | server BNPB terkonfirmasi selama 3 hari pengujian berturut-turut.
    | Lihat Analisa-Sumber-Data-Alternatif.md untuk detail lengkap.
    |
    | 'bnpb_risk_thresholds_REFERENCE_ONLY' => [
    |     'rendah'        => [0.00, 0.20],
    |     'sedang'        => [0.20, 0.41],
    |     'tinggi'        => [0.41, 0.58],
    |     'sangat_tinggi' => [0.58, 0.94],
    | ],
    */

    // Threshold kategori risiko berbasis GFW tree cover loss,
    // dihitung dari sampel 20 titik hotspot asli (min 0.63%, max 33.88%,
    // rata-rata 18.22%, median 21.09%). Lihat Progress.md untuk log pengujian.
    'gfw_risk_thresholds' => [
        'rendah'        => [0.00, 0.37],
        'sedang'        => [0.37, 0.51],
        'tinggi'        => [0.51, 0.66],
        'sangat_tinggi' => [0.66, 1.00],
    ],

    // Skala maksimum loss_percentage untuk normalisasi ke 0-1
    'gfw_loss_percentage_max' => 35.0,

    // Radius buffer (km) di sekitar tiap titik hotspot untuk analisis GFW,
    // ditentukan dari pengujian 3km/5km/10km — 5km paling seimbang.
    'gfw_buffer_radius_km' => 5,

    // Tahun awal perhitungan tree cover loss (GFW dataset umd_tree_cover_loss)
    'gfw_loss_year_start' => 2015,

    // Bobot formula Priority Score (Rules.md §3) — tidak berubah
    'priority_score_weights' => [
        'gfw_risk'          => 0.4,
        'hotspot_frequency' => 0.4,
        'aqi_impact'        => 0.2,
    ],

    'aqi_scale' => [
        'min' => 0,
        'max' => 300,
    ],

    'firms_bbox_indonesia' => '95,-11,141,6',
    'firms_default_sensor' => 'MODIS_NRT',
    'area_check_radius_km' => 25,

    // TTL cache (jam) — GFW jauh lebih lama karena data historis, bukan real-time
    'cache_ttl' => [
        'area_check' => 12,
        'gfw_risk'   => 24 * 30, // 30 hari — tree cover loss update tahunan
        'iqair'      => 6,
    ],
];