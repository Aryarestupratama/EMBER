<?php

namespace App\Domains\FireMonitoring\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FireHotspot extends Model
{
    use HasFactory;

    protected $fillable = [
        'latitude',
        'longitude',
        'brightness',
        'scan',
        'track',
        'acq_date',
        'acq_time',
        'satellite',
        'instrument',
        'confidence',
        'version',
        'bright_t31',
        'frp',
        'daynight',
        'gfw_risk_score',
        'gfw_risk_category',
        'nearest_city_aqi',
        'nearest_city_name',
        'nearest_city_state',
        'region_id',
        'fetched_at',
    ];

    protected function casts(): array
    {
        return [
            'latitude'       => 'decimal:5',
            'longitude'      => 'decimal:5',
            'brightness'     => 'decimal:2',
            'scan'           => 'decimal:2',
            'track'          => 'decimal:2',
            'acq_date'       => 'date',
            'bright_t31'     => 'decimal:2',
            'frp'            => 'decimal:2',
            'gfw_risk_score' => 'decimal:6',
            'fetched_at'     => 'datetime',
        ];
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function scopeHighRisk($query)
    {
        return $query->whereIn('gfw_risk_category', ['tinggi', 'sangat_tinggi']);
    }
}