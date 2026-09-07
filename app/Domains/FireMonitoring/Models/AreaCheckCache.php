<?php

namespace App\Domains\FireMonitoring\Models;

use Illuminate\Database\Eloquent\Model;

class AreaCheckCache extends Model
{
    protected $table = 'area_check_cache';

    protected $fillable = [
        'lat_rounded', 'lon_rounded',
        'gfw_risk_score', 'gfw_risk_category',
        'aqi', 'nearest_city_name', 'cached_at',
    ];

    protected function casts(): array
    {
        return [
            'cached_at' => 'datetime',
        ];
    }
}