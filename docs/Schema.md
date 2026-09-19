# Database Schema Document — EMBER
**Early Monitoring for Burning Environment & Reforestation**

The database is built from scratch for this project. No tables/data are reused from any other project.

## Revision History

| Date | Change |
|---|---|
| September 6, 2026 | The columns previously named `bnpb_risk_score` / `bnpb_risk_category` were renamed to `gfw_risk_score` / `gfw_risk_category` following the switch of the risk data source from BNPB InaRISK to Global Forest Watch (GFW). See `Analisa-Sumber-Data-Alternatif.md` for the full rationale. |
| September 12, 2026 | The calibration sample statistics in §8 were updated based on re-testing 20 real coordinate points via the `GfwService` pipeline (see the matching revision note in `Rules.md` §2). The categorization table did not change since the normalization scale (35%) remains valid against this new data. |
| September 19, 2026 | Columns `nearest_city_temp_c` and `nearest_city_heat_index_c` were added to `fire_hotspots`; columns `temp_c` and `heat_index_c` were added to `area_check_cache`. Both store actual air temperature and perceived/"feels like" temperature (heat index) data from the `weather.tp`/`weather.heatIndex` fields of the same IQAir response already used for AQI (see `Architecture.md` §3.3) — not the addition of a new data source. They follow the same nullable pattern as other IQAir columns: `null` means the data failed to fetch (null ≠ 0 principle, Rules.md §2), not 0°C. |

---

## 1. `fire_hotspots`

Stores ingest results from NASA FIRMS, enriched with GFW risk scores and related AQI data.

```php
Schema::create('fire_hotspots', function (Blueprint $table) {
    $table->id();

    // From NASA FIRMS
    $table->decimal('latitude', 9, 5);
    $table->decimal('longitude', 9, 5);
    $table->decimal('brightness', 8, 2)->nullable();
    $table->decimal('scan', 4, 2)->nullable();
    $table->decimal('track', 4, 2)->nullable();
    $table->date('acq_date');
    $table->string('acq_time', 4);            // format HHMM
    $table->string('satellite', 20)->nullable();
    $table->string('instrument', 20)->nullable();
    $table->unsignedTinyInteger('confidence'); // 0-100
    $table->string('version', 20)->nullable();
    $table->decimal('bright_t31', 8, 2)->nullable();
    $table->decimal('frp', 8, 2);              // Fire Radiative Power
    $table->enum('daynight', ['D', 'N']);

    // From Global Forest Watch (GFW) — tree cover loss as a risk proxy
    $table->decimal('gfw_risk_score', 8, 6)->nullable(); // null = failed/unavailable
    $table->enum('gfw_risk_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na' // low, medium, high, very high, n/a
    ])->default('na');

    // From IQAir (populated for high/very-high category hotspots)
    $table->unsignedInteger('nearest_city_aqi')->nullable();
    $table->string('nearest_city_name', 100)->nullable();
    $table->string('nearest_city_state', 100)->nullable();
    $table->decimal('nearest_city_temp_c', 5, 2)->nullable();       // air temperature (°C), IQAir response field `tp`
    $table->decimal('nearest_city_heat_index_c', 5, 2)->nullable(); // perceived temperature (°C), IQAir response field `heatIndex`

    // Administrative region reference (optional, result of reverse lookup)
    $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();

    $table->timestamp('fetched_at')->useCurrent();
    $table->timestamps();

    $table->index(['acq_date', 'confidence']);
    $table->index(['gfw_risk_category']);
    $table->index(['latitude', 'longitude']);
});
```

## 2. `regions`

List of administrative regions (regency/city) used as the aggregation unit. Seeded from public boundary data, simplified to regency/city level.

```php
Schema::create('regions', function (Blueprint $table) {
    $table->id();
    $table->string('name', 150);            // e.g. "Kabupaten Musi Banyuasin"
    $table->string('province', 100);
    $table->string('slug', 180)->unique();
    $table->decimal('centroid_lat', 9, 5);
    $table->decimal('centroid_lon', 9, 5);
    $table->decimal('area_km2', 12, 2)->nullable();
    $table->timestamps();

    $table->index('province');
});
```

## 3. `region_priority_scores`

Daily priority score calculation results per region (see `Rules.md` §3 for the formula).

