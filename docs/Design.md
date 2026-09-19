# Design Document — EMBER
**Early Monitoring for Burning Environment & Reforestation**

This document defines the design direction of the EMBER product: positioning, visual system (color & typography), page structure, UI components, and accessibility and data attribution rules.

---

## 1. Positioning & Tone

EMBER is a **data-driven** platform, not a campaign or lifestyle platform. The design must feel credible and calm — conveying urgency without feeling alarmist or blaming any particular party.

The layout style reference is drawn from Reforestum (landing page structure, typographic cleanliness), with adjustments:
- The hero section shows a **real product (a live map)**, not a decorative illustration.
- The color palette is aimed at an "official monitoring instrument" feel, not a "casual consumer product" feel.

## 2. Color Palette

| Role | Color | Usage |
|---|---|---|
| Primary (Forest) | Dark green `#1B4332` – `#2D6A4F` | Header, brand elements, "safe/low risk" areas |
| Secondary (Fresh Green) | `#40916C` – `#74C69D` | Button accents, solution/reforestation elements |
| Alert — High | `#E85D04` (ember orange) | High risk category |
| Alert — Critical | `#D00000` (ember red) | Very high risk category |
| Neutral | `#F8F9FA`, `#343A40` | Background, text |
| Info | `#FFD60A` (amber yellow) | Medium risk category, data highlights |

**Usage principle:** red/orange colors are used **only** for risk/data indicators, not for decorative UI elements — so the visual urgency stays meaningful and doesn't "cry wolf."

## 3. Typography

- **Titles/headings:** bold sans-serif (e.g. Inter/Poppins Bold) — modern & technical feel.
- **Body text:** regular sans-serif, high contrast for numeric data readability.
- **Large numbers/statistics** (scores, AQI, hotspot counts): use tabular numerals to stay neat during live updates.

## 4. Page Structure

### 4.1 Landing Page (`/`)

1. **Hero** — short headline + mission summary + live map preview (small embed or real dashboard screenshot) + "Open Dashboard" CTA
2. **The Problem** — short live statistics (automatic from data): number of hotspots detected today, number of high-risk regions
3. **How it Works** — 3 steps: Monitor (FIRMS) → Analyze (data-driven risk score based on GFW deforestation data) → Act (region recommendations & location check)
4. **Data Sources** — NASA FIRMS, Global Forest Watch, IQAir logos/names as trust signals, with a brief explanation of each one's credibility
5. **Closing CTA** — drives users to "Check Your Area" or "Open Dashboard"

### 4.2 Dashboard (`/dashboard`)

- **Large search bar** above the map — "Check your area..." (with city autocomplete)
- **National interactive map** (Leaflet) — hotspot markers/clusters colored by risk category
- **Statistics panel** (3–4 small cards): total active hotspots, high-risk regions, city with the current worst AQI, last data update time
- **Ranking panel** — list of regions with the highest Priority Score (5–10 regions), each item clickable to go to the detail page. Compare mode is not always shown — it is triggered via a "Compare Regions" button in the panel header, which only then reveals per-item checkboxes (maximum 3 regions at once) along with a brief usage guide, so the default view stays clean for users who don't intend to compare. Selecting ≥2 regions triggers `CompareTrigger` then `CompareModal` (see §6) without leaving the Dashboard page
- **Filters** — date, risk category, province

### 4.3 Location Detail Page (`/area/{id}`)

- Main summary card (see wireframe in §5)
- Map zoomed to the region with surrounding hotspots
- Score breakdown: contribution of deforestation risk (GFW) vs. hotspot frequency vs. AQI impact
- Contextual action recommendations (short text, not generic)

### 4.4 Methodology Page (`/about`)

- Explanation of the 3 data sources and how the priority score is calculated, including a statement that the risk score is a **proxy based on historical deforestation data** (GFW tree cover loss within a 5 km radius), not an official prediction from a government agency
- Disclaimer on data limitations (5 km analysis radius, potential satellite data delay, threshold based on an initial test sample, etc.)
- Statement of platform neutrality (data-driven, not policy advocacy)

