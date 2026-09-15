# Design Document — EMBER
**Early Monitoring for Burning Environment & Reforestation**

Dokumen ini mendefinisikan arah desain produk EMBER: positioning, sistem visual (warna & tipografi), struktur halaman, komponen UI, serta aturan aksesibilitas dan atribusi data.

---

## 1. Positioning & Tone

EMBER adalah platform **data-driven**, bukan platform kampanye atau lifestyle. Desain harus terasa kredibel dan tenang — menyampaikan urgensi tanpa terasa alarmis atau menghakimi pihak manapun.

Referensi gaya layout diambil dari Reforestum (struktur landing page, kebersihan tipografi), dengan penyesuaian:
- Hero section menampilkan **produk nyata (peta live)**, bukan ilustrasi dekoratif.
- Palet warna diarahkan ke kesan "instrumen pemantauan resmi", bukan "produk konsumer santai".

## 2. Palet Warna

| Peran | Warna | Kegunaan |
|---|---|---|
| Primary (Forest) | Hijau tua `#1B4332` – `#2D6A4F` | Header, elemen brand, area "aman/rendah risiko" |
| Secondary (Fresh Green) | `#40916C` – `#74C69D` | Aksen tombol, elemen solusi/reforestasi |
| Alert — Tinggi | `#E85D04` (oranye bara) | Kategori risiko tinggi |
| Alert — Kritis | `#D00000` (merah bara) | Kategori risiko sangat tinggi |
| Netral | `#F8F9FA`, `#343A40` | Background, teks |
| Info | `#FFD60A` (kuning amber) | Kategori risiko sedang, highlight data |

**Prinsip penggunaan:** warna merah/oranye **hanya** dipakai untuk indikator risiko/data, tidak untuk elemen UI dekoratif — agar urgensi visual tetap bermakna dan tidak "menangis serigala".

## 3. Tipografi

- **Judul/heading:** sans-serif tegas (mis. Inter/Poppins Bold) — kesan modern & teknis.
- **Body text:** sans-serif reguler, kontras tinggi untuk keterbacaan data numerik.
- **Angka/statistik besar** (skor, AQI, jumlah hotspot): menggunakan tabular numerals agar rapi saat berubah (live update).

## 4. Struktur Halaman

### 4.1 Landing Page (`/`)

1. **Hero** — headline singkat + ringkasan misi + live map preview (embed kecil atau screenshot dashboard nyata) + CTA "Buka Dashboard"
2. **The Problem** — statistik singkat live (otomatis dari data): jumlah hotspot terdeteksi hari ini, jumlah wilayah risiko tinggi
3. **How it Works** — 3 langkah: Monitor (FIRMS) → Analisis (skor risiko berbasis data deforestasi GFW) → Bertindak (rekomendasi wilayah & cek lokasi)
4. **Data Sources** — logo/nama NASA FIRMS, Global Forest Watch, IQAir sebagai trust signal, disertai penjelasan singkat kredibilitas masing-masing
5. **CTA Penutup** — mendorong pengguna ke "Cek Daerah Kamu" atau "Buka Dashboard"

### 4.2 Dashboard (`/dashboard`)

- **Search bar besar** di atas peta — "Cek daerah kamu..." (dengan autocomplete kota)
- **Peta interaktif nasional** (Leaflet) — marker/cluster hotspot berwarna sesuai kategori risiko
- **Panel statistik** (3–4 kartu kecil): total hotspot aktif, wilayah risiko tinggi, kota AQI terburuk saat ini, waktu pembaruan data terakhir
- **Panel Ranking** — daftar wilayah dengan Priority Score tertinggi (5–10 wilayah), tiap item dapat diklik menuju halaman detail. Mode bandingkan tidak selalu tampil — dipicu melalui tombol "Bandingkan Wilayah" di header panel, yang baru memunculkan checkbox per item (maksimum 3 wilayah sekaligus) beserta panduan singkat cara pakai, agar tampilan default tetap bersih bagi pengguna yang tidak berniat membandingkan. Memilih ≥2 wilayah memicu `CompareTrigger` lalu `CompareModal` (lihat §6) tanpa meninggalkan halaman Dashboard
- **Filter** — tanggal, kategori risiko, provinsi

### 4.3 Halaman Detail Lokasi (`/area/{id}`)

- Kartu ringkasan utama (lihat wireframe pada §5)
- Peta zoom ke wilayah dengan hotspot di sekitarnya
- Breakdown skor: kontribusi risiko deforestasi (GFW) vs frekuensi hotspot vs dampak AQI
- Rekomendasi aksi kontekstual (teks singkat, bukan generik)

### 4.4 Halaman Metodologi (`/about`)

- Penjelasan 3 sumber data dan cara skor prioritas dihitung, termasuk penegasan bahwa skor risiko merupakan **proksi berbasis data deforestasi historis** (tree cover loss GFW dalam radius 5 km), bukan prediksi resmi dari lembaga pemerintah
- Disclaimer keterbatasan data (radius analisis 5 km, potensi delay data satelit, threshold berbasis sampel pengujian awal, dsb.)
- Pernyataan netralitas platform (data-driven, bukan advokasi kebijakan)

