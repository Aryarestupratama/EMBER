# Business Rules Document (Rules) — EMBER
**Early Monitoring for Burning Environment & Reforestation**

Dokumen ini mendefinisikan aturan bisnis, formula, dan batasan yang mengikat implementasi — baik aturan domain (skoring) maupun aturan kepatuhan kompetisi.

## Riwayat Revisi

| Tanggal | Perubahan |
|---|---|
| 6 September 2026 | Sumber data risiko karhutla dialihkan dari BNPB InaRISK ke Global Forest Watch (GFW) setelah instabilitas server BNPB terkonfirmasi selama 3 hari pengujian berturut-turut. Seluruh formula dan threshold pada dokumen ini diperbarui mengikuti sumber data baru. Lihat `Analisa-Sumber-Data-Alternatif.md` untuk detail investigasi dan justifikasi keputusan. |
| 12 September 2026 | Statistik sampel kalibrasi pada §2 diperbarui. Sampel 20 titik sebelumnya (min 0,63%, max 33,88%, rata-rata 18,22%, median 21,09%) tidak memiliki data mentah per titik yang tersimpan — hanya statistik agregat yang tercatat di `Progress.md`. Sampel diuji ulang melalui pipeline `GfwService` yang sudah berjalan, menggunakan 20 titik koordinat nyata di area rawan karhutla Kalimantan dan Sumatra. Data mentah 20 titik ini didokumentasikan penuh di Appendix A proposal kompetisi. Skala maksimum normalisasi (35%) **tidak berubah** dan tetap valid terhadap data baru ini. |

---

## 1. Kepatuhan Kompetisi (Non-negotiable)

1. **Orisinalitas.** Proyek ini dibangun dari nol: kode, database, dan desain baru. Tidak ada reuse dari proyek tim manapun yang pernah menang kompetisi lain.
2. **Tidak boleh disubmit ganda.** Proyek tidak sedang/akan disubmit ke kompetisi lain secara bersamaan.
3. **Lisensi pihak ketiga.** Semua library, API, dan data pihak ketiga yang digunakan (Laravel, React, Leaflet, NASA FIRMS, Global Forest Watch, IQAir, GADM) dicantumkan sumbernya di README repository dan halaman `/about`.
4. **Source code di GitHub**, memuat: source code, README, instruksi instalasi, technology stack, dan dokumentasi teknis (termasuk dokumen-dokumen ini).
5. **Proposal maksimum 15 halaman** (di luar cover & lampiran) — lihat checklist proposal di `Progress.md`.
6. **Deadline submission:** 20 September 2026.

## 2. Aturan Klasifikasi Risiko GFW (Tree Cover Loss)

Sumber tunggal kebenaran (single source of truth) untuk ambang batas — didefinisikan sebagai konstanta di `config/ember.php`, digunakan konsisten di backend (untuk penyimpanan kategori) dan frontend (untuk label/warna):

```php
const GFW_RISK_THRESHOLDS = [
    'rendah'        => [0.00, 0.37],
    'sedang'        => [0.37, 0.51],
    'tinggi'        => [0.51, 0.66],
    'sangat_tinggi' => [0.66, 1.00],
];
```

- Skor risiko (`risk_score`) diturunkan dari **persentase tree cover loss** dalam radius buffer 5 km di sekitar titik hotspot, dinormalisasi dengan formula:

  ```
  risk_score = min(loss_percentage / 35, 1)
  ```

  Skala maksimum **35%** ditentukan dengan memberi ruang toleransi di atas nilai maksimum yang teramati pada sampel pengujian, untuk mengakomodasi area dengan tingkat kehilangan tutupan hutan lebih tinggi yang mungkin ditemukan platform saat beroperasi.
- Nilai `null` (query GFW gagal, geostore tidak dapat dibuat, atau data tidak tersedia) **selalu** dikategorikan `na`, tidak pernah diperlakukan sebagai 0 (risiko rendah) — karena kegagalan API berarti "data tidak berhasil diambil", bukan "risiko nol".
- Ambang batas ini bersumber dari pengujian sampel 20 titik koordinat di area rawan karhutla Kalimantan dan Sumatra melalui pipeline `GfwService` (19 titik menghasilkan data valid, 1 titik gagal dan dikategorikan `na`): min 0,43%, max 24,37%, rata-rata 11,79%, median 12,18%. Data mentah per titik didokumentasikan di Appendix A proposal kompetisi dan `Progress.md`, dan dapat dijelaskan metodologinya saat sesi tanya-jawab juri.
- **Radius buffer 5 km** ditentukan melalui pengujian empiris terhadap radius 3 km, 5 km, dan 10 km pada beberapa titik hotspot nyata — 5 km dipilih karena memberi keseimbangan terbaik antara menangkap konteks area sekitar dan mempertahankan daya pembeda antar wilayah.

## 3. Formula Priority Score (Wilayah)

Dihitung harian per wilayah (`regions`), disimpan di `region_priority_scores`.

```
Priority_Score = (0.4 × Norm_GFW_Risk)
               + (0.4 × Norm_Hotspot_Frequency)
               + (0.2 × Norm_AQI_Impact)
```

**Komponen:**

