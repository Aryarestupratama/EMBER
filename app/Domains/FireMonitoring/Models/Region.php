<?php

namespace App\Domains\FireMonitoring\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Region extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'province',
        'slug',
        'centroid_lat',
        'centroid_lon',
        'area_km2',
    ];

    protected function casts(): array
    {
        return [
            'centroid_lat' => 'decimal:5',
            'centroid_lon' => 'decimal:5',
            'area_km2'     => 'decimal:2',
        ];
    }

    public function fireHotspots(): HasMany
    {
        return $this->hasMany(FireHotspot::class);
    }

    public function priorityScores(): HasMany
    {
        return $this->hasMany(RegionPriorityScore::class);
    }

    public function latestPriorityScore()
    {
        return $this->priorityScores()->latest('score_date')->first();
    }
}