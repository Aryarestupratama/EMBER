# Business Rules Document (Rules) — EMBER
**Early Monitoring for Burning Environment & Reforestation**

This document defines the business rules, formulas, and constraints binding the implementation — both domain rules (scoring) and competition compliance rules.

## Revision History

| Date | Change |
|---|---|
| September 6, 2026 | The forest/land fire risk data source was switched from BNPB InaRISK to Global Forest Watch (GFW) after BNPB server instability was confirmed over 3 consecutive days of testing. All formulas and thresholds in this document were updated to follow the new data source. See `Analisa-Sumber-Data-Alternatif.md` for investigation details and the decision justification. |
| September 12, 2026 | The calibration sample statistics in §2 were updated. The previous 20-point sample (min 0.63%, max 33.88%, mean 18.22%, median 21.09%) had no raw per-point data stored — only aggregate statistics recorded in `Progress.md`. The sample was re-tested through the already-running `GfwService` pipeline, using 20 real coordinate points in fire-prone areas of Kalimantan and Sumatra. The raw data for these 20 points is fully documented in Appendix A of the competition proposal. The maximum normalization scale (35%) **did not change** and remains valid against this new data. |

---

## 1. Competition Compliance (Non-negotiable)

1. **Originality.** This project is built from scratch: new code, database, and design. No reuse from any team project that has won another competition.
2. **No duplicate submissions.** The project is not currently being/will not be submitted to another competition simultaneously.
3. **Third-party licensing.** All third-party libraries, APIs, and data used (Laravel, React, Leaflet, NASA FIRMS, Global Forest Watch, IQAir, GADM) are credited with their source in the repository README and the `/about` page.
4. **Source code on GitHub**, containing: source code, README, installation instructions, technology stack, and technical documentation (including these documents).
5. **Proposal maximum 15 pages** (excluding cover & appendices) — see the proposal checklist in `Progress.md`.
6. **Submission deadline:** September 20, 2026.

## 2. GFW Risk Classification Rules (Tree Cover Loss)

Single source of truth for thresholds — defined as constants in `config/ember.php`, used consistently in the backend (for storing categories) and frontend (for labels/colors):

```php
const GFW_RISK_THRESHOLDS = [
    'rendah'        => [0.00, 0.37],   // low
    'sedang'        => [0.37, 0.51],   // medium
    'tinggi'        => [0.51, 0.66],   // high
    'sangat_tinggi' => [0.66, 1.00],   // very high
];
```

- The risk score (`risk_score`) is derived from the **percentage of tree cover loss** within a 5 km buffer radius around the hotspot point, normalized with the formula:

  ```
  risk_score = min(loss_percentage / 35, 1)
  ```

  The maximum scale of **35%** was set to allow headroom above the maximum value observed in the test sample, to accommodate areas with a higher level of forest cover loss that the platform may encounter while operating.
- A `null` value (GFW query failed, geostore could not be created, or data unavailable) is **always** categorized as `na`, never treated as 0 (low risk) — because an API failure means "data could not be retrieved," not "zero risk."
- These thresholds are sourced from testing a sample of 20 coordinate points in fire-prone areas of Kalimantan and Sumatra via the `GfwService` pipeline (19 points produced valid data, 1 point failed and was categorized `na`): min 0.43%, max 24.37%, mean 11.79%, median 12.18%. Raw per-point data is documented in Appendix A of the competition proposal and in `Progress.md`, and its methodology can be explained during the judges' Q&A session.
- The **5 km buffer radius** was determined through empirical testing against 3 km, 5 km, and 10 km radii on several real hotspot points — 5 km was chosen because it gives the best balance between capturing surrounding area context and preserving discriminative power between regions.

## 3. Priority Score Formula (Region)

Calculated daily per region (`regions`), stored in `region_priority_scores`.

```
Priority_Score = (0.4 × Norm_GFW_Risk)
               + (0.4 × Norm_Hotspot_Frequency)
               + (0.2 × Norm_AQI_Impact)
```

