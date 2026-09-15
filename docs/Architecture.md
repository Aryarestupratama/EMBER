# Architecture Document — EMBER
**Early Monitoring for Burning Environment & Reforestation**

Dokumen ini mendeskripsikan arsitektur teknis final sistem EMBER, mencakup stack teknologi, prinsip desain sistem, sumber data eksternal, alur pipeline data, struktur proyek, penanganan kegagalan, dan aspek keamanan.

## Riwayat Revisi

| Tanggal | Perubahan |
|---|---|
| 6 September 2026 | Sumber data risiko karhutla dialihkan dari BNPB InaRISK (ArcGIS REST) ke Global Forest Watch (GFW) Data API, setelah pengujian 3 hari berturut-turut menunjukkan instabilitas server BNPB (timeout, error 503, kegagalan Web Adaptor). Detail investigasi didokumentasikan pada `Analisa-Sumber-Data-Alternatif.md`. Dokumen ini merepresentasikan arsitektur final pasca-migrasi. |
| 8 September 2026 | Ditemukan dan diperbaiki isu kualitas data seeding wilayah untuk 5 kabupaten/kota di Kalimantan Utara (lihat §3.4). |
| 16 September 2026 | Konten teks rekomendasi mitigasi (sebelumnya `MITIGATION_CONTENT` di `config/ember.php`) dipindahkan ke frontend (`resources/js/lib/i18n/translations.js`) supaya ikut toggle Bahasa Indonesia/Inggris. `MitigationHelper.php` (§5) kini hanya menentukan kategori (`fire_risk_category`, `air_quality_category`), tidak lagi membaca/mengembalikan teks siap-tampil. Lihat `Progress.md` §10 untuk detail keputusan. |

---

## 1. Ringkasan Stack Teknologi

| Layer | Teknologi |
|---|---|
| Backend | Laravel (PHP) |
| Frontend | React via Inertia.js |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI, preset Nova) |
| Database | MySQL / PostgreSQL (via Eloquent ORM) |
| Peta | Leaflet.js (via react-leaflet + react-leaflet-cluster untuk clustering marker) |
| Scheduling | Laravel Task Scheduling + Queue |
| Hosting | VPS/shared hosting yang mendukung Laravel |

**Catatan orisinalitas:** EMBER adalah proyek yang dibangun dari nol. Tidak ada kode, database, atau backend yang di-reuse dari proyek lain.

**Konvensi styling:** Seluruh token warna dan ukuran (palet risiko, warna brand, ukuran teks statistik — lihat Design.md §2–3) didefinisikan satu kali sebagai CSS custom property di `resources/css/app.css` menggunakan direktif `@theme` (Tailwind v4), bukan ditulis berulang di tiap komponen. Prinsip ini konsisten dengan pendekatan single source of truth yang sama untuk threshold risiko di `config/ember.php` (lihat Rules.md §7).

**Konvensi z-index (overlay primitives):** `MapView` (Leaflet) memiliki pane/kontrol internal dengan z-index bawaan hingga 700, sementara primitive overlay proyek (`components/ui/dialog.jsx`, `components/ui/tooltip.jsx`) di-portal ke `document.body` sehingga berada sejajar (sibling) langsung dengan pane tersebut, bukan mengikuti urutan render DOM biasa. Untuk mencegah overlay (modal, tooltip) tertutup peta secara tidak konsisten, urutan z-index ditetapkan satu kali di primitive bersama:

| Komponen | z-index |
|---|---|
| `DialogOverlay` | `999` |
| `DialogContent` | `1000` |
| `TooltipContent` (Positioner + Popup) | `1100` |

Nilai ini tidak boleh diturunkan atau di-override menjadi lebih rendah dari 700 pada pemakaian manapun.

## 2. Prinsip Arsitektur