```php
Schema::create('region_priority_scores', function (Blueprint $table) {
    $table->id();
    $table->foreignId('region_id')->constrained()->cascadeOnDelete();
    $table->date('score_date');

    $table->decimal('avg_gfw_risk_score', 8, 6)->nullable();
    $table->unsignedInteger('hotspot_count')->default(0);
    $table->decimal('normalized_hotspot_frequency', 6, 5)->default(0);
    $table->unsignedInteger('avg_aqi')->nullable();
    $table->decimal('normalized_aqi_impact', 6, 5)->nullable();

    $table->decimal('priority_score', 6, 5); // final formula result
    $table->enum('priority_rank_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi' // low, medium, high, very high
    ]);

    $table->timestamps();

    $table->unique(['region_id', 'score_date']);
    $table->index('priority_score');
});
```

## 4. `area_check_cache`

Cache for on-demand query results from the "Check Your Area" feature (per coordinate rounded to a certain precision, to reduce repeated API calls for the same location).

```php
Schema::create('area_check_cache', function (Blueprint $table) {
    $table->id();
    $table->decimal('lat_rounded', 7, 3);   // rounded to ~100m precision
    $table->decimal('lon_rounded', 7, 3);

    $table->decimal('gfw_risk_score', 8, 6)->nullable();
    $table->enum('gfw_risk_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na' // low, medium, high, very high, n/a
    ])->default('na');

    $table->unsignedInteger('aqi')->nullable();
    $table->string('nearest_city_name', 100)->nullable();
    $table->decimal('temp_c', 5, 2)->nullable();       // air temperature (°C), IQAir response field `tp`
    $table->decimal('heat_index_c', 5, 2)->nullable(); // perceived temperature (°C), IQAir response field `heatIndex`

    $table->timestamp('cached_at');
    $table->timestamps();

    $table->unique(['lat_rounded', 'lon_rounded']);
});
```

## 5. `gfw_risk_cache`

Cache specifically for GFW analysis results (geostore + tree cover loss) per coordinate, kept separate from `area_check_cache` because its TTL is much longer (historical data, not real-time) and it's shared by both the batch ingest process and the on-demand feature.

```php
Schema::create('gfw_risk_cache', function (Blueprint $table) {
    $table->id();
    $table->decimal('lat_rounded', 7, 3);   // rounded to ~100m precision
    $table->decimal('lon_rounded', 7, 3);

    $table->string('geostore_id', 100)->nullable();
    $table->decimal('buffer_area_ha', 12, 2)->nullable();
    $table->decimal('loss_area_ha', 12, 2)->nullable();
    $table->decimal('loss_percentage', 6, 2)->nullable();
    $table->decimal('risk_score', 6, 5)->nullable();
    $table->enum('risk_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na' // low, medium, high, very high, n/a
    ])->default('na');

    $table->timestamp('cached_at');
    $table->timestamps();

    $table->unique(['lat_rounded', 'lon_rounded']);
});
```

## 6. `data_ingestion_logs`

Scheduled job execution log — important for debugging and transparency of the "data last updated" timestamp shown in the UI.

```php
Schema::create('data_ingestion_logs', function (Blueprint $table) {
    $table->id();
    $table->string('source', 30); // 'firms' | 'gfw' | 'iqair'
    $table->enum('status', ['success', 'partial', 'failed']);
    $table->unsignedInteger('records_processed')->default(0);
    $table->text('error_message')->nullable();
    $table->timestamp('started_at');
    $table->timestamp('finished_at')->nullable();
    $table->timestamps();
});
```

## 7. Table Relations (Summary)

```
regions            1 ── * fire_hotspots
regions            1 ── * region_priority_scores
```

## 8. GFW Risk Score Categorization (Reference)

Based on a sample of 20 coordinate points in fire-prone areas of Kalimantan and Sumatra, tested via the `GfwService` pipeline (`loss_percentage` min 0.43%, max 24.37%, mean 11.79%, median 12.18%, from 19 valid points — 1 point failed and was categorized `na`) within a 5 km buffer radius. Raw per-point data is documented in Appendix A of the competition proposal and in `Progress.md`.

| Category | `loss_percentage` Range | `risk_score` Range (normalized 0–1) |
|---|---|---|
| Low | 0% – 13% | 0 – 0.37 |
| Medium | 13% – 18% | 0.37 – 0.51 |
| High | 18% – 23% | 0.51 – 0.66 |
| Very High | 23% – 35%+ | 0.66 – 1.0 |
| N/A | GFW query failed / geostore could not be created | — |

These thresholds are defined in a single place (`config/ember.php`), **not** hardcoded repeatedly across the codebase — see `Rules.md` §2.

**Limitation note:** these thresholds are calculated from a random sample of 20 points, not a full census or multi-year historical data. This is defensible and well-documented for the needs of this competition's MVP, but can be updated with a larger sample (50–100 points) in a future iteration if higher statistical precision is needed.
