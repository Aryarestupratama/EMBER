<?php

return [

    // Ambang batas kategori risiko BNPB
    'bnpb_risk_thresholds' => [
        'rendah'        => [0.00, 0.20],
        'sedang'        => [0.20, 0.41],
        'tinggi'        => [0.41, 0.58],
        'sangat_tinggi' => [0.58, 0.94],
    ],

    // Statistik aktual layer BNPB InaRISK
    'bnpb_layer_stats' => [
        'min'  => 0,
        'max'  => 0.9339207410812378,
        'mean' => 0.4069669157821782,
        'stdv' => 0.350784395551544,
    ],

    // Bobot formula Priority Score
    'priority_score_weights' => [
        'bnpb_risk'        => 0.4,
        'hotspot_frequency' => 0.4,
        'aqi_impact'       => 0.2,
    ],

    // Skala AQI untuk normalisasi 
    'aqi_scale' => [
        'min' => 0,
        'max' => 300, 
    ],

    // Bounding box Indonesia untuk FIRMS Area API
    'firms_bbox_indonesia' => '95,-11,141,6',

    // Sensor default FIRMS
    'firms_default_sensor' => 'MODIS_NRT',

    // Radius pencarian hotspot terdekat untuk fitur "Cek Daerah Kamu" (km)
    'area_check_radius_km' => 25,

    // TTL cache (jam)
    'cache_ttl' => [
        'area_check' => 12,
        'inarisk'    => 6,
        'iqair'      => 6,
    ],
];