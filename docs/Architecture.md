# Architecture Document — EMBER
**Early Monitoring for Burning Environment & Reforestation**

This document describes the final technical architecture of the EMBER system, covering the technology stack, system design principles, external data sources, data pipeline flow, project structure, failure handling, and security aspects.

## Revision History

| Date | Change |
|---|---|
| September 6, 2026 | The forest/land fire risk data source was switched from BNPB InaRISK (ArcGIS REST) to the Global Forest Watch (GFW) Data API, after 3 consecutive days of testing showed BNPB server instability (timeouts, 503 errors, Web Adaptor failures). Investigation details are documented in `Analisa-Sumber-Data-Alternatif.md`. This document represents the final post-migration architecture. |
| September 8, 2026 | Discovered and fixed a region-seeding data quality issue for 5 regencies/cities in North Kalimantan (see §3.4). |
| September 16, 2026 | Mitigation recommendation text content (previously `MITIGATION_CONTENT` in `config/ember.php`) was moved to the frontend (`resources/js/lib/i18n/translations.js`) so it participates in the Indonesian/English toggle. `MitigationHelper.php` (§5) now only determines the category (`fire_risk_category`, `air_quality_category`), and no longer reads/returns ready-to-display text. See `Progress.md` §10 for details on this decision. |
| September 19, 2026 | `IqairService::nearestCity()` was extended to capture the `weather.tp` field (air temperature, °C) and `weather.heatIndex` field (perceived/"feels like" temperature, °C) from the `nearest_city` response — previously only `aqius`/`city`/`state` were captured, even though these fields had been available in the response all along without needing an additional endpoint (see §3.3). The data is stored in `fire_hotspots` (new columns `nearest_city_temp_c`, `nearest_city_heat_index_c`) and `area_check_cache` (`temp_c`, `heat_index_c`) — see `Schema.md` for column definitions. Older hotspots already ingested before this change were partially backfilled (265 of 1,960 high/very-high risk category hotspots) via the `ember:backfill-temperature` command, which was stopped early due to limitations on long-running background processes in the shared hosting environment (jailshell/CloudLinux tends to kill long-running `nohup` processes) as well as the IQAir Community Plan rate limit (5 requests/minute, 500/day), which made a full backfill of 1,960 points unrealistic to complete before the deadline. The remaining older hotspots stay permanently `null` (unless re-detected by FIRMS in a subsequent ingest cycle) — consistent with the null ≠ 0 principle (Rules.md §2). New hotspots going forward are automatically complete with no further action needed, since this field is already integrated directly into `IngestFireHotspotsJob` and `AreaCheckController`. In addition, the OpenAQ API was evaluated as a candidate additional/comparison air quality data source to IQAir, but was not adopted after testing showed station coverage in Indonesia totals only 5 points nationwide — deemed too sparse to support the aggregation needs of the 502 regencies/cities in `regions`, so the decision was made to continue relying entirely on IQAir as the sole air quality/weather data source. |

---

## 1. Technology Stack Summary

| Layer | Technology |
|---|---|
| Backend | Laravel (PHP) |
| Frontend | React via Inertia.js |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI, Nova preset) |
| Database | MySQL / PostgreSQL (via Eloquent ORM) |
| Maps | Leaflet.js (via react-leaflet + react-leaflet-cluster for marker clustering) |
| Scheduling | Laravel Task Scheduling + Queue |
| Hosting | VPS/shared hosting supporting Laravel |

**Originality note:** EMBER is a project built from scratch. No code, database, or backend is reused from any other project.

**Styling convention:** All color and size tokens (risk palette, brand colors, statistic text sizes — see Design.md §2–3) are defined once as CSS custom properties in `resources/css/app.css` using the `@theme` directive (Tailwind v4), rather than being repeated across components. This principle is consistent with the same single-source-of-truth approach used for risk thresholds in `config/ember.php` (see Rules.md §7).

