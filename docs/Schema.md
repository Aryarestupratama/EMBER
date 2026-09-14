# Database Schema Document — EMBER
**Early Monitoring for Burning Environment & Reforestation**

Database dibangun dari nol untuk proyek ini. Tidak ada tabel/data yang di-reuse dari proyek lain.

## Riwayat Revisi

| Tanggal | Perubahan |
|---|---|
| 6 September 2026 | Kolom yang sebelumnya bernama `bnpb_risk_score` / `bnpb_risk_category` diganti menjadi `gfw_risk_score` / `gfw_risk_category` mengikuti perpindahan sumber data risiko dari BNPB InaRISK ke Global Forest Watch (GFW). Lihat `Analisa-Sumber-Data-Alternatif.md` untuk alasan lengkap. |
| 12 September 2026 | Statistik sampel kalibrasi pada §8 diperbarui berdasarkan pengujian ulang 20 titik koordinat nyata melalui pipeline `GfwService` (lihat catatan revisi yang sama pada `Rules.md` §2). Tabel kategorisasi tidak berubah karena skala normalisasi (35%) tetap valid terhadap data baru. |

---

## 1. `fire_hotspots`

Menyimpan hasil ingest dari NASA FIRMS, diperkaya dengan skor risiko GFW dan AQI terkait.

```php
Schema::create('fire_hotspots', function (Blueprint $table) {
    $table->id();

    // Dari NASA FIRMS
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

    // Dari Global Forest Watch (GFW) — tree cover loss sebagai proksi risiko
    $table->decimal('gfw_risk_score', 8, 6)->nullable(); // null = gagal/tidak tersedia
    $table->enum('gfw_risk_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na'
    ])->default('na');

    // Dari IQAir (diisi untuk hotspot kategori tinggi/sangat_tinggi)
    $table->unsignedInteger('nearest_city_aqi')->nullable();
    $table->string('nearest_city_name', 100)->nullable();
    $table->string('nearest_city_state', 100)->nullable();

    // Referensi wilayah administratif (opsional, hasil reverse-lookup)
    $table->foreignId('region_id')->nullable()->constrained('regions')->nullOnDelete();

    $table->timestamp('fetched_at')->useCurrent();
    $table->timestamps();

    $table->index(['acq_date', 'confidence']);
    $table->index(['gfw_risk_category']);
    $table->index(['latitude', 'longitude']);
});
```

## 2. `regions`

Daftar wilayah administratif (kabupaten/kota) sebagai unit agregasi. Diseed dari data batas wilayah publik, disederhanakan ke level kabupaten/kota.

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

Hasil perhitungan skor prioritas harian per wilayah (lihat `Rules.md` §3 untuk formula).

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

    $table->decimal('priority_score', 6, 5); // hasil akhir formula
    $table->enum('priority_rank_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi'
    ]);

    $table->timestamps();

    $table->unique(['region_id', 'score_date']);
    $table->index('priority_score');
});
```

## 4. `area_check_cache`

Cache hasil query on-demand fitur "Cek Daerah Kamu" (per koordinat yang di-*round* ke presisi tertentu, untuk mengurangi panggilan API berulang di lokasi yang sama).

```php
Schema::create('area_check_cache', function (Blueprint $table) {
    $table->id();
    $table->decimal('lat_rounded', 7, 3);   // dibulatkan ~100m presisi
    $table->decimal('lon_rounded', 7, 3);

    $table->decimal('gfw_risk_score', 8, 6)->nullable();
    $table->enum('gfw_risk_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na'
    ])->default('na');

    $table->unsignedInteger('aqi')->nullable();
    $table->string('nearest_city_name', 100)->nullable();

    $table->timestamp('cached_at');
    $table->timestamps();

    $table->unique(['lat_rounded', 'lon_rounded']);
});
```

## 5. `gfw_risk_cache`

Cache khusus hasil analisis GFW (geostore + tree cover loss) per koordinat, terpisah dari `area_check_cache` karena TTL-nya jauh lebih panjang (data historis, bukan real-time) dan digunakan bersama baik oleh proses ingest batch maupun fitur on-demand.

```php
Schema::create('gfw_risk_cache', function (Blueprint $table) {
    $table->id();
    $table->decimal('lat_rounded', 7, 3);   // dibulatkan ~100m presisi
    $table->decimal('lon_rounded', 7, 3);

    $table->string('geostore_id', 100)->nullable();
    $table->decimal('buffer_area_ha', 12, 2)->nullable();
    $table->decimal('loss_area_ha', 12, 2)->nullable();
    $table->decimal('loss_percentage', 6, 2)->nullable();
    $table->decimal('risk_score', 6, 5)->nullable();
    $table->enum('risk_category', [
        'rendah', 'sedang', 'tinggi', 'sangat_tinggi', 'na'
    ])->default('na');

    $table->timestamp('cached_at');
    $table->timestamps();

    $table->unique(['lat_rounded', 'lon_rounded']);
});
```

## 6. `data_ingestion_logs`

Log eksekusi scheduled job — penting untuk debugging dan transparansi "kapan data terakhir diperbarui" yang ditampilkan di UI.

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

## 7. Relasi Antar Tabel (Ringkas)

```
regions            1 ── * fire_hotspots
regions            1 ── * region_priority_scores
```

## 8. Kategorisasi Skor Risiko GFW (Referensi)

Berdasarkan sampel 20 titik koordinat di area rawan karhutla Kalimantan dan Sumatra, diuji melalui pipeline `GfwService` (`loss_percentage` min 0,43%, max 24,37%, rata-rata 11,79%, median 12,18%, dari 19 titik valid — 1 titik gagal dan dikategorikan `na`) dalam radius buffer 5 km. Data mentah per titik didokumentasikan di Appendix A proposal kompetisi dan `Progress.md`.

| Kategori | Range `loss_percentage` | Range `risk_score` (ternormalisasi 0–1) |
|---|---|---|
| Rendah | 0% – 13% | 0 – 0,37 |
| Sedang | 13% – 18% | 0,37 – 0,51 |
| Tinggi | 18% – 23% | 0,51 – 0,66 |
| Sangat Tinggi | 23% – 35%+ | 0,66 – 1,0 |
| N/A | Query GFW gagal / geostore tidak dapat dibuat | — |

Ambang batas ini didefinisikan di satu tempat (`config/ember.php`), **bukan** hardcoded berulang di berbagai bagian kode — lihat `Rules.md` §2.

**Catatan keterbatasan:** threshold ini dihitung dari sampel 20 titik acak, bukan sensus penuh atau data historis multi-tahun. Untuk kebutuhan MVP kompetisi ini defensible dan terdokumentasi prosesnya, namun dapat diperbarui dengan sampel lebih besar (50–100 titik) di iterasi berikutnya bila diperlukan ketelitian statistik lebih tinggi.
