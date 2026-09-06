<?php

namespace App\Domains\FireMonitoring\Models;

use Illuminate\Database\Eloquent\Model;

class GfwRiskCache extends Model
{
    protected $table = 'gfw_risk_cache';

    protected $fillable = [
        'lat_rounded', 'lon_rounded', 'geostore_id',
        'buffer_area_ha', 'loss_area_ha', 'loss_percentage',
        'risk_score', 'risk_category', 'cached_at',
    ];

    protected function casts(): array
    {
        return [
            'cached_at' => 'datetime',
        ];
    }
}