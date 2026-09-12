<?php

return [

    /*
    |--------------------------------------------------------------------
    | REFERENSI HISTORIS (tidak dipakai lagi)
    |--------------------------------------------------------------------
    | Threshold ini awalnya dihitung dari statistik layer BNPB InaRISK
    | (mean: 0.407, stdv: 0.351). Diganti ke GFW karena instabilitas
    | server BNPB terkonfirmasi selama 3 hari pengujian berturut-turut.
    | Lihat Analisa-Sumber-Data-Alternatif.md untuk detail lengkap.
    |
    | 'bnpb_risk_thresholds_REFERENCE_ONLY' => [
    |     'rendah'        => [0.00, 0.20],
    |     'sedang'        => [0.20, 0.41],
    |     'tinggi'        => [0.41, 0.58],
    |     'sangat_tinggi' => [0.58, 0.94],
    | ],
    */

    // Threshold kategori risiko berbasis GFW tree cover loss,
    // dihitung dari sampel 20 titik hotspot asli (min 0.63%, max 33.88%,
    // rata-rata 18.22%, median 21.09%). Lihat Progress.md untuk log pengujian.
    'gfw_risk_thresholds' => [
        'rendah'        => [0.00, 0.37],
        'sedang'        => [0.37, 0.51],
        'tinggi'        => [0.51, 0.66],
        'sangat_tinggi' => [0.66, 1.00],
    ],

    // Skala maksimum loss_percentage untuk normalisasi ke 0-1
    'gfw_loss_percentage_max' => 35.0,

    // Radius buffer (km) di sekitar tiap titik hotspot untuk analisis GFW,
    // ditentukan dari pengujian 3km/5km/10km — 5km paling seimbang.
    'gfw_buffer_radius_km' => 5,

    // Tahun awal perhitungan tree cover loss (GFW dataset umd_tree_cover_loss)
    'gfw_loss_year_start' => 2015,

    // Bobot formula Priority Score (Rules.md §3) — tidak berubah
    'priority_score_weights' => [
        'gfw_risk'          => 0.4,
        'hotspot_frequency' => 0.4,
        'aqi_impact'        => 0.2,
    ],

    'aqi_scale' => [
        'min' => 0,
        'max' => 300,
    ],

    'firms_bbox_indonesia' => '95,-11,141,6',
    'firms_default_sensor' => 'MODIS_NRT',
    'area_check_radius_km' => 25,

    // TTL cache (jam) — GFW jauh lebih lama karena data historis, bukan real-time
    'cache_ttl' => [
        'area_check' => 12,
        'gfw_risk'   => 24 * 30, // 30 hari — tree cover loss update tahunan
        'iqair'      => 6,
    ],

    /*
    |--------------------------------------------------------------------
    | KONTEN MITIGASI
    |--------------------------------------------------------------------
    | Dipetakan dari kategori risiko (gfw_risk_category / priority_rank_category,
    | sama-sama pakai skala rendah/sedang/tinggi/sangat_tinggi/na — lihat
    | Rules.md §2 & §3) dan kategori AQI (skala AQI US EPA yang sudah dipakai
    | IQAir). Dikonsumsi lewat MitigationHelper, tidak pernah dihardcode
    | ulang di controller/frontend (Rules.md §7).
    |
    | Sumber (fire_risk) — diadaptasi/diparafrase dari pernyataan resmi BNPB
    | soal karhutla Agustus-September 2026, dirujuk eksplisit per tautan
    | (bukan klaim umum tanpa rujukan):
    |   1. ANTARA News, "BNPB ajak masyarakat cegah karhutla, lapor jika
    |      temukan titik api", 28 Agustus 2026.
    |      https://www.antaranews.com/berita/5719161/bnpb-ajak-masyarakat-cegah-karhutla-lapor-jika-temukan-titik-api
    |   2. ANTARA News, "BNPB imbau masyarakat segera lapor jika temukan
    |      titik api karhutla", 21 Agustus 2026.
    |      https://www.antaranews.com/berita/5706297/bnpb-imbau-masyarakat-segera-lapor-jika-temukan-titik-api-karhutla
    |   3. BNPB.go.id, "Situasi Terkini Penanganan Karhutla Enam Provinsi
    |      Prioritas", per 4 September 2026.
    |      https://www.bnpb.go.id/berita/situasi-terkini-penanganan-karhutla-enam-provinsi-prioritas
    |   4. BNPB.go.id, "Berdialog dengan Warga, BNPB Mengimbau Jangan
    |      Bakar Lahan", 7 Agustus 2026.
    |      https://www.bnpb.go.id/berita/berdialog-dengan-warga-bnpb-mengimbau-jangan-bakar-lahan
    | Nomor layanan darurat 117 dikonfirmasi sebagai call center resmi BNPB
    | di seluruh rujukan di atas.
    |
    | Skala AQI US EPA standar (sejalan dengan skala IQAir) untuk air_quality
    | — bukan kutipan sumber tunggal, merupakan skala baku internasional.
    |
    | short_text  → dipakai di SummaryCard (ringkas, 1 kalimat)
    | full_guidance → dipakai di halaman detail lokasi/wilayah & /about
    */
    'MITIGATION_CONTENT' => [

        'fire_risk' => [

            'rendah' => [
                'short_text' => 'Wilayah relatif aman. Tetap hindari membakar sampah atau lahan sembarangan.',
                'full_guidance' => [
                    // Diparafrase (bukan kutipan langsung) dari imbauan Plt Kapusdatin
                    // BNPB Berton SP Panjaitan — lihat rujukan #1 di atas.
                    'Hindari aktivitas yang berisiko memicu titik api, termasuk kebiasaan membakar sampah di area terbuka.',
                    'Pantau informasi resmi BNPB/BPBD setempat secara berkala.',
                    'Laporkan ke BPBD atau layanan darurat BNPB (117) bila menemukan titik api atau asap mencurigakan.',
                ],
            ],

            'sedang' => [
                'short_text' => 'Tingkatkan kewaspadaan. Hindari pembukaan lahan dengan cara membakar.',
                'full_guidance' => [
                    'Tingkatkan kesiapsiagaan terhadap potensi karhutla di wilayah ini.',
                    'Hindari pembukaan lahan dengan cara membakar, terutama saat cuaca kering.',
                    'Siapkan alat pelindung diri (masker, kacamata pelindung) untuk berjaga-jaga.',
                    'Laporkan titik api atau kepulan asap ke BPBD setempat sejak dini.',
                ],
            ],

            'tinggi' => [
                'short_text' => 'Status siaga karhutla. Jangan membakar sampah/lahan, segera lapor bila menemukan titik api.',
                'full_guidance' => [
                    'Tidak membuka lahan dengan cara membakar dan berhati-hati mengelola sampah agar tidak memicu kebakaran.',
                    'Segera laporkan temuan titik api ke layanan darurat BNPB (117) atau BPBD setempat agar penanganan dapat dilakukan sedini mungkin.',
                    'Ikuti arahan resmi BPBD terkait status siaga darurat kekeringan dan karhutla di wilayah ini.',
                    'Siapkan masker dan perlengkapan pelindung pernapasan di rumah.',
                ],
            ],

            'sangat_tinggi' => [
                'short_text' => 'Risiko sangat tinggi. Jangan mendekati api, jauhi lokasi, dan ikuti arahan evakuasi resmi.',
                'full_guidance' => [
                    'Jangan mencoba memadamkan api apabila tidak memiliki peralatan atau kemampuan yang memadai — segera menjauh dari lokasi.',
                    'Laporkan kejadian kepada petugas atau pihak berwenang secepatnya; keselamatan diri harus menjadi prioritas utama.',
                    'Pahami dan siapkan rute evakuasi dari tempat tinggal.',
                    'Ikuti arahan resmi dari BPBD dan BMKG untuk meminimalkan risiko korban jiwa dan kerugian material.',
                ],
            ],

            'na' => [
                'short_text' => 'Data risiko deforestasi untuk lokasi ini belum tersedia.',
                'full_guidance' => [
                    'Skor risiko karhutla berbasis data deforestasi tidak berhasil dihitung untuk titik/wilayah ini.',
                    'Tetap pantau kategori kualitas udara (AQI) dan informasi resmi BNPB/BPBD setempat sebagai indikator alternatif.',
                ],
            ],
        ],

        'air_quality' => [

            'baik' => [
                'short_text' => 'Kualitas udara baik, aman untuk beraktivitas di luar ruangan seperti biasa.',
                'full_guidance' => [
                    'Kualitas udara dalam kategori baik dan tidak menimbulkan risiko kesehatan.',
                    'Aktivitas luar ruangan dapat dilakukan seperti biasa.',
                ],
            ],

            'sedang' => [
                'short_text' => 'Kualitas udara sedang. Kelompok sensitif mulai perlu waspada.',
                'full_guidance' => [
                    'Masyarakat umum masih dapat beraktivitas dengan bebas seperti biasanya.',
                    'Kelompok rentan (lansia, ibu hamil, anak-anak) disarankan mulai lebih memperhatikan durasi aktivitas luar ruangan.',
                ],
            ],

            'tidak_sehat' => [
                'short_text' => 'Kualitas udara tidak sehat. Kurangi aktivitas luar ruangan dan gunakan masker.',
                'full_guidance' => [
                    'Kurangi aktivitas atau olahraga di luar rumah, terutama bagi lansia, ibu hamil, dan anak-anak.',
                    'Gunakan masker bila terpaksa harus beraktivitas di luar rumah.',
                    'Gunakan pembersih udara di dalam ruangan bila tersedia.',
                ],
            ],

            'sangat_tidak_sehat' => [
                'short_text' => 'Sangat tidak sehat. Batasi kegiatan dan tetap berada di dalam ruangan.',
                'full_guidance' => [
                    'Setiap orang disarankan membatasi kegiatan dan tetap berada di dalam ruangan.',
                    'Gunakan masker, tutup ventilasi udara, dan nyalakan pembersih udara di dalam rumah.',
                ],
            ],

            'berbahaya' => [
                'short_text' => 'Kondisi berbahaya. Hindari seluruh aktivitas luar ruangan.',
                'full_guidance' => [
                    'Kondisi darurat yang dapat berdampak luas pada kesehatan masyarakat.',
                    'Hindari seluruh aktivitas di luar ruangan dan ikuti arahan dinas kesehatan/Kemenkes setempat.',
                ],
            ],
        ],
    ],
];