1. **Cache-first terhadap API eksternal.** Tidak ada pemanggilan live ke NASA FIRMS, GFW, atau IQAir saat pengguna membuka halaman. Seluruh data diambil oleh scheduled job, disimpan di database lokal, lalu disajikan dari sana. Pendekatan ini menghindari rate-limit, mempercepat waktu muat, dan membuat demo tidak bergantung pada uptime API eksternal.
2. **Pemisahan Service per sumber data.** Setiap API eksternal memiliki Service class tersendiri agar mudah diuji dan diganti/ditambah di masa depan.
3. **Degradasi anggun (graceful degradation).** Jika satu sumber data gagal diambil, sistem tetap menampilkan dua sumber lainnya, dengan indikator "data tidak tersedia" pada bagian yang gagal — bukan menyebabkan seluruh halaman gagal render.

## 3. Sumber Data & Endpoint (Terverifikasi)

### 3.1 NASA FIRMS

- **Base URL:** `https://firms.modaps.eosdis.nasa.gov/api/`
- **Endpoint digunakan:** Area (bounding box). Endpoint `country` tidak digunakan karena terbukti gagal untuk negara kepulauan kompleks seperti Indonesia (timeout / `invalid api call`).

  ```
  GET /api/area/csv/{MAP_KEY}/{SENSOR}/{west,south,east,north}/{hari}
  ```

  - Bounding box Indonesia: `95,-11,141,6`
  - Sensor default: `MODIS_NRT` (atau `VIIRS_NOAA20_NRT` untuk resolusi lebih tinggi)

- **Kolom response:** `latitude, longitude, brightness, scan, track, acq_date, acq_time, satellite, instrument, confidence, version, bright_t31, frp, daynight`
- **Rate limit:** 5.000 transaksi / 10 menit per MAP_KEY
- **Autentikasi:** MAP_KEY (didaftarkan gratis via email)

### 3.2 Global Forest Watch (GFW) Data API

- **Base URL:** `https://data-api.globalforestwatch.org/`
- **Autentikasi:** API key (didaftarkan mandiri via `/auth/sign-up` → `/auth/token` → `/auth/apikey`, berlaku 1 tahun)

**Alasan pemilihan sumber data:**
GFW menyediakan data tree cover loss (dataset `umd_tree_cover_loss`, berbasis Hansen/GLAD) yang stabil secara infrastruktur (didukung WRI dan Bezos Earth Fund) dan dapat diakses mandiri tanpa proses approval partner. Fire alerts GFW (`nasa_viirs_fire_alerts`) tidak digunakan karena duplikat penuh dengan sensor VIIRS yang sudah digunakan NASA FIRMS.

**Konsep skor risiko:**
Karena GFW tidak menyediakan skor risiko prediktif per titik seperti BNPB InaRISK, EMBER menurunkan skor risiko dari **persentase tree cover loss historis dalam radius 5 km** di sekitar tiap titik hotspot — semakin tinggi persentase deforestasi historis di sekitar suatu titik, semakin tinggi skor risiko karhutla berulang di area tersebut.

**Alur pemanggilan (2 tahap):**

1. **Membuat geostore** (buffer polygon radius 5 km di sekitar titik):

   ```
   POST /geostore
   Body: { "geometry": { "type": "Polygon", "coordinates": [[...]] } }
   ```

   Response relevan: `data.gfw_geostore_id`, `data.gfw_area__ha`

2. **Query tree cover loss** dalam geostore tersebut:

   ```
   GET /dataset/umd_tree_cover_loss/latest/query/json
     ?sql=SELECT SUM(area__ha) as loss_area FROM data WHERE umd_tree_cover_loss__year >= 2015
     &geostore_id={geostore_id}
     &geostore_origin=gfw
   ```

   Response relevan: `data[0].loss_area` (hektar)

**Formula skor risiko:**

```
loss_percentage = (loss_area / buffer_area_ha) * 100
risk_score = min(loss_percentage / 35, 1)   // 35% = skala maksimum normalisasi, lihat Rules.md §2
```

**Parameter yang ditentukan secara empiris:**

- **Radius buffer (5 km):** ditentukan melalui pengujian terhadap radius 3 km, 5 km, dan 10 km pada beberapa titik hotspot nyata. Radius 5 km memberi keseimbangan terbaik antara menangkap konteks sekitar titik dan mempertahankan daya pembeda antar wilayah — radius 10 km terbukti mengaburkan sinyal lokal. Log pengujian lengkap terdokumentasi di `Progress.md`.
- **Tahun awal perhitungan loss (2015):** rentang 10+ tahun dipilih agar cukup menangkap tren deforestasi berulang tanpa terlalu bias terhadap kejadian yang sangat lama.