**Z-index convention (overlay primitives):** `MapView` (Leaflet) has internal panes/controls with default z-index values up to 700, while the project's overlay primitives (`components/ui/dialog.jsx`, `components/ui/tooltip.jsx`) are portaled to `document.body`, placing them directly alongside that pane as siblings rather than following normal DOM render order. To prevent overlays (modals, tooltips) from being inconsistently hidden behind the map, the z-index order is set once in the shared primitives:

| Component | z-index |
|---|---|
| `DialogOverlay` | `999` |
| `DialogContent` | `1000` |
| `TooltipContent` (Positioner + Popup) | `1100` |

These values must never be lowered or overridden below 700 in any usage.

## 2. Architecture Principles

1. **Cache-first against external APIs.** There are no live calls to NASA FIRMS, GFW, or IQAir when a user opens a page. All data is fetched by scheduled jobs, stored in the local database, and served from there. This approach avoids rate limits, speeds up load times, and makes the demo independent of external API uptime.
2. **Separation of Service per data source.** Each external API has its own Service class, making it easy to test and replace/extend in the future.
3. **Graceful degradation.** If one data source fails to fetch, the system still displays the other two, with a "data unavailable" indicator on the failed part — rather than causing the entire page to fail to render.

## 3. Data Sources & Endpoints (Verified)

### 3.1 NASA FIRMS

- **Base URL:** `https://firms.modaps.eosdis.nasa.gov/api/`
- **Endpoint used:** Area (bounding box). The `country` endpoint is not used because it proved to fail for complex archipelagic countries like Indonesia (timeouts / `invalid api call`).

  ```
  GET /api/area/csv/{MAP_KEY}/{SENSOR}/{west,south,east,north}/{days}
  ```

  - Indonesia bounding box: `95,-11,141,6`
  - Default sensor: `MODIS_NRT` (or `VIIRS_NOAA20_NRT` for higher resolution)

- **Response columns:** `latitude, longitude, brightness, scan, track, acq_date, acq_time, satellite, instrument, confidence, version, bright_t31, frp, daynight`
- **Rate limit:** 5,000 transactions / 10 minutes per MAP_KEY
- **Authentication:** MAP_KEY (registered for free via email)

### 3.2 Global Forest Watch (GFW) Data API

- **Base URL:** `https://data-api.globalforestwatch.org/`
- **Authentication:** API key (self-registered via `/auth/sign-up` → `/auth/token` → `/auth/apikey`, valid for 1 year)

**Rationale for data source selection:**
GFW provides tree cover loss data (`umd_tree_cover_loss` dataset, based on Hansen/GLAD) that is infrastructurally stable (backed by WRI and the Bezos Earth Fund) and can be accessed independently without a partner approval process. GFW fire alerts (`nasa_viirs_fire_alerts`) are not used because they fully duplicate the VIIRS sensor already used by NASA FIRMS.

**Risk score concept:**
Since GFW does not provide a predictive per-point risk score like BNPB InaRISK, EMBER derives the risk score from the **percentage of historical tree cover loss within a 5 km radius** around each hotspot point — the higher the percentage of historical deforestation around a point, the higher the recurring forest/land fire risk score for that area.

**Call flow (2 stages):**

1. **Create a geostore** (buffer polygon with a 5 km radius around the point):

   ```
   POST /geostore
   Body: { "geometry": { "type": "Polygon", "coordinates": [[...]] } }
   ```

   Relevant response: `data.gfw_geostore_id`, `data.gfw_area__ha`

2. **Query tree cover loss** within that geostore:

   ```
   GET /dataset/umd_tree_cover_loss/latest/query/json
     ?sql=SELECT SUM(area__ha) as loss_area FROM data WHERE umd_tree_cover_loss__year >= 2015
     &geostore_id={geostore_id}
     &geostore_origin=gfw
   ```

   Relevant response: `data[0].loss_area` (hectares)

**Risk score formula:**

```
loss_percentage = (loss_area / buffer_area_ha) * 100
risk_score = min(loss_percentage / 35, 1)   // 35% = maximum normalization scale, see Rules.md §2
```

**Empirically determined parameters:**

