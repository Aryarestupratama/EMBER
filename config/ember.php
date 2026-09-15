<?php

return [

    'gfw_risk_thresholds' => [
        'rendah'        => [0.00, 0.37],
        'sedang'        => [0.37, 0.51],
        'tinggi'        => [0.51, 0.66],
        'sangat_tinggi' => [0.66, 1.00],
    ],

    'gfw_loss_percentage_max' => 35.0,
    'gfw_buffer_radius_km' => 5,
    'gfw_loss_year_start' => 2015,

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

    'cache_ttl' => [
        'area_check' => 12,
        'gfw_risk'   => 24 * 30,
        'iqair'      => 6,
    ],
];