### 3.3 IQAir AirVisual API

- **Base URL:** `https://api.airvisual.com/v2/`
- **Endpoint digunakan:**

  ```
  GET /nearest_city?lat={LAT}&lon={LON}&key={API_KEY}
  ```

- **Tier:** Free (Community Plan) — kuota memadai untuk kebutuhan MVP (batch harian untuk wilayah prioritas + on-demand untuk fitur "Cek Daerah Kamu", dengan caching).
- **Field penting dari response:** `data.current.pollution.aqius`, `data.city`, `data.state`
- **Autentikasi:** API key (didaftarkan gratis via `iqair.com/dashboard/api`)

### 3.4 GADM (Database of Global Administrative Areas)

- **Sumber:** `https://gadm.org` (versi 4.1, level Adm2 — kabupaten/kota)
- **Kegunaan:** menyediakan daftar wilayah administratif (kabupaten/kota) se-Indonesia beserta koordinat centroid, digunakan sebagai unit agregasi untuk tabel `regions` dan perhitungan Priority Score per wilayah.
- **Metode akses:** data diunduh sekali secara manual dalam format GeoJSON (level 2), diproses secara lokal (ekstraksi nama wilayah + perhitungan centroid geometris menggunakan library `shapely`), lalu digenerate menjadi seeder Laravel (`RegionSeeder`). GADM tidak menyediakan endpoint REST publik untuk query terprogram, sehingga proses ini dilakukan sebagai data preparation satu kali di awal pengembangan — bukan bagian dari job terjadwal.
- **Cakupan:** 502 kabupaten/kota se-Indonesia.
- **Keterbatasan yang diketahui:** reverse-lookup hotspot ke wilayah menggunakan pendekatan **nearest-centroid** (jarak Haversine ke titik pusat kabupaten/kota terdekat, radius maksimum 100 km), bukan point-in-polygon presisi terhadap batas wilayah asli. Trade-off ini diterima untuk kebutuhan MVP — cukup akurat untuk agregasi tingkat kabupaten/kota, namun berpotensi salah assign untuk titik yang sangat dekat dengan garis batas dua wilayah.
- **Catatan kualitas data:** 5 kabupaten/kota di provinsi Kalimantan Utara (Bulungan, Malinau, Nunukan, Tana Tidung, Tarakan) sempat ter-seed dengan nama salah ("NA {nama}") karena field `TYPE_2` (jenis wilayah: Kabupaten/Kota) kosong pada source GeoJSON GADM v4.1 khusus provinsi ini — kemungkinan karena Kalimantan Utara adalah provinsi termuda (dimekarkan dari Kalimantan Timur pada 2012) sehingga metadata GADM untuk provinsi ini belum selengkap provinsi lain. Isu ini sudah diperbaiki manual di database dan `RegionSeeder.php`, dan dicatat sebagai known limitation apabila ditemukan pola serupa di provinsi lain saat validasi data lebih lanjut.

## 4. Alur Data (Pipeline)

### 4.1 Job Terjadwal — Ingest Hotspot (setiap 6 jam)

```
1. FirmsService::fetchIndonesiaHotspots()
   → GET area/csv bbox Indonesia
   → parse CSV → array of hotspot rows

2. Untuk setiap hotspot:
   GfwService::getRiskScore(lat, lon)
   → Cek cache database (gfw_risk_cache, TTL 30 hari) terlebih dahulu
   → Jika belum ada/kedaluwarsa: buat geostore → query tree cover loss → hitung skor
   → Simpan/update ke cache

3. Klasifikasi risk_score → risk_category (lihat Rules.md §2 untuk ambang batas)

4. Assign region_id menggunakan nearest-centroid (Haversine) terhadap
   data wilayah GADM yang sudah di-seed (lihat §3.4)

5. Simpan/upsert ke tabel fire_hotspots

6. Untuk hotspot berkategori tinggi/sangat_tinggi:
   IqairService::nearestCity(lat, lon)
   → simpan aqi & nama kota ke record terkait
```