**Components:**

1. **Norm_GFW_Risk** — the average `gfw_risk_score` of all hotspots in that region for the current period. This score is already normalized to 0–1 at the per-point level (see §2), so the regional average automatically falls within the 0–1 scale as well.

   > **Handling nulls at the region aggregation level:** if a region has active hotspots but *all* of them fail GFW enrichment (`gfw_risk_score` is null for every point), that region is **skipped** in that day's calculation — rather than defaulted to a risk contribution of 0. This differs from a region that genuinely has no hotspots at all in the current period, where a contribution of 0 is indeed valid (no fire signal to average, not a data retrieval failure). The null ≠ 0 principle from §2 also applies at this aggregation level, not just at the individual hotspot level.

2. **Norm_Hotspot_Frequency** — the number of hotspots in that region over the last 7 days, normalized against the region with the highest hotspot count in the same period (relative min-max normalization, not a fixed absolute scale — since the national hotspot count fluctuates seasonally).

3. **Norm_AQI_Impact** — the average AQI of the cities related to that region, normalized against the standard AQI scale (0–500 US EPA AQI scale, capped at 300 for normalization purposes since values above that are rare & extreme).

**Weight justification (0.4 / 0.4 / 0.2):** historical deforestation risk (a proxy for recurring forest/land fire risk) and actual hotspot activity are given equal weight as the primary indicators (both are primary data, directly tied to fire events), while AQI is given a lower weight as a secondary impact indicator (influenced by many other factors beyond forest/land fires, such as vehicles/industry).

**Final category** (`priority_rank_category`) uses the same thresholds as §2 (low/medium/high/very high), applied to the final `priority_score`.

## 4. Data Freshness Rules

| Process | Frequency / TTL |
|---|---|
| FIRMS hotspot ingest | Every 6 hours |
| `region_priority_scores` calculation | Once per day (after that day's final ingest completes) |
| `gfw_risk_cache` cache | 30 days — much longer than other caches because tree cover loss data is historical and doesn't change quickly (GFW's source dataset update is annual/weekly, not real-time) |
| `area_check_cache` cache | 12 hours — if a user checks the same location within this window, data is served from cache instead of calling the API again |

Every page that displays data must show a **"data last updated" timestamp**, taken from `data_ingestion_logs`.

## 5. Failure Handling Rules

(See also Architecture.md §6)

- A failure in one data source **must not** fail the entire ingest process — jobs run per source, logged independently in `data_ingestion_logs`.
- If GFW/IQAir fails during new hotspot ingest, the hotspot is still saved with `gfw_risk_category = 'na'` / `nearest_city_aqi = null`, and is **re-enriched** on the next ingest job (not lost).
- The frontend never shows a fake default number (e.g. `0`) for data that failed to be fetched — it always shows a "data unavailable" status.
- A failure processing 1 hotspot point within an ingest batch does not stop processing of other points; the batch continues and the final status is recorded as `partial` in `data_ingestion_logs`.

## 6. Content & Framing Rules (Editorial)

- No text on the platform blames a specific party (government, palm oil industry, etc.) for forest/land fires. All narrative is data-based and neutral.
- Recommendations shown to users are **general and medically/safety defensive** (e.g., "reduce outdoor activity"), not specific policy recommendations.
- The `/about` page must include a data limitations disclaimer, including: the risk score is a proxy based on historical deforestation data (not an official government prediction), the 5 km analysis radius, and potential satellite data delay.

## 7. Code Naming Rules (Technical Convention)

- Service class per data source: `{Source}Service` (`FirmsService`, `GfwService`, `IqairService`) — no HTTP call logic is allowed outside these classes (no direct `Http::get()` in controllers/jobs).
- Scheduled job: `{Action}Job` (`IngestFireHotspotsJob`, `CalculateRegionPriorityJob`).
- All threshold values are defined as constants/config, never a *magic number* directly in the logic.
