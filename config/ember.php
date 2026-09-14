<?php

return [

    'gfw_risk_thresholds' => [
        'rendah'        => [0.00, 0.37],
        'sedang'        => [0.37, 0.51],
        'tinggi'        => [0.51, 0.66],
        'sangat_tinggi' => [0.66, 1.00],
    ],

    'gfw_loss_percentage_max' => 35.0,
    'gfw_buffer_radius_km' => 5,
    'gfw_loss_year_start' => 2015,

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

    'cache_ttl' => [
        'area_check' => 12,
        'gfw_risk'   => 24 * 30,
        'iqair'      => 6,
    ],

    // Konten mitigasi per kategori risiko (fire_risk) & AQI (air_quality).
    // fire_risk diadaptasi dari pernyataan resmi BNPB (Agustus-September 2026),
    // rujukan lengkap: lihat Progress.md / dokumentasi proposal Appendix.
    'MITIGATION_CONTENT' => [

        'fire_risk' => [

            'rendah' => [
                'short_text' => 'Wilayah relatif aman. Tetap hindari membakar sampah atau lahan sembarangan.',
                'full_guidance' => [
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