## 5. Wireframe — Kartu Ringkasan "Cek Daerah Kamu"

```
┌─────────────────────────────────────────┐
│ 📍 Palembang, Sumatera Selatan            │
│                                           │
│ 🔥 Status Risiko Karhutla                │
│    ●●●●○  TINGGI (skor 0.72)             │
│    berdasarkan data deforestasi historis │
│                                           │
│ 🌫️ Kualitas Udara Saat Ini                │
│    AQI 156 — Tidak Sehat                 │
│                                           │
│ 📡 Hotspot Terdekat                      │
│    3 titik dalam radius 25 km            │
│    Terdekat: 8 km dari lokasi kamu       │
│                                           │
│ 💡 Rekomendasi                           │
│    Kurangi aktivitas luar ruangan.       │
│    Wilayah ini prioritas tinggi untuk    │
│    monitoring & mitigasi karhutla.       │
│                                           │
│    [ Lihat di Peta ]  [ Detail Wilayah ] │
└─────────────────────────────────────────┘
```

## 6. Komponen UI Kunci

| Komponen | Fungsi |
|---|---|
| `Navbar` | Navigasi utama, digunakan melalui `AppLayout` di seluruh halaman (tidak diduplikasi per-page). Transparan saat berada di posisi paling atas halaman (menyatu dengan hero/canvas), berubah menjadi solid (`bg-white/80` + `backdrop-blur-md`) begitu discroll, agar teks tetap terbaca di atas konten apa pun di belakangnya — termasuk `MapView`, yang stacking-nya (Leaflet pane/kontrol) sengaja ditempatkan di bawah navbar. Item aktif ditandai underline; item lain mendapat underline saat hover. Dibangun di atas primitive `NavigationMenu` (shadcn/ui, preset Base UI) |
| `Footer` | Atribusi sumber data (lihat §8), digunakan melalui `AppLayout`. Memiliki varian gelap (`dark`) untuk dipasang di atas `bg-forest-dark` (Landing), dan varian terang untuk halaman lain |
| `RiskBadge` | Badge warna + label kategori risiko (Rendah/Sedang/Tinggi/Sangat Tinggi/N/A), digunakan konsisten di seluruh halaman. Kategori N/A dirender berbeda **secara struktural**, bukan sekadar beda warna — border dashed dan ikon tanya menggantikan dot solid, agar tidak disalahartikan sebagai "risiko rendah versi pucat" (menegaskan prinsip null ≠ 0 dari Rules.md §2) |
| `MapView` | Wrapper Leaflet, menerima props hotspot list & mode (nasional / zoom-lokasi / selectable) |
| `SummaryCard` | Kartu hasil "Cek Daerah Kamu" |
| `RegionRankingList` | Daftar wilayah prioritas, dapat diklik. Mode bandingkan (checkbox + panduan singkat) tersembunyi secara default, baru tampil setelah tombol "Bandingkan Wilayah" di header ditekan — progressive disclosure agar tampilan default tetap bersih |
| `StatTile` | Kartu statistik kecil untuk dashboard, menampilkan status "Data tidak tersedia" secara eksplisit untuk nilai kosong |
| `ScoreBreakdown` | Visualisasi kontribusi tiap komponen formula Priority Score (risiko/frekuensi/AQI) dengan progress bar proporsional terhadap bobot masing-masing; komponen data yang tidak tersedia ditandai pola bergaris, bukan ditampilkan sebagai 0% |
| `SourceCredit` | Komponen kecil yang menampilkan atribusi sumber data (digunakan di footer/peta) |
| `CompareTrigger` | Bar mengambang (sticky) di bawah `RegionRankingList`, muncul saat ≥2 wilayah dicentang untuk dibandingkan; menampilkan chip nama wilayah terpilih (dapat dihapus satu per satu) dan tombol "Bandingkan" |
| `CompareModal` | Dialog overlay yang merender 2–3 instance `ScoreBreakdown` bersebelahan untuk wilayah yang dipilih, memuat data via endpoint ringan tanpa reload halaman |

## 7. Aksesibilitas & Bahasa

- UI menggunakan Bahasa Indonesia sebagai default, dengan toggle Bahasa Inggris yang mencakup **seluruh halaman dan komponen** (bukan hanya landing page & label kategori risiko seperti rencana awal — diperluas 16 September 2026, lihat `Progress.md` §10) untuk audiens juri internasional.
- Kontras warna kategori risiko diuji agar tetap dapat dibedakan oleh pengguna buta warna (tidak mengandalkan warna semata — selalu disertai label teks/ikon).
- Seluruh elemen peta memiliki alternatif teks/tabel data untuk aksesibilitas dasar.

## 8. Atribusi Data (Wajib Ditampilkan)

Karena EMBER sepenuhnya bergantung pada data pihak ketiga resmi, atribusi harus tampil jelas di footer setiap halaman yang menampilkan data:

> Data hotspot: NASA FIRMS · Data risiko deforestasi: Global Forest Watch · Data kualitas udara: IQAir · Batas wilayah administratif: GADM v4.1
