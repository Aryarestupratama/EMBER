<?php

namespace App\Domains\FireMonitoring\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegionPriorityScore extends Model
{
    use HasFactory;

    protected $fillable = [
        'region_id',
        'score_date',
        'avg_gfw_risk_score',
        'hotspot_count',
        'normalized_hotspot_frequency',
        'avg_aqi',
        'normalized_aqi_impact',
        'priority_score',
        'priority_rank_category',
    ];

    protected function casts(): array
    {
        return [
            'score_date'                  => 'date',
            'avg_gfw_risk_score'          => 'decimal:6',
            'normalized_hotspot_frequency' => 'decimal:5',
            'normalized_aqi_impact'        => 'decimal:5',
            'priority_score'               => 'decimal:5',
        ];
    }

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    /**
     * Kategorikan priority_score final menggunakan ambang batas
     * yang sama dengan kategori risiko GFW (Rules.md #3).
     */
    public static function categorizeScore(?float $score): string
    {
        return (new \App\Domains\FireMonitoring\Services\GfwService())->categorizeScore($score);
    }
}