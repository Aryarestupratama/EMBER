# EMBER — Early Monitoring for Burning Environment & Reforestation

Platform web yang mengagregasi tiga sumber data resmi — titik panas satelit (NASA FIRMS), risiko
deforestasi historis (Global Forest Watch), dan kualitas udara (IQAir) — menjadi satu skor prioritas
per wilayah administratif untuk memantau dan memitigasi kebakaran hutan dan lahan (karhutla) di
Indonesia.

Dibangun untuk **International Web Technology Competition — Gayatama 5 (UNESA)**.
Tema: *"Innovating for a Sustainable Future: Empowering Communities through Web Technology"*.

> **Catatan riwayat:** sumber data risiko awalnya dirancang menggunakan BNPB InaRISK. Setelah 3
> hari pengujian menunjukkan instabilitas server yang konsisten (timeout, error 503, kegagalan Web
> Adaptor), sumber data risiko dialihkan ke Global Forest Watch (GFW), menggunakan analisis tree
> cover loss sebagai proksi risiko karhutla berulang. Detail lengkap ada di dokumentasi teknis
> (`docs/Architecture.md`).

---

## Fitur Utama

| Fitur | Deskripsi |
|---|---|
| Dashboard Nasional | Peta interaktif seluruh Indonesia menampilkan hotspot NASA FIRMS, diwarnai berdasarkan kategori risiko |
| Cek Daerah Kamu | Cek lokasi (ketik / klik peta / geolokasi / tempel link Google Maps) → skor risiko, hotspot terdekat, AQI dalam satu ringkasan |
| Ranking Wilayah Prioritas | Daftar wilayah dengan skor prioritas tertinggi, kombinasi 3 sumber data, dengan mode bandingkan hingga 3 wilayah |
| Statistik Ringkas | Total hotspot aktif, jumlah wilayah risiko tinggi, kota dengan AQI terburuk |
| Halaman Detail Lokasi | Zoom peta + breakdown kontribusi skor per wilayah + rekomendasi kontekstual |
| Halaman Metodologi (`/about`) | Penjelasan transparan sumber data, cara skor dihitung, dan keterbatasannya |

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Laravel (PHP 8.2+) |
| Frontend | React via Inertia.js |
| Styling | Tailwind CSS v4 + shadcn/ui (Base UI) |
| Peta | Leaflet.js (react-leaflet v4) |
| Database | MySQL / PostgreSQL (Eloquent) |
| Scheduling | Laravel Task Scheduling + Queue |

## Sumber Data

