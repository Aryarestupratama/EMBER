<?php

namespace App\Domains\FireMonitoring\Models;

use Illuminate\Database\Eloquent\Model;

class DataIngestionLog extends Model
{
    protected $fillable = [
        'source', 'status', 'records_processed',
        'error_message', 'started_at', 'finished_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at'  => 'datetime',
            'finished_at' => 'datetime',
        ];
    }
}