- **Buffer radius (5 km):** determined through testing against 3 km, 5 km, and 10 km radii on several real hotspot points. A 5 km radius gives the best balance between capturing surrounding context and preserving discriminative power between regions — a 10 km radius was found to blur local signal. Full test logs are documented in `Progress.md`.
- **Loss calculation start year (2015):** a 10+ year window was chosen to adequately capture recurring deforestation trends without being overly biased toward very old events.

### 3.3 IQAir AirVisual API

- **Base URL:** `https://api.airvisual.com/v2/`
- **Endpoint used:**

  ```
  GET /nearest_city?lat={LAT}&lon={LON}&key={API_KEY}
  ```

- **Tier:** Free (Community Plan) — quota sufficient for MVP needs (daily batch for priority regions + on-demand for the "Check Your Area" feature, with caching). Limits: 5 requests/minute, 500 requests/day, 10,000 requests/month.
- **Key fields from the response:** `data.current.pollution.aqius`, `data.city`, `data.state`, `data.current.weather.tp` (actual air temperature, °C), `data.current.weather.heatIndex` (perceived/"feels like" temperature, °C — accounts for humidity). The temperature fields come from the same response as the AQI, requiring no separate endpoint call (see the September 19, 2026 revision note).
- **Authentication:** API key (registered for free via `iqair.com/dashboard/api`)

### 3.4 GADM (Database of Global Administrative Areas)

- **Source:** `https://gadm.org` (version 4.1, Adm2 level — regency/city)
- **Purpose:** provides a list of Indonesia's administrative regions (regencies/cities) with centroid coordinates, used as the aggregation unit for the `regions` table and the per-region Priority Score calculation.
- **Access method:** data was downloaded once manually in GeoJSON format (level 2), processed locally (region name extraction + geometric centroid calculation using the `shapely` library), then generated into a Laravel seeder (`RegionSeeder`). GADM does not provide a public REST endpoint for programmatic queries, so this process was done as a one-time data preparation step at the start of development — not part of a scheduled job.
- **Coverage:** 502 regencies/cities across Indonesia.
- **Known limitation:** hotspot-to-region reverse lookup uses a **nearest-centroid** approach (Haversine distance to the nearest regency/city center point, maximum radius 100 km), rather than precise point-in-polygon matching against actual region boundaries. This trade-off is accepted for MVP needs — accurate enough for regency/city-level aggregation, but may potentially misassign points that are very close to the boundary line between two regions.
- **Data quality note:** 5 regencies/cities in the province of North Kalimantan (Bulungan, Malinau, Nunukan, Tana Tidung, Tarakan) were briefly seeded with incorrect names ("NA {name}") because the `TYPE_2` field (region type: Regency/City) was empty in the GADM v4.1 GeoJSON source specifically for this province — likely because North Kalimantan is the youngest province (split off from East Kalimantan in 2012), so GADM metadata for this province is not yet as complete as for other provinces. This issue has been manually fixed in the database and `RegionSeeder.php`, and is noted as a known limitation in case a similar pattern is found in other provinces during further data validation.

## 4. Data Flow (Pipeline)

### 4.1 Scheduled Job — Ingest Hotspots (every 6 hours)

```
1. FirmsService::fetchIndonesiaHotspots()
   → GET area/csv for Indonesia bbox
   → parse CSV → array of hotspot rows

2. For each hotspot:
   GfwService::getRiskScore(lat, lon)
   → Check the database cache (gfw_risk_cache, 30-day TTL) first
   → If not present/expired: create geostore → query tree cover loss → compute score
   → Save/update to cache

3. Classify risk_score → risk_category (see Rules.md §2 for thresholds)

4. Assign region_id using nearest-centroid (Haversine) against
   the already-seeded GADM region data (see §3.4)

5. Save/upsert to the fire_hotspots table

6. For hotspots in the high/very-high category:
   IqairService::nearestCity(lat, lon)
   → save aqi, city name, air temperature, & perceived temperature (heat index) to the related record
```

### 4.2 Scheduled Job — Calculate Region Priority Score (daily)