| Sumber | Kegunaan | Auth |
|---|---|---|
| [NASA FIRMS](https://firms.modaps.eosdis.nasa.gov/api/) | Titik panas satelit real-time (VIIRS/MODIS) | MAP_KEY (gratis via email) |
| [Global Forest Watch Data API](https://data-api.globalforestwatch.org/) | Tree cover loss sebagai proksi risiko karhutla | API key (sign-up mandiri) |
| [IQAir AirVisual](https://www.iqair.com/dashboard/api) | Kualitas udara (AQI) kota terdekat | API key (gratis, free tier) |
| [GADM v4.1](https://gadm.org/) | Batas wilayah administratif (502 kabupaten/kota), data preparation satu kali | — |

Detail formula skor risiko dan Priority Score ada di `docs/Rules.md`.

---

## Instalasi (Development)

Prasyarat: PHP ≥ 8.2, Composer, Node.js/npm, MySQL/PostgreSQL sudah jalan, Python 3 + `shapely`
(hanya untuk data preparation GADM satu kali).

### 1. Clone & install dependency backend

```bash
git clone <repo-url> ember
cd ember
composer install
```

### 2. Install Inertia (server-side)

```bash
composer require inertiajs/inertia-laravel
php artisan inertia:middleware
```

Tambahkan `\App\Http\Middleware\HandleInertiaRequests::class` ke `bootstrap/app.php`
(`$middleware->web(append: [...])`).

### 3. Install Breeze (preset React)

```bash
composer require laravel/breeze --dev
php artisan breeze:install react
```

### 4. Install dependency npm

> **Catatan:** project ini punya konflik versi peer dependency di ekosistem Laravel Vite
> Plugin/Tailwind Vite/Vitejs Plugin React yang belum sinkron. Selalu pakai `--legacy-peer-deps`.

```bash
npm install --legacy-peer-deps
npm install leaflet react-leaflet@4 --legacy-peer-deps
```

react-leaflet v4 dipakai secara sengaja (kompatibel React 18 bawaan Breeze) — v5 butuh React 19 dan
akan konflik.

### 5. Setup environment

```bash
cp .env.example .env
php artisan key:generate
```

Isi bagian berikut di `.env`:

```
DB_CONNECTION=mysql
DB_DATABASE=ember
DB_USERNAME=root
DB_PASSWORD=

QUEUE_CONNECTION=sync

FIRMS_MAP_KEY=xxxx
GFW_API_KEY=xxxx
IQAIR_API_KEY=xxxx
```

### 6. Buat struktur folder domain

```bash
mkdir -p app/Domains/FireMonitoring/{Services,Jobs,Models}
mkdir -p resources/js/{Pages,Components}
```

### 7. Generate model & migration

```bash
php artisan make:model Domains/FireMonitoring/Models/FireHotspot -m
php artisan make:model Domains/FireMonitoring/Models/Region -m
php artisan make:model Domains/FireMonitoring/Models/RegionPriorityScore -m
php artisan make:model Domains/FireMonitoring/Models/GfwRiskCache -m
php artisan make:migration create_area_check_cache_table
php artisan make:migration create_data_ingestion_logs_table
```

Isi setiap file migration sesuai struktur kolom persis di `docs/Schema.md` §1–6.

### 8. Generate service class (satu per sumber data eksternal — Rules.md §7)

```bash
php artisan make:class Domains/FireMonitoring/Services/FirmsService
php artisan make:class Domains/FireMonitoring/Services/GfwService
php artisan make:class Domains/FireMonitoring/Services/IqairService
php artisan make:class Domains/FireMonitoring/Services/GoogleMapsLinkService
```

Tidak boleh ada logic pemanggilan HTTP langsung di controller/job — selalu lewat Service class ini.

### 9. Generate job terjadwal & controller

```bash
php artisan make:job Domains/FireMonitoring/Jobs/IngestFireHotspotsJob
php artisan make:job Domains/FireMonitoring/Jobs/CalculateRegionPriorityJob

php artisan make:controller DashboardController
php artisan make:controller AreaCheckController
php artisan make:controller RegionDetailController
php artisan make:controller RegionCompareController
```

### 10. Buat config threshold (Rules.md §2 & §7 — single source of truth)

Buat `config/ember.php` berisi `gfw_risk_thresholds`, bobot Priority Score, TTL cache, dan
`MITIGATION_CONTENT` — jangan hardcode magic number/teks berulang di controller atau frontend.

### 11. Data preparation GADM (satu kali, bukan job terjadwal)

Unduh GeoJSON level-2 dari [gadm.org](https://gadm.org), ekstrak nama wilayah + hitung centroid
geometris pakai `shapely`, lalu generate jadi `database/seeders/RegionSeeder.php`. Lihat
`docs/Architecture.md` §3.4 untuk detail dan known limitation (5 kabupaten/kota Kalimantan Utara
sempat ter-seed salah nama karena field `TYPE_2` kosong di source GADM — sudah diperbaiki manual).

### 12. Migrate & seed database

```bash
php artisan migrate
php artisan db:seed --class=RegionSeeder
```

### 13. Setup scheduler (`routes/console.php`)

```php
Schedule::job(new \App\Domains\FireMonitoring\Jobs\IngestFireHotspotsJob)->everySixHours();
Schedule::job(new \App\Domains\FireMonitoring\Jobs\CalculateRegionPriorityJob)->dailyAt('01:00');
```

### 14. Jalankan (development)

Tiga terminal terpisah:

```bash
php artisan serve          # Terminal 1 — Laravel server
npm run dev                # Terminal 2 — Vite dev server
php artisan schedule:work  # Terminal 3 — jalankan job terjadwal untuk testing
```

---

## Deployment (Production)

- `QUEUE_CONNECTION=sync` — tidak butuh queue worker terpisah.
- **Wajib** ada akses Cron Job di hosting. Tambahkan satu baris:
  ```
  * * * * * cd /path-to-ember && php artisan schedule:run >> /dev/null 2>&1
  ```
- Cek dukungan cron di plan hosting **sebelum** memilih provider — sebagian shared hosting tidak
  menyediakan akses cron per-menit.
- Semua API key (FIRMS, GFW, IQAir) disimpan di `.env`, tidak pernah di-commit atau diekspos ke
  frontend.

## Arsitektur Singkat

- **Cache-first** — tidak ada pemanggilan live ke API eksternal saat halaman dibuka; semua data
  diambil scheduled job dan disajikan dari database lokal.
- **Service per sumber data** — tiap API eksternal (`FirmsService`, `GfwService`, `IqairService`)
  punya class sendiri, mudah diuji/diganti.
- **Graceful degradation** — kegagalan satu sumber data tidak menggagalkan seluruh halaman;
  ditampilkan sebagai "data tidak tersedia" (null ≠ 0, lihat `docs/Rules.md` §2).

## Keterbatasan yang Diketahui

- Skor risiko adalah **proksi statistik** dari data deforestasi historis (tree cover loss GFW),
  bukan prediksi resmi lembaga pemerintah.
- Threshold kategori risiko diturunkan dari sampel 20 titik koordinat di area rawan karhutla
  Kalimantan dan Sumatra (19 titik valid, min 0.43%, max 24.37%, rata-rata 11.79%) — dapat
  diperbarui dengan sampel lebih besar (50–100+ titik) pada iterasi berikutnya.
- Reverse-lookup hotspot ke wilayah menggunakan pendekatan nearest-centroid (Haversine), bukan
  point-in-polygon presisi terhadap batas administratif asli.

Detail lengkap metodologi dan keterbatasan ada di halaman `/about` aplikasi dan `docs/Rules.md`.

## Dokumentasi Teknis

- [`docs/Architecture.md`](docs/Architecture.md) — stack, alur data, struktur proyek
- [`docs/Rules.md`](docs/Rules.md) — formula skoring, aturan bisnis, konvensi kode
- [`docs/Schema.md`](docs/Schema.md) — struktur database
- [`docs/Design.md`](docs/Design.md) — positioning, palet warna, struktur halaman

## Atribusi & Lisensi

Data hotspot: NASA FIRMS · Data risiko deforestasi: Global Forest Watch · Data kualitas udara:
IQAir · Batas wilayah administratif: GADM v4.1.

Dibangun dengan Laravel, React, Inertia.js, Tailwind CSS, dan Leaflet.js — lisensi masing-masing
mengikuti proyek open-source terkait.

## Tim

Dosen Pembimbing: Siti Maesaroh, S.Kom., M.T.I.

| Nama | Peran |
|---|---|
| Arya Restu Pratama | Project Lead / Backend Developer |
| Justin Dwinata | Frontend Developer |
| Mutia Bela Puspita | UI/UX Designer & Documentation Lead |
| Azka Niaji Rangkuti | Data & Integration Engineer |