1. **Norm_GFW_Risk** — rata-rata `gfw_risk_score` seluruh hotspot di wilayah tersebut pada periode berjalan. Skor ini sudah ternormalisasi 0–1 di level per-titik (lihat §2), sehingga rata-rata wilayah juga otomatis berada di skala 0–1.

   > **Penanganan null di level agregasi wilayah:** jika sebuah wilayah memiliki hotspot aktif namun *seluruhnya* gagal di-enrich GFW (`gfw_risk_score` null di semua titik), wilayah tersebut **dilewati** untuk perhitungan hari itu — bukan didefault ke kontribusi risiko 0. Hal ini berbeda dengan wilayah yang memang tidak memiliki hotspot sama sekali dalam periode berjalan, di mana kontribusi 0 memang valid (tidak ada sinyal kebakaran untuk dirata-ratakan, bukan kegagalan pengambilan data). Prinsip null ≠ 0 dari §2 berlaku juga di level agregasi ini, tidak hanya di level titik hotspot individual.

2. **Norm_Hotspot_Frequency** — jumlah hotspot di wilayah tersebut dalam 7 hari terakhir, dinormalisasi terhadap wilayah dengan jumlah hotspot tertinggi pada periode yang sama (min-max normalization relatif, bukan skala absolut tetap — karena jumlah hotspot nasional berfluktuasi musiman).

3. **Norm_AQI_Impact** — rata-rata AQI kota-kota terkait wilayah tersebut, dinormalisasi terhadap skala AQI standar (0–500 skala AQI US EPA, dipotong di 300 untuk keperluan normalisasi karena nilai di atas itu jarang & ekstrem).

**Justifikasi bobot (0,4 / 0,4 / 0,2):** risiko deforestasi historis (proksi risiko karhutla berulang) dan aktivitas hotspot riil diberi bobot setara sebagai indikator utama (keduanya data primer, langsung terkait kejadian karhutla), sementara AQI diberi bobot lebih rendah sebagai indikator dampak sekunder (dipengaruhi banyak faktor lain di luar karhutla, seperti kendaraan/industri).

**Kategori akhir** (`priority_rank_category`) menggunakan ambang batas yang sama seperti §2 (rendah/sedang/tinggi/sangat_tinggi), diterapkan pada `priority_score` final.

## 4. Aturan Data Freshness

| Proses | Frekuensi / TTL |
|---|---|
| Ingest hotspot FIRMS | Setiap 6 jam |
| Perhitungan `region_priority_scores` | 1x per hari (setelah ingest terakhir hari itu selesai) |
| Cache `gfw_risk_cache` | 30 hari — jauh lebih panjang dibanding cache lain karena data tree cover loss bersifat historis dan tidak berubah cepat (update dataset sumber GFW bersifat tahunan/mingguan, bukan real-time) |
| Cache `area_check_cache` | 12 jam — jika pengguna mengecek lokasi yang sama dalam rentang ini, data diambil dari cache, bukan memanggil API lagi |

Setiap halaman yang menampilkan data harus menampilkan **timestamp "data terakhir diperbarui"**, diambil dari `data_ingestion_logs`.

## 5. Aturan Penanganan Kegagalan

(Lihat juga Architecture.md §6)

- Kegagalan satu sumber data **tidak boleh** menggagalkan seluruh proses ingest — job berjalan per-sumber, dicatat independen di `data_ingestion_logs`.
- Jika GFW/IQAir gagal saat ingest hotspot baru, hotspot tetap disimpan dengan `gfw_risk_category = 'na'` / `nearest_city_aqi = null`, dan **di-enrich ulang** pada job ingest berikutnya (bukan hilang).
- Frontend tidak pernah menampilkan angka default palsu (mis. `0`) untuk data yang gagal diambil — selalu menampilkan status "data tidak tersedia".
- Kegagalan pemrosesan 1 titik hotspot dalam sebuah batch ingest tidak menghentikan pemrosesan titik-titik lainnya; batch tetap dilanjutkan dan status akhir dicatat sebagai `partial` di `data_ingestion_logs`.

## 6. Aturan Konten & Framing (Editorial)

- Tidak ada teks di platform yang menyalahkan pihak spesifik (pemerintah, industri sawit, dsb.) atas karhutla. Seluruh narasi berbasis data dan netral.
- Rekomendasi yang ditampilkan ke pengguna bersifat **umum dan defensif secara medis/keselamatan** (mis. "kurangi aktivitas luar ruangan"), bukan rekomendasi kebijakan spesifik.
- Halaman `/about` wajib mencantumkan disclaimer keterbatasan data, termasuk: skor risiko merupakan proksi berbasis data deforestasi historis (bukan prediksi resmi pemerintah), radius analisis 5 km, serta potensi delay data satelit.

## 7. Aturan Penamaan Kode (Konvensi Teknis)

- Service class per sumber data: `{Sumber}Service` (`FirmsService`, `GfwService`, `IqairService`) — tidak boleh ada logic pemanggilan HTTP di luar class ini (tidak boleh langsung `Http::get()` di controller/job).
- Job terjadwal: `{Aksi}Job` (`IngestFireHotspotsJob`, `CalculateRegionPriorityJob`).
- Seluruh nilai ambang batas (threshold) didefinisikan sebagai constant/config, tidak pernah *magic number* langsung di dalam logic.