```
1. Aggregate fire_hotspots per administrative region (regency/city):
   - average gfw_risk_score
   - hotspot count (frequency, normalized)
   - average related region AQI (if available)

2. Compute Priority_Score (see Rules.md §3 for formula & weights)

3. Save/upsert to the region_priority_scores table
```

### 4.3 "Check Your Area" Feature (on-demand, user request)

**Optional location input via Google Maps link:** before the flow below, a user can paste a Google Maps link (short link `maps.app.goo.gl` or full link) into `AreaCheck.jsx`. The frontend calls `POST /area-check/resolve-maps-link` → `GoogleMapsLinkService` resolves the link (following the entire redirect chain with a mobile-browser `User-Agent` header, to avoid falling back to server-IP-based location) into `{lat, lon}` → the frontend proceeds to the normal flow below as if the user had clicked directly on that point on the map.

```
1. User submits a location (lat, lon) via search / map click / browser geolocation / Google Maps link

2. Backend:
   a. Query local fire_hotspots (Haversine) → hotspots within radius R km
   b. Check the GfwService cache for this point (30-day cache TTL, see Rules.md §4)
      → if absent, call geostore + on-demand query, save to cache
   c. Check the IqairService cache for this point (few-hour cache TTL)
      → if absent, call nearest_city() on-demand (aqi + temp + heat index), save to cache

3. Combine results → send response to frontend
4. Frontend renders the summary card + map zoomed to the location
```

## 5. Laravel Project Structure (Summary)

```
app/
  Domains/
    FireMonitoring/
      Services/
        FirmsService.php
        GfwService.php
        IqairService.php
        GoogleMapsLinkService.php
        MitigationHelper.php   # not an HTTP service (no external API calls) — looks up
                                # risk/AQI mitigation categories; text is rendered on the frontend
      Jobs/
        IngestFireHotspotsJob.php
        CalculateRegionPriorityJob.php
      Models/
        FireHotspot.php
        RegionPriorityScore.php
        Region.php
        GfwRiskCache.php
        DataIngestionLog.php
  Http/
    Controllers/
      DashboardController.php
      AreaCheckController.php
      RegionDetailController.php
      RegionCompareController.php
resources/
  js/
    lib/
      i18n/
        translations.js       # ID/EN translation dictionary, single source of truth
        LanguageContext.jsx    # React Context + useLanguage() hook
    Layouts/
      AppLayout.jsx
    Pages/
      Landing.jsx
      Dashboard.jsx
      AreaCheck.jsx
      RegionDetail.jsx
      About.jsx
    Components/
      Navbar.jsx
      Footer.jsx
      MapView.jsx
      RiskBadge.jsx
      SummaryCard.jsx
      CompareTrigger.jsx
      CompareModal.jsx
      LanguageToggle.jsx
      ui/
        navigation-menu.jsx
routes/
  web.php   # includes GET /api/regions/compare (JSON, called via fetch from
            # CompareModal.jsx, not an Inertia visit — compares the latest
            # priority_score of 2-3 regions at once)
database/
  migrations/
```

## 6. Failure Handling & Edge Cases

| Condition | Handling |
|---|---|
| GFW query fails / no data | Save `risk_score = null`, `risk_category = 'na'` — displayed as "Risk data unavailable" |
| FIRMS API timeout / limit | Job is retried with backoff; falls back to the last cached data if it still fails |
| IQAir quota exhausted | Falls back to old cached data (shows a "data last updated" timestamp) |
| User coordinates outside Indonesia | Validated at the start of the request; shows a message that the service focuses on the Indonesia region |
| Failure of 1 point during batch ingest | Does not fail the entire batch — recorded as a `partial` status in `data_ingestion_logs`, other points are still processed |

## 7. Security & Credentials

- All API keys (FIRMS MAP_KEY, GFW API key, IQAir key) are stored in `.env`, never committed or exposed to the frontend.
- Internal rate limiting is applied on the "Check Your Area" endpoint to prevent abuse of external API quotas (e.g., 1 request per IP per few seconds).
