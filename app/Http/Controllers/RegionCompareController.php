<?php

namespace App\Http\Controllers;

use App\Domains\FireMonitoring\Models\Region;
use Illuminate\Http\Request;

class RegionCompareController extends Controller
{
    public function compare(Request $request)
    {
        $validated = $request->validate([
            'ids'   => 'required|array|min:2|max:3',
            'ids.*' => 'integer|exists:regions,id',
        ]);

        $regions = Region::whereIn('id', $validated['ids'])->get();

        // Pakai urutan ids yang dikirim, bukan urutan default query,
        // supaya konsisten dengan urutan pemilihan user di frontend.
        $ordered = collect($validated['ids'])
            ->map(fn ($id) => $regions->firstWhere('id', $id))
            ->filter()
            ->values();

        $result = $ordered->map(function (Region $region) {
            $score = $region->latestPriorityScore();

            return [
                'region' => $region->only(['id', 'name', 'province', 'slug']),
                'score'  => $score,
            ];
        });

        return response()->json(['data' => $result]);
    }
}