### 4.2 Job Terjadwal — Hitung Priority Score per Wilayah (harian)

```
1. Agregasi fire_hotspots per wilayah administratif (kabupaten/kota):
   - rata-rata gfw_risk_score
   - jumlah hotspot (frekuensi, dinormalisasi)
   - AQI rata-rata terkait wilayah (jika ada)

2. Hitung Priority_Score (lihat Rules.md §3 untuk formula & bobot)

3. Simpan/upsert ke tabel region_priority_scores
```

### 4.3 Fitur "Cek Daerah Kamu" (on-demand, request pengguna)

**Input lokasi opsional via link Google Maps:** sebelum alur di bawah, pengguna dapat menempelkan link Google Maps (short link `maps.app.goo.gl` atau full link) di `AreaCheck.jsx`. Frontend memanggil `POST /area-check/resolve-maps-link` → `GoogleMapsLinkService` meresolusi link (mengikuti seluruh redirect chain dengan header `User-Agent` browser mobile, untuk menghindari fallback lokasi berbasis IP server) menjadi `{lat, lon}` → frontend melanjutkan ke alur normal di bawah seolah pengguna klik peta langsung di titik tersebut.

```
1. Pengguna submit lokasi (lat, lon) via search / klik peta / geolokasi browser / link Google Maps

2. Backend:
   a. Query fire_hotspots lokal (Haversine) → hotspot dalam radius R km
   b. Cek cache GfwService untuk titik ini (cache TTL 30 hari, lihat Rules.md §4)
      → jika belum ada, panggil geostore + query on-demand, simpan cache
   c. Cek cache IqairService untuk titik ini (cache TTL beberapa jam)
      → jika belum ada, panggil nearest_city() on-demand, simpan cache

3. Gabungkan hasil → kirim response ke frontend
4. Frontend render kartu ringkasan + peta zoom ke lokasi
```

## 5. Struktur Proyek Laravel (Ringkas)

```
app/
  Domains/
    FireMonitoring/
      Services/
        FirmsService.php
        GfwService.php
        IqairService.php
        GoogleMapsLinkService.php
        MitigationHelper.php   # bukan HTTP service (tanpa API call eksternal) — lookup
                                # kategori mitigasi risiko/AQI; teks ditampilkan di frontend
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
        translations.js       # kamus terjemahan ID/EN, satu sumber kebenaran
        LanguageContext.jsx    # React Context + hook useLanguage()
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
  web.php   # termasuk GET /api/regions/compare (JSON, dipanggil via fetch dari
            # CompareModal.jsx, bukan Inertia visit — membandingkan priority_score
            # terbaru 2-3 wilayah sekaligus)
database/
  migrations/
```

## 6. Penanganan Kegagalan & Edge Case

| Kondisi | Penanganan |
|---|---|
| GFW query gagal / tidak ada data | Simpan `risk_score = null`, `risk_category = 'na'` — ditampilkan sebagai "Data risiko tidak tersedia" |
| FIRMS API timeout / limit | Job dicoba ulang (retry) dengan backoff; gunakan data cache terakhir jika masih gagal |
| IQAir quota habis | Fallback ke data cache lama (tampilkan timestamp "data terakhir diperbarui") |
| Koordinat pengguna di luar wilayah Indonesia | Divalidasi di awal request, tampilkan pesan bahwa layanan berfokus pada wilayah Indonesia |
| Kegagalan 1 titik saat ingest batch | Tidak menggagalkan seluruh batch — dicatat sebagai status `partial` di `data_ingestion_logs`, titik lain tetap diproses |

## 7. Keamanan & Kredensial

- Seluruh API key (FIRMS MAP_KEY, GFW API key, IQAir key) disimpan di `.env`, tidak pernah di-commit atau di-expose ke frontend.
- Rate limiting internal diterapkan pada endpoint "Cek Daerah Kamu" untuk mencegah penyalahgunaan kuota API eksternal (contoh: 1 request per IP per beberapa detik).