## 5. Wireframe — "Check Your Area" Summary Card

```
┌─────────────────────────────────────────┐
│ 📍 Palembang, South Sumatra               │
│                                           │
│ 🔥 Forest/Land Fire Risk Status          │
│    ●●●●○  HIGH (score 0.72)              │
│    based on historical deforestation data│
│                                           │
│ 🌫️ Current Air Quality                    │
│    AQI 156 — Unhealthy                   │
│                                           │
│ 📡 Nearest Hotspots                      │
│    3 points within a 25 km radius        │
│    Nearest: 8 km from your location      │
│                                           │
│ 💡 Recommendation                        │
│    Reduce outdoor activity.              │
│    This region is high priority for      │
│    monitoring & fire mitigation.         │
│                                           │
│    [ View on Map ]  [ Region Detail ]    │
└─────────────────────────────────────────┘
```

## 6. Key UI Components

| Component | Function |
|---|---|
| `Navbar` | Main navigation, used via `AppLayout` across all pages (not duplicated per page). Transparent while at the very top of the page (blending with the hero/canvas), becomes solid (`bg-white/80` + `backdrop-blur-md`) once scrolled, so text stays readable over whatever content is behind it — including `MapView`, whose stacking (Leaflet pane/controls) is deliberately placed below the navbar. The active item is marked with an underline; other items get an underline on hover. Built on top of the `NavigationMenu` primitive (shadcn/ui, Base UI preset) |
| `Footer` | Data source attribution (see §8), used via `AppLayout`. Has a dark variant for use over `bg-forest-dark` (Landing), and a light variant for other pages |
| `RiskBadge` | Color badge + risk category label (Low/Medium/High/Very High/N/A), used consistently across all pages. The N/A category is rendered differently **structurally**, not just by a different color — a dashed border and a question-mark icon replace the solid dot, so it isn't mistaken for a "pale version of low risk" (reinforcing the null ≠ 0 principle from Rules.md §2) |
| `MapView` | Leaflet wrapper, accepts hotspot list & mode props (national / location-zoom / selectable) |
| `SummaryCard` | "Check Your Area" result card |
| `RegionRankingList` | List of priority regions, clickable. Compare mode (checkboxes + brief guide) is hidden by default, only shown after the "Compare Regions" header button is pressed — progressive disclosure to keep the default view clean |
| `StatTile` | Small statistic card for the dashboard, explicitly showing a "Data unavailable" status for empty values |
| `ScoreBreakdown` | Visualization of each Priority Score formula component's contribution (risk/frequency/AQI) with a progress bar proportional to each weight; unavailable data components are marked with a striped pattern, not shown as 0% |
| `SourceCredit` | Small component displaying data source attribution (used in the footer/map) |
| `CompareTrigger` | Floating (sticky) bar below `RegionRankingList`, appears when ≥2 regions are checked for comparison; shows chips of selected region names (removable one at a time) and a "Compare" button |
| `CompareModal` | Overlay dialog rendering 2–3 `ScoreBreakdown` instances side by side for the selected regions, loading data via a lightweight endpoint without a page reload |

## 7. Accessibility & Language

- The UI uses Indonesian as the default, with an English toggle that covers **the entire site and all components** (not just the landing page & risk category labels as originally planned — expanded on September 16, 2026, see `Progress.md` §10) for an international jury audience.
- Risk category color contrast is tested to remain distinguishable for colorblind users (not relying on color alone — always accompanied by a text label/icon).
- All map elements have text/table data alternatives for basic accessibility.

## 8. Data Attribution (Mandatory Display)

Because EMBER relies entirely on official third-party data, attribution must be clearly displayed in the footer of every page that shows data:

> Hotspot data: NASA FIRMS · Deforestation risk data: Global Forest Watch · Air quality data: IQAir · Administrative boundary data: GADM v4.1
