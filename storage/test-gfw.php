<?php

$service = new \App\Domains\FireMonitoring\Services\GfwService();

$points = [
    ['lat' => -1.833, 'lon' => 110.033],
    ['lat' => -0.033, 'lon' => 109.333],
    ['lat' => -2.207, 'lon' => 113.917],
    ['lat' => -2.983, 'lon' => 112.700],
    ['lat' => 0.483, 'lon' => 101.450],
    ['lat' => 0.700, 'lon' => 101.850],
    ['lat' => -1.100, 'lon' => 104.050],
    ['lat' => -3.317, 'lon' => 104.700],
    ['lat' => -2.283, 'lon' => 111.500],
    ['lat' => -1.267, 'lon' => 110.333],
    ['lat' => -3.583, 'lon' => 114.767],
    ['lat' => -0.900, 'lon' => 114.900],
    ['lat' => -2.667, 'lon' => 111.083],
    ['lat' => 1.117, 'lon' => 104.050],
    ['lat' => -1.617, 'lon' => 103.617],
    ['lat' => -4.017, 'lon' => 104.700],
    ['lat' => -0.500, 'lon' => 109.400],
    ['lat' => -1.917, 'lon' => 113.150],
    ['lat' => -2.100, 'lon' => 106.117],
    ['lat' => 3.583, 'lon' => 98.667],
];

$results = collect($points)->map(function ($point) use ($service) {
    $result = $service->getRiskScore($point['lat'], $point['lon']);
    return array_merge($point, $result);
});

$results->each(function ($r) {
    echo "lat: {$r['lat']}, lon: {$r['lon']}, loss%: {$r['loss_percentage']}, risk_score: {$r['risk_score']}, category: {$r['risk_category']}" . PHP_EOL;
});

$validLoss = $results->pluck('loss_percentage')->filter();

echo PHP_EOL;
echo "Min: " . $validLoss->min() . "%" . PHP_EOL;
echo "Max: " . $validLoss->max() . "%" . PHP_EOL;
echo "Mean: " . round($validLoss->avg(), 2) . "%" . PHP_EOL;