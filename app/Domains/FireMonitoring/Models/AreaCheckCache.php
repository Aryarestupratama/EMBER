<?php

namespace App\Domains\FireMonitoring\Models;

use Illuminate\Database\Eloquent\Model;

class AreaCheckCache extends Model
{
    protected $table = 'area_check_cache';

    protected $fillable = [
        'lat_rounded', 'lon_rounded',
        'gfw_risk_score', 'gfw_risk_category',
        'aqi', 'nearest_city_name', 'temp_c', 'heat_index_c', 'cached_at',
    ];

    protected function casts(): array
    {
        return [
            'cached_at'    => 'datetime',
            'temp_c'       => 'decimal:2',
            'heat_index_c' => 'decimal:2',
        ];
    }
}