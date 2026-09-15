// Kamus terjemahan terpusat EMBER.
// Konsisten dengan prinsip single source of truth proyek ini (lihat
// Architecture.md §1 untuk token warna, Rules.md §2/§7 untuk threshold 
// pola yang sama diterapkan di sini untuk teks UI).
//
// Cara pakai: const { t } = useLanguage(); t('nav.dashboard')
// Interpolasi: t('regionRanking.maxHint', { max: 3 }) -> mengganti {{max}}

export const translations = {
    id: {
        nav: {
            dashboard: 'Dashboard',
            areaCheck: 'Cek Daerah Kamu',
            about: 'Metodologi',
            openMenu: 'Buka menu',
            closeMenu: 'Tutup menu',
        },
        languageToggle: {
            switchToEnglish: 'Ganti ke Bahasa Inggris',
            switchToIndonesian: 'Ganti ke Bahasa Indonesia',
        },
        risk: {
            rendah: 'Rendah',
            sedang: 'Sedang',
            tinggi: 'Tinggi',
            sangat_tinggi: 'Sangat Tinggi',
            na: 'N/A',
        },
        common: {
            dataNotAvailable: 'Data tidak tersedia',
            loading: 'Memuat data...',
        },
        footer: {
            credit:
                'Data hotspot: NASA FIRMS · Data risiko deforestasi: Global Forest Watch · ' +
                'Data kualitas udara: IQAir · Batas wilayah: GADM v4.1 · Panduan kesiapsiagaan: BNPB',
        },
        compareModal: {
            title: 'Bandingkan Wilayah',
            fetchError: 'Gagal memuat data perbandingan',
            loadError: 'Gagal memuat data perbandingan. Coba lagi.',
            loading: 'Memuat data...',
            selectAtLeast2: 'Pilih minimal 2 wilayah untuk dibandingkan.',
        },
        compareTrigger: {
            removeAria: 'Hapus {{name}} dari perbandingan',
            selectedCount: '{{count}}/3 dipilih',
            compareBtn: 'Bandingkan',
        },
        regionRanking: {
            title: 'Wilayah Prioritas',
            compareBtn: 'Bandingkan Wilayah',
            cancel: 'Batal',
            maxHint: 'Maksimum {{max}} wilayah sekaligus. Hapus satu untuk memilih yang lain, atau klik Bandingkan.',
            chooseHint: 'Pilih 2–3 wilayah di bawah, lalu klik Bandingkan yang muncul.',
            empty: 'Belum ada data wilayah prioritas untuk hari ini.',
            selectAria: 'Pilih {{name}} untuk dibandingkan',
            maxTitle: 'Maksimum 3 wilayah sekaligus',
        },
        scoreBreakdown: {
            title: 'Kontribusi Skor Prioritas',
            empty: 'Belum ada perhitungan skor prioritas untuk wilayah ini.',
            weightLabel: '(bobot {{weight}})',
            infoAria: 'Penjelasan',
            priorityScore: 'Priority Score',
            priorityScoreTooltip:
                'Jumlah terbobot dari tiga komponen di atas (0.4 × risiko deforestasi + 0.4 × frekuensi hotspot ' +
                '+ 0.2 × dampak AQI). Semakin tinggi skor, semakin diprioritaskan wilayah ini untuk monitoring dan mitigasi.',
            components: {
                gfw_risk: {
                    label: 'Risiko Deforestasi (GFW)',
                    tooltip:
                        'Rata-rata persentase tutupan hutan yang hilang (tree cover loss) dalam radius 5 km ' +
                        'di sekitar tiap hotspot wilayah ini sejak 2015, sebagai proksi risiko karhutla berulang  ' +
                        'bukan prediksi resmi pemerintah.',
                },
                hotspot_frequency: {
                    label: 'Frekuensi Hotspot',
                    tooltip:
                        'Jumlah hotspot di wilayah ini dalam 7 hari terakhir, dinormalisasi relatif terhadap ' +
                        'wilayah dengan jumlah hotspot terbanyak pada periode yang sama.',
                },
                aqi_impact: {
                    label: 'Dampak Kualitas Udara',
                    tooltip:
                        'Rata-rata AQI kota-kota terkait wilayah ini, dinormalisasi terhadap skala AQI US EPA (0–300). ' +
                        'Diberi bobot lebih rendah karena AQI juga dipengaruhi faktor lain di luar karhutla, seperti kendaraan dan industri.',
                },
            },
        },
        statTile: {
            infoAria: 'Penjelasan: {{label}}',
        },
        summaryCard: {
            location: 'Lokasi',
            riskStatus: 'Status Risiko Karhutla',
            scoreLabel: 'skor {{score}}',
            airQuality: 'Kualitas Udara Saat Ini',
            unknownCategory: 'Kategori tidak diketahui',
            nearbyHotspots: 'Hotspot Terdekat',
            hotspotCountSuffix: 'titik dalam radius {{radius}} km',
            nearestDistance: ' · terdekat {{distance}} km',
            noHotspots: 'Tidak ada hotspot dalam radius {{radius}} km',
            recommendation: 'Rekomendasi',
            aqiCategory: {
                baik: 'Baik',
                sedang: 'Sedang',
                tidak_sehat: 'Tidak Sehat',
                sangat_tidak_sehat: 'Sangat Tidak Sehat',
                berbahaya: 'Berbahaya',
            },
        },
        hotspotPopup: {
            riskCategoryLabel: 'Kategori Risiko Karhutla',
            detectionConfidence: 'Keyakinan Deteksi',
            detectedAt: 'Terdeteksi',
            unknown: 'Tidak diketahui',
        },
        landing: {
            pageTitle: 'EMBER  Monitoring Karhutla Indonesia',
            badge: {
                updated: 'Data terakhir diperbarui {{time}}',
                unavailable: 'Data belum tersedia',
            },
            hero: {
                titlePrefix: 'Pantau Karhutla ',
                titleHighlight: 'Indonesia',
                titleSuffix: ', Berbasis Data.',
                description:
                    'EMBER menggabungkan data satelit NASA FIRMS, analisis deforestasi Global Forest Watch, ' +
                    'dan kualitas udara IQAir menjadi satu skor prioritas  supaya siapa saja bisa memahami ' +
                    'risiko karhutla di sekitar mereka.',
                ctaCheckArea: 'Cek Daerah Kamu',
            },
            problem: {
                badge: 'Masalah Nyata',
                title: 'Karhutla Terjadi Berulang, Setiap Musim Kemarau',
                description:
                    'Kebakaran hutan dan lahan bukan cuma soal asap sesaat  dampaknya menumpuk tiap tahun ' +
                    'dan melampaui kehilangan tutupan hutan saja.',
                impact: {
                    airQuality: {
                        title: 'Kualitas Udara Memburuk',
                        description: 'Asap karhutla menyebar lintas wilayah dan menurunkan kualitas udara yang dihirup warga sekitar.',
                    },
                    biodiversity: {
                        title: 'Keanekaragaman Hayati Terancam',
                        description: 'Habitat flora dan fauna ikut hilang bersamaan dengan tutupan hutan yang terbakar.',
                    },
                    recurring: {
                        title: 'Berulang Setiap Tahun',
                        description: 'Tanpa pemantauan dini, titik-titik rawan yang sama cenderung terbakar kembali musim berikutnya.',
                    },
                },
                statHotspotsToday: 'Titik panas terdeteksi hari ini',
                statHighRiskRegions: 'Wilayah berstatus risiko tinggi',
            },
            mapPreview: {
                title: 'Peta Titik Panas Nasional',
                description: 'Preview titik panas terdeteksi hari ini di seluruh Indonesia',
                live: 'Live',
            },
            howItWorks: {
                badge: 'Cara Kerja',
                title: 'Sederhana, Tapi Menyeluruh',
                description: 'Tiga langkah dari data mentah satelit sampai rekomendasi yang bisa langsung kamu pakai.',
                steps: {
                    monitor: {
                        step: '1. Monitor',
                        title: 'Titik Panas Real-time',
                        description: 'Data hotspot dari satelit NASA FIRMS, diperbarui otomatis setiap 6 jam untuk seluruh wilayah Indonesia.',
                    },
                    analyze: {
                        step: '2. Analisis',
                        title: 'Skor Risiko Berbasis Data',
                        description: 'Tiap titik dianalisis menggunakan data deforestasi historis dari Global Forest Watch untuk menentukan tingkat risiko.',
                    },
                    act: {
                        step: '3. Bertindak',
                        title: 'Rekomendasi & Cek Lokasi',
                        description: 'Lihat wilayah prioritas nasional, atau cek kondisi kualitas udara dan risiko di lokasi kamu sendiri.',
                    },
                },
            },
            dataSources: {
                title: 'Data dari Sumber Tepercaya',
                description: 'EMBER tidak membuat data sendiri  semuanya diagregasi dari sumber resmi yang dapat diverifikasi.',
                firms: 'Titik panas satelit VIIRS/MODIS',
                gfw: 'Data deforestasi historis',
                iqair: 'Kualitas udara real-time',
                gadm: 'Batas wilayah administratif',
            },
            finalCta: {
                title: 'Mulai Pantau Wilayahmu Sekarang',
                description: 'Data selalu terbuka untuk siapa saja  warga, peneliti, hingga pengambil kebijakan.',
                checkAreaBtn: 'Cek Daerah Kamu',
                openDashboardBtn: 'Buka Dashboard',
            },
        },
        dashboard: {
            pageTitle: 'Dashboard',
            title: 'Dashboard Nasional',
            subtitle: 'Monitoring titik panas kebakaran hutan dan lahan di seluruh Indonesia',
            updatedBadge: 'Diperbarui {{time}}',
            noDataYet: 'Belum ada data',
            stats: {
                hotspotsToday: {
                    label: 'Titik Panas Hari Ini',
                    headlineActive: '{{count}} titik terdeteksi',
                    headlineEmpty: 'Tidak ada titik terdeteksi',
                    tooltip: 'Titik panas dari NASA FIRMS pada data terakhir yang berhasil di-ingest, bukan selalu hari ini jika pembaruan sempat tertunda.',
                },
                highRiskRegions: {
                    label: 'Wilayah Risiko Tinggi',
                    headlineActive: '{{count}} wilayah perlu perhatian',
                    headlineEmpty: 'Tidak ada wilayah berisiko tinggi',
                    sublabel: 'dari {{total}} dipantau',
                    tooltip: "Kabupaten/kota berkategori Priority Score 'Tinggi' atau 'Sangat Tinggi'  kombinasi risiko deforestasi historis (GFW), frekuensi hotspot, dan dampak AQI.",
                },
                worstAqi: {
                    label: 'Kualitas Udara Terburuk',
                    tooltip: 'AQI (skala AQI US EPA) tertinggi dari kota terdekat hotspot berkategori Tinggi/Sangat Tinggi.',
                },
                coverage: {
                    label: 'Cakupan Sistem',
                    headline: 'Terpantau di seluruh Indonesia',
                    sublabel: 'kabupaten/kota',
                    tooltip: 'Total kabupaten/kota se-Indonesia yang datanya dipantau EMBER. Daftar Wilayah Prioritas di samping menampilkan 10 wilayah dengan Priority Score tertinggi dari total ini.',
                },
            },
            aqiLevel: {
                baik: 'Baik',
                sedang: 'Sedang',
                tidakSehatSensitif: 'Tidak Sehat (Sensitif)',
                tidakSehat: 'Tidak Sehat',
            },
            mapTitle: 'Peta Titik Panas',
        },
        areaCheck: {
            pageTitle: 'Cek Daerah Kamu',
            title: 'Cek Daerah Kamu',
            description:
                'Klik lokasi di peta, gunakan lokasi kamu saat ini, atau tempel link Google Maps untuk melihat ' +
                'status risiko karhutla, kualitas udara, dan hotspot terdekat.',
            loadingStages: [
                'Mengecek titik panas terdekat...',
                'Menghitung risiko deforestasi (GFW)...',
                'Mengambil data kualitas udara...',
                'Menyusun ringkasan wilayah...',
            ],
            useMyLocation: 'Gunakan Lokasi Saya',
            orClickMap: 'atau klik langsung di peta',
            mapsLinkPlaceholder: 'Tempel link Google Maps...',
            checkBtn: 'Cek',
            errors: {
                outOfCoverage: 'Lokasi di luar cakupan wilayah Indonesia atau terjadi kesalahan. Coba lokasi lain.',
                geoUnsupported: 'Browser kamu tidak mendukung geolokasi.',
                geoFailed: 'Tidak bisa mengambil lokasi kamu. Coba klik langsung di peta.',
                linkFailed: 'Gagal memproses link. Coba tempel ulang.',
            },
            emptyState: 'Pilih lokasi untuk melihat ringkasan kondisi wilayah.',
        },
        regionDetail: {
            backToDashboard: 'Kembali ke Dashboard',
            fireGuidanceTitle: 'Panduan Kesiapsiagaan Karhutla',
            airGuidanceTitle: 'Panduan Kualitas Udara',
            guidanceSource: 'Sumber: BNPB (siaran pers resmi) · skala AQI mengacu standar AQI US EPA',
            hotspotsHeading: 'Hotspot 7 Hari Terakhir ({{count}})',
            noHotspots: 'Tidak ada hotspot tercatat di wilayah ini dalam 7 hari terakhir.',
            pointsCount: '{{count}} titik',
            distanceFromCenter: '{{distance}} km {{direction}} dari pusat {{name}}',
            table: {
                position: 'Posisi',
                confidence: 'Confidence',
                frp: 'FRP',
                risk: 'Risiko',
            },
        },
        about: {
            pageTitle: 'Metodologi',
            title: 'Metodologi',
            intro:
                'EMBER menggabungkan tiga sumber data resmi menjadi satu skor prioritas yang mudah dipahami. ' +
                'Halaman ini menjelaskan dari mana setiap angka berasal, bagaimana skor dihitung, dan keterbatasan ' +
                'yang perlu diketahui saat membaca data di platform ini.',
            sections: {
                dataSources: { heading: 'Sumber Data' },
                calculation: {
                    heading: 'Cara Skor Risiko Dihitung',
                    p1Prefix: 'Global Forest Watch tidak menyediakan skor risiko prediktif per titik. Sebagai gantinya, EMBER menurunkan skor risiko dari ',
                    p1Bold: 'persentase tree cover loss historis',
                    p1Suffix:
                        ' dalam radius 5 km di sekitar tiap titik hotspot  semakin tinggi deforestasi historis ' +
                        'di sekitar suatu titik, semakin tinggi skor risiko karhutla berulang di area tersebut.',
                    formula: 'risk_score = min(loss_percentage / 35, 1)',
                    p2Prefix: 'Angka ',
                    p2Bold: '35%',
                    p2Suffix:
                        ' adalah skala maksimum, ditentukan dari nilai tertinggi yang teramati pada sampel pengujian ' +
                        'awal (33,88%, dibulatkan ke atas untuk memberi ruang toleransi). Radius 5 km dipilih setelah ' +
                        'pengujian empiris terhadap radius 3 km, 5 km, dan 10 km  memberi keseimbangan terbaik ' +
                        'antara konteks area sekitar dan daya pembeda antar wilayah.',
                    thresholdsCaption: 'Ambang batas kategori risiko',
                    naNote: 'berarti data GFW gagal diambil  bukan risiko nol.',
                },
                priorityScore: {
                    heading: 'Skor Prioritas Wilayah',
                    p1: 'Setiap wilayah kabupaten/kota mendapat satu skor prioritas harian, gabungan dari tiga komponen:',
                    formula: 'Priority_Score = 0.4 × Risiko GFW + 0.4 × Frekuensi Hotspot + 0.2 × Dampak AQI',
                    p2:
                        'Risiko deforestasi historis dan frekuensi hotspot riil diberi bobot setara sebagai indikator ' +
                        'utama karena keduanya data primer yang langsung terkait kejadian karhutla. AQI diberi bobot ' +
                        'lebih rendah karena merupakan indikator dampak sekunder  dipengaruhi banyak faktor lain di ' +
                        'luar karhutla, seperti kendaraan dan industri.',
                },
                limitations: {
                    heading: 'Keterbatasan Data',
                    item1Prefix: 'Skor risiko adalah ',
                    item1Bold: 'proksi',
                    item1Suffix: ' berbasis data deforestasi historis, bukan prediksi resmi dari lembaga pemerintah.',
                    item2: 'Analisis dilakukan dalam radius 5 km di sekitar tiap titik hotspot, sehingga tidak mencerminkan kondisi persis di satu titik koordinat.',
                    item3: 'Data satelit (FIRMS) berpotensi mengalami delay dan tertutup awan, sehingga tidak semua titik api aktual terdeteksi.',
                    item4: 'Ambang batas kategori risiko dihitung dari sampel awal 20 titik hotspot asli, belum tervalidasi dengan sampel yang lebih besar (50–100+ titik).',
                    item5: 'Penetapan wilayah pada tiap hotspot memakai pendekatan titik pusat terdekat (nearest-centroid), bukan batas wilayah presisi  titik yang sangat dekat garis batas dua wilayah berpotensi salah assign.',
                    item6: 'Panduan kesiapsiagaan yang ditampilkan bersifat umum dan dikurasi dari imbauan resmi BNPB serta standar AQI US EPA  bukan peringatan dini (early warning) real-time dari BNPB/BPBD, dan tidak menggantikan arahan resmi dari petugas setempat saat kondisi darurat.',
                },
                neutrality: {
                    heading: 'Netralitas Platform',
                    text:
                        'EMBER adalah platform data-driven, bukan platform advokasi kebijakan. Semua klaim didasarkan ' +
                        'pada data resmi yang dapat diverifikasi dan tidak mengambil posisi politis terhadap kebijakan ' +
                        'pemerintah atau industri tertentu. Rekomendasi yang ditampilkan bersifat umum dan defensif ' +
                        'secara keselamatan/kesehatan (misalnya mengurangi aktivitas luar ruangan), bukan rekomendasi ' +
                        'kebijakan spesifik.',
                },
                team: {
                    heading: 'Tim Pengembang',
                    intro:
                        'EMBER dikembangkan oleh tim mahasiswa untuk International Web Technology Competition  ' +
                        'Gayatama 5 (UNESA), didorong oleh keresahan atas dampak karhutla yang berulang setiap musim ' +
                        'kemarau namun datanya tersebar di berbagai sumber resmi yang sulit diakses bersama oleh warga umum.',
                    supervisorTitle: 'Dosen Pembimbing',
                    membersLabel: 'Anggota Tim',
                },
            },
            dataSourcesList: {
                firms: {
                    name: 'NASA FIRMS',
                    role: 'Titik panas (hotspot) kebakaran',
                    description: 'Deteksi titik panas near real-time dari sensor satelit MODIS dan VIIRS, diambil untuk seluruh wilayah Indonesia setiap 6 jam.',
                },
                gfw: {
                    name: 'Global Forest Watch',
                    role: 'Proksi skor risiko karhutla',
                    description: 'Data tree cover loss (Hansen/GLAD) dalam radius 5 km di sekitar tiap hotspot, dipakai sebagai indikator riwayat deforestasi di area tersebut.',
                },
                iqair: {
                    name: 'IQAir AirVisual',
                    role: 'Kualitas udara',
                    description: 'AQI kota terdekat, diambil untuk wilayah dengan kategori risiko tinggi/sangat tinggi dan untuk lokasi yang dicek pengguna.',
                },
                gadm: {
                    name: 'GADM v4.1',
                    role: 'Batas wilayah administratif',
                    description: '502 kabupaten/kota se-Indonesia, dipakai sebagai unit agregasi untuk Ranking Wilayah Prioritas.',
                },
                bnpb: {
                    name: 'BNPB',
                    role: 'Panduan kesiapsiagaan & mitigasi',
                    description: 'Konten rekomendasi kesiapsiagaan karhutla dikurasi dari siaran pers dan imbauan resmi BNPB, dipetakan ke kategori risiko wilayah/lokasi. Ini konten statis yang dikurasi tim, bukan panggilan API real-time ke BNPB.',
                },
            },
            thresholds: {
                category: 'Kategori',
                treeCoverLoss: 'Tree cover loss',
                score: 'Skor',
            },
        },
        // Konten rekomendasi mitigasi. Backend (MitigationHelper) hanya mengirim
        // kategori (fire_risk_category / air_quality_category)  teksnya
        // sepenuhnya dirender di sini, satu sumber kebenaran untuk ID/EN,
        // konsisten dengan pola i18n di seluruh proyek ini. Sumber konten asli:
        // BNPB (fire_risk) & standar AQI US EPA (air_quality)  lihat Progress.md.
        mitigation: {
            fireRisk: {
                rendah: {
                    shortText: 'Wilayah relatif aman. Tetap hindari membakar sampah atau lahan sembarangan.',
                    fullGuidance: [
                        'Hindari aktivitas yang berisiko memicu titik api, termasuk kebiasaan membakar sampah di area terbuka.',
                        'Pantau informasi resmi BNPB/BPBD setempat secara berkala.',
                        'Laporkan ke BPBD atau layanan darurat BNPB (117) bila menemukan titik api atau asap mencurigakan.',
                    ],
                },
                sedang: {
                    shortText: 'Tingkatkan kewaspadaan. Hindari pembukaan lahan dengan cara membakar.',
                    fullGuidance: [
                        'Tingkatkan kesiapsiagaan terhadap potensi karhutla di wilayah ini.',
                        'Hindari pembukaan lahan dengan cara membakar, terutama saat cuaca kering.',
                        'Siapkan alat pelindung diri (masker, kacamata pelindung) untuk berjaga-jaga.',
                        'Laporkan titik api atau kepulan asap ke BPBD setempat sejak dini.',
                    ],
                },
                tinggi: {
                    shortText: 'Status siaga karhutla. Jangan membakar sampah/lahan, segera lapor bila menemukan titik api.',
                    fullGuidance: [
                        'Tidak membuka lahan dengan cara membakar dan berhati-hati mengelola sampah agar tidak memicu kebakaran.',
                        'Segera laporkan temuan titik api ke layanan darurat BNPB (117) atau BPBD setempat agar penanganan dapat dilakukan sedini mungkin.',
                        'Ikuti arahan resmi BPBD terkait status siaga darurat kekeringan dan karhutla di wilayah ini.',
                        'Siapkan masker dan perlengkapan pelindung pernapasan di rumah.',
                    ],
                },
                sangat_tinggi: {
                    shortText: 'Risiko sangat tinggi. Jangan mendekati api, jauhi lokasi, dan ikuti arahan evakuasi resmi.',
                    fullGuidance: [
                        'Jangan mencoba memadamkan api apabila tidak memiliki peralatan atau kemampuan yang memadai  segera menjauh dari lokasi.',
                        'Laporkan kejadian kepada petugas atau pihak berwenang secepatnya; keselamatan diri harus menjadi prioritas utama.',
                        'Pahami dan siapkan rute evakuasi dari tempat tinggal.',
                        'Ikuti arahan resmi dari BPBD dan BMKG untuk meminimalkan risiko korban jiwa dan kerugian material.',
                    ],
                },
                na: {
                    shortText: 'Data risiko deforestasi untuk lokasi ini belum tersedia.',
                    fullGuidance: [
                        'Skor risiko karhutla berbasis data deforestasi tidak berhasil dihitung untuk titik/wilayah ini.',
                        'Tetap pantau kategori kualitas udara (AQI) dan informasi resmi BNPB/BPBD setempat sebagai indikator alternatif.',
                    ],
                },
            },
            airQuality: {
                baik: {
                    shortText: 'Kualitas udara baik, aman untuk beraktivitas di luar ruangan seperti biasa.',
                    fullGuidance: [
                        'Kualitas udara dalam kategori baik dan tidak menimbulkan risiko kesehatan.',
                        'Aktivitas luar ruangan dapat dilakukan seperti biasa.',
                    ],
                },
                sedang: {
                    shortText: 'Kualitas udara sedang. Kelompok sensitif mulai perlu waspada.',
                    fullGuidance: [
                        'Masyarakat umum masih dapat beraktivitas dengan bebas seperti biasanya.',
                        'Kelompok rentan (lansia, ibu hamil, anak-anak) disarankan mulai lebih memperhatikan durasi aktivitas luar ruangan.',
                    ],
                },
                tidak_sehat: {
                    shortText: 'Kualitas udara tidak sehat. Kurangi aktivitas luar ruangan dan gunakan masker.',
                    fullGuidance: [
                        'Kurangi aktivitas atau olahraga di luar rumah, terutama bagi lansia, ibu hamil, dan anak-anak.',
                        'Gunakan masker bila terpaksa harus beraktivitas di luar rumah.',
                        'Gunakan pembersih udara di dalam ruangan bila tersedia.',
                    ],
                },
                sangat_tidak_sehat: {
                    shortText: 'Sangat tidak sehat. Batasi kegiatan dan tetap berada di dalam ruangan.',
                    fullGuidance: [
                        'Setiap orang disarankan membatasi kegiatan dan tetap berada di dalam ruangan.',
                        'Gunakan masker, tutup ventilasi udara, dan nyalakan pembersih udara di dalam rumah.',
                    ],
                },
                berbahaya: {
                    shortText: 'Kondisi berbahaya. Hindari seluruh aktivitas luar ruangan.',
                    fullGuidance: [
                        'Kondisi darurat yang dapat berdampak luas pada kesehatan masyarakat.',
                        'Hindari seluruh aktivitas di luar ruangan dan ikuti arahan dinas kesehatan/Kemenkes setempat.',
                    ],
                },
                unavailable: {
                    shortText: 'Data kualitas udara belum tersedia.',
                    fullGuidance: [
                        'Data kualitas udara untuk lokasi/wilayah ini belum tersedia.',
                    ],
                },
            },
        },
    },

    en: {
        nav: {
            dashboard: 'Dashboard',
            areaCheck: 'Check Your Area',
            about: 'Methodology',
            openMenu: 'Open menu',
            closeMenu: 'Close menu',
        },
        languageToggle: {
            switchToEnglish: 'Switch to English',
            switchToIndonesian: 'Switch to Indonesian',
        },
        risk: {
            rendah: 'Low',
            sedang: 'Medium',
            tinggi: 'High',
            sangat_tinggi: 'Very High',
            na: 'N/A',
        },
        common: {
            dataNotAvailable: 'Data not available',
            loading: 'Loading data...',
        },
        footer: {
            credit:
                'Hotspot data: NASA FIRMS · Deforestation risk data: Global Forest Watch · ' +
                'Air quality data: IQAir · Administrative boundaries: GADM v4.1 · Preparedness guidance: BNPB',
        },
        compareModal: {
            title: 'Compare Regions',
            fetchError: 'Failed to load comparison data',
            loadError: 'Failed to load comparison data. Please try again.',
            loading: 'Loading data...',
            selectAtLeast2: 'Select at least 2 regions to compare.',
        },
        compareTrigger: {
            removeAria: 'Remove {{name}} from comparison',
            selectedCount: '{{count}}/3 selected',
            compareBtn: 'Compare',
        },
        regionRanking: {
            title: 'Priority Regions',
            compareBtn: 'Compare Regions',
            cancel: 'Cancel',
            maxHint: 'Maximum {{max}} regions at once. Remove one to pick another, or click Compare.',
            chooseHint: 'Pick 2–3 regions below, then click Compare when it appears.',
            empty: 'No priority region data available for today.',
            selectAria: 'Select {{name}} to compare',
            maxTitle: 'Maximum 3 regions at once',
        },
        scoreBreakdown: {
            title: 'Priority Score Breakdown',
            empty: 'No priority score has been calculated for this region yet.',
            weightLabel: '(weight {{weight}})',
            infoAria: 'Explanation',
            priorityScore: 'Priority Score',
            priorityScoreTooltip:
                'Weighted sum of the three components above (0.4 × deforestation risk + 0.4 × hotspot frequency ' +
                '+ 0.2 × AQI impact). The higher the score, the higher this region is prioritized for monitoring and mitigation.',
            components: {
                gfw_risk: {
                    label: 'Deforestation Risk (GFW)',
                    tooltip:
                        'Average percentage of tree cover loss within a 5 km radius around each hotspot in this ' +
                        'region since 2015, used as a proxy for recurring wildfire risk  not an official government prediction.',
                },
                hotspot_frequency: {
                    label: 'Hotspot Frequency',
                    tooltip:
                        'Number of hotspots in this region over the last 7 days, normalized relative to the ' +
                        'region with the highest hotspot count in the same period.',
                },
                aqi_impact: {
                    label: 'Air Quality Impact',
                    tooltip:
                        'Average AQI of cities associated with this region, normalized against the US EPA AQI scale (0–300). ' +
                        'Weighted lower because AQI is also affected by other factors beyond wildfires, such as vehicles and industry.',
                },
            },
        },
        statTile: {
            infoAria: 'Explanation: {{label}}',
        },
        summaryCard: {
            location: 'Location',
            riskStatus: 'Wildfire Risk Status',
            scoreLabel: 'score {{score}}',
            airQuality: 'Current Air Quality',
            unknownCategory: 'Unknown category',
            nearbyHotspots: 'Nearby Hotspots',
            hotspotCountSuffix: 'points within {{radius}} km radius',
            nearestDistance: ' · nearest {{distance}} km',
            noHotspots: 'No hotspots within {{radius}} km radius',
            recommendation: 'Recommendation',
            aqiCategory: {
                baik: 'Good',
                sedang: 'Moderate',
                tidak_sehat: 'Unhealthy',
                sangat_tidak_sehat: 'Very Unhealthy',
                berbahaya: 'Hazardous',
            },
        },
        hotspotPopup: {
            riskCategoryLabel: 'Wildfire Risk Category',
            detectionConfidence: 'Detection Confidence',
            detectedAt: 'Detected',
            unknown: 'Unknown',
        },
        landing: {
            pageTitle: 'EMBER  Indonesia Wildfire Monitoring',
            badge: {
                updated: 'Data last updated {{time}}',
                unavailable: 'Data not yet available',
            },
            hero: {
                titlePrefix: 'Monitor Wildfires in ',
                titleHighlight: 'Indonesia',
                titleSuffix: ', Powered by Data.',
                description:
                    'EMBER combines NASA FIRMS satellite data, Global Forest Watch deforestation analysis, ' +
                    'and IQAir air quality data into a single priority score  so anyone can understand the ' +
                    'wildfire risk around them.',
                ctaCheckArea: 'Check Your Area',
            },
            problem: {
                badge: 'A Real Problem',
                title: 'Wildfires Happen Every Dry Season, Again and Again',
                description:
                    "Forest and land fires aren't just about temporary smoke  the impact compounds every year " +
                    'and goes beyond losing forest cover alone.',
                impact: {
                    airQuality: {
                        title: 'Air Quality Deteriorates',
                        description: 'Wildfire smoke spreads across regions and lowers the air quality residents breathe nearby.',
                    },
                    biodiversity: {
                        title: 'Biodiversity at Risk',
                        description: 'Flora and fauna habitats are lost along with the forest cover that burns.',
                    },
                    recurring: {
                        title: 'Recurs Every Year',
                        description: 'Without early monitoring, the same high-risk spots tend to burn again the following season.',
                    },
                },
                statHotspotsToday: 'Hotspots detected today',
                statHighRiskRegions: 'Regions with high-risk status',
            },
            mapPreview: {
                title: 'National Hotspot Map',
                description: 'Preview of hotspots detected today across Indonesia',
                live: 'Live',
            },
            howItWorks: {
                badge: 'How It Works',
                title: 'Simple, Yet Thorough',
                description: 'Three steps from raw satellite data to recommendations you can act on right away.',
                steps: {
                    monitor: {
                        step: '1. Monitor',
                        title: 'Real-time Hotspots',
                        description: 'Hotspot data from NASA FIRMS satellites, updated automatically every 6 hours across all of Indonesia.',
                    },
                    analyze: {
                        step: '2. Analyze',
                        title: 'Data-Driven Risk Score',
                        description: 'Each point is analyzed using historical deforestation data from Global Forest Watch to determine risk level.',
                    },
                    act: {
                        step: '3. Act',
                        title: 'Recommendations & Location Check',
                        description: 'View national priority regions, or check the air quality and risk conditions at your own location.',
                    },
                },
            },
            dataSources: {
                title: 'Data From Trusted Sources',
                description: "EMBER doesn't generate its own data  everything is aggregated from verifiable official sources.",
                firms: 'VIIRS/MODIS satellite hotspots',
                gfw: 'Historical deforestation data',
                iqair: 'Real-time air quality',
                gadm: 'Administrative boundaries',
            },
            finalCta: {
                title: 'Start Monitoring Your Area Now',
                description: 'Data is always open to everyone  residents, researchers, and policymakers alike.',
                checkAreaBtn: 'Check Your Area',
                openDashboardBtn: 'Open Dashboard',
            },
        },
        dashboard: {
            pageTitle: 'Dashboard',
            title: 'National Dashboard',
            subtitle: 'Monitoring forest and land fire hotspots across Indonesia',
            updatedBadge: 'Updated {{time}}',
            noDataYet: 'No data yet',
            stats: {
                hotspotsToday: {
                    label: "Today's Hotspots",
                    headlineActive: '{{count}} hotspots detected',
                    headlineEmpty: 'No hotspots detected',
                    tooltip: 'Hotspots from NASA FIRMS as of the latest successfully ingested data  not always today if an update was delayed.',
                },
                highRiskRegions: {
                    label: 'High-Risk Regions',
                    headlineActive: '{{count}} regions need attention',
                    headlineEmpty: 'No high-risk regions',
                    sublabel: 'of {{total}} monitored',
                    tooltip: "Regencies/cities with a Priority Score category of 'High' or 'Very High'  a combination of historical deforestation risk (GFW), hotspot frequency, and AQI impact.",
                },
                worstAqi: {
                    label: 'Worst Air Quality',
                    tooltip: 'Highest AQI (US EPA scale) among cities nearest to High/Very High category hotspots.',
                },
                coverage: {
                    label: 'System Coverage',
                    headline: 'Monitored across all of Indonesia',
                    sublabel: 'regencies/cities',
                    tooltip: 'Total regencies/cities across Indonesia whose data is monitored by EMBER. The Priority Regions list beside it shows the top 10 regions by Priority Score out of this total.',
                },
            },
            aqiLevel: {
                baik: 'Good',
                sedang: 'Moderate',
                tidakSehatSensitif: 'Unhealthy (Sensitive)',
                tidakSehat: 'Unhealthy',
            },
            mapTitle: 'Hotspot Map',
        },
        areaCheck: {
            pageTitle: 'Check Your Area',
            title: 'Check Your Area',
            description:
                'Click a location on the map, use your current location, or paste a Google Maps link to see ' +
                'wildfire risk status, air quality, and nearby hotspots.',
            loadingStages: [
                'Checking nearby hotspots...',
                'Calculating deforestation risk (GFW)...',
                'Fetching air quality data...',
                'Compiling area summary...',
            ],
            useMyLocation: 'Use My Location',
            orClickMap: 'or click directly on the map',
            mapsLinkPlaceholder: 'Paste a Google Maps link...',
            checkBtn: 'Check',
            errors: {
                outOfCoverage: 'The location is outside Indonesia or an error occurred. Try another location.',
                geoUnsupported: "Your browser doesn't support geolocation.",
                geoFailed: 'Could not get your location. Try clicking directly on the map instead.',
                linkFailed: 'Failed to process the link. Try pasting it again.',
            },
            emptyState: "Select a location to see a summary of the area's conditions.",
        },
        regionDetail: {
            backToDashboard: 'Back to Dashboard',
            fireGuidanceTitle: 'Wildfire Preparedness Guidance',
            airGuidanceTitle: 'Air Quality Guidance',
            guidanceSource: 'Source: BNPB (official press releases) · AQI scale follows the US EPA standard',
            hotspotsHeading: 'Hotspots in the Last 7 Days ({{count}})',
            noHotspots: 'No hotspots recorded in this region in the last 7 days.',
            pointsCount: '{{count}} points',
            distanceFromCenter: '{{distance}} km {{direction}} from the center of {{name}}',
            table: {
                position: 'Position',
                confidence: 'Confidence',
                frp: 'FRP',
                risk: 'Risk',
            },
        },
        about: {
            pageTitle: 'Methodology',
            title: 'Methodology',
            intro:
                'EMBER combines three official data sources into a single, easy-to-understand priority score. ' +
                'This page explains where each number comes from, how the score is calculated, and the ' +
                'limitations you should know when reading data on this platform.',
            sections: {
                dataSources: { heading: 'Data Sources' },
                calculation: {
                    heading: 'How the Risk Score Is Calculated',
                    p1Prefix: "Global Forest Watch doesn't provide a predictive risk score per point. Instead, EMBER derives a risk score from the ",
                    p1Bold: 'historical percentage of tree cover loss',
                    p1Suffix:
                        ' within a 5 km radius around each hotspot  the higher the historical deforestation around ' +
                        'a point, the higher the recurring wildfire risk score for that area.',
                    formula: 'risk_score = min(loss_percentage / 35, 1)',
                    p2Prefix: 'The number ',
                    p2Bold: '35%',
                    p2Suffix:
                        ' is the maximum scale, determined from the highest value observed in the initial test sample ' +
                        '(33.88%, rounded up to leave a margin of tolerance). The 5 km radius was chosen after empirical ' +
                        'testing against 3 km, 5 km, and 10 km radii  giving the best balance between capturing ' +
                        'surrounding context and preserving distinction between regions.',
                    thresholdsCaption: 'Risk category thresholds',
                    naNote: 'means the GFW query failed  not a zero risk.',
                },
                priorityScore: {
                    heading: 'Regional Priority Score',
                    p1: 'Each regency/city gets one daily priority score, combining three components:',
                    formula: 'Priority_Score = 0.4 × GFW Risk + 0.4 × Hotspot Frequency + 0.2 × AQI Impact',
                    p2:
                        'Historical deforestation risk and real hotspot frequency are given equal weight as primary ' +
                        'indicators because both are primary data directly tied to wildfire events. AQI is weighted ' +
                        'lower as a secondary impact indicator  it is also affected by many factors beyond wildfires, ' +
                        'such as vehicles and industry.',
                },
                limitations: {
                    heading: 'Data Limitations',
                    item1Prefix: 'The risk score is a ',
                    item1Bold: 'proxy',
                    item1Suffix: ' based on historical deforestation data, not an official prediction from a government agency.',
                    item2: 'Analysis is performed within a 5 km radius around each hotspot, so it does not reflect the exact condition at a single coordinate point.',
                    item3: 'Satellite data (FIRMS) may experience delays and cloud cover, so not every actual fire point is detected.',
                    item4: 'Risk category thresholds are calculated from an initial sample of 20 real hotspot points, not yet validated with a larger sample (50–100+ points).',
                    item5: 'Region assignment for each hotspot uses a nearest-centroid approach rather than precise boundaries  points very close to the border between two regions may be misassigned.',
                    item6: 'The preparedness guidance shown is general and curated from official BNPB advisories and the US EPA AQI standard  it is not a real-time early warning from BNPB/BPBD, and does not replace official direction from local officers during an emergency.',
                },
                neutrality: {
                    heading: 'Platform Neutrality',
                    text:
                        'EMBER is a data-driven platform, not a policy advocacy platform. All claims are based on ' +
                        'verifiable official data and do not take a political stance on any specific government or ' +
                        'industry policy. The recommendations shown are general and defensively safety/health-oriented ' +
                        '(e.g. reducing outdoor activity), not specific policy recommendations.',
                },
                team: {
                    heading: 'Development Team',
                    intro:
                        'EMBER was developed by a student team for the International Web Technology Competition  ' +
                        'Gayatama 5 (UNESA), driven by concern over the recurring impact of wildfires every dry season ' +
                        'even though the data is scattered across various official sources that are hard for the ' +
                        'general public to access together.',
                    supervisorTitle: 'Supervising Lecturer',
                    membersLabel: 'Team Members',
                },
            },
            dataSourcesList: {
                firms: {
                    name: 'NASA FIRMS',
                    role: 'Fire hotspots',
                    description: 'Near real-time hotspot detection from MODIS and VIIRS satellite sensors, retrieved for all of Indonesia every 6 hours.',
                },
                gfw: {
                    name: 'Global Forest Watch',
                    role: 'Wildfire risk score proxy',
                    description: 'Tree cover loss data (Hansen/GLAD) within a 5 km radius around each hotspot, used as an indicator of historical deforestation in the area.',
                },
                iqair: {
                    name: 'IQAir AirVisual',
                    role: 'Air quality',
                    description: 'AQI of the nearest city, retrieved for regions with High/Very High risk categories and for locations checked by users.',
                },
                gadm: {
                    name: 'GADM v4.1',
                    role: 'Administrative boundaries',
                    description: '502 regencies/cities across Indonesia, used as the aggregation unit for the Priority Regions ranking.',
                },
                bnpb: {
                    name: 'BNPB',
                    role: 'Preparedness & mitigation guidance',
                    description: 'Wildfire preparedness recommendation content curated from official BNPB press releases and advisories, mapped to region/location risk categories. This is static content curated by the team, not a real-time API call to BNPB.',
                },
            },
            thresholds: {
                category: 'Category',
                treeCoverLoss: 'Tree cover loss',
                score: 'Score',
            },
        },
        mitigation: {
            fireRisk: {
                rendah: {
                    shortText: 'Area is relatively safe. Still avoid burning trash or land carelessly.',
                    fullGuidance: [
                        'Avoid activities that risk sparking fires, including the habit of burning trash in open areas.',
                        'Monitor official BNPB/BPBD information regularly.',
                        'Report to your local BPBD or BNPB emergency service (117) if you spot a fire point or suspicious smoke.',
                    ],
                },
                sedang: {
                    shortText: 'Increase your alertness. Avoid clearing land by burning.',
                    fullGuidance: [
                        'Increase preparedness for potential wildfires in this area.',
                        'Avoid clearing land by burning, especially during dry weather.',
                        'Prepare personal protective equipment (mask, protective glasses) just in case.',
                        'Report fire points or smoke plumes to your local BPBD early.',
                    ],
                },
                tinggi: {
                    shortText: 'Wildfire alert status. Do not burn trash/land, report immediately if you spot a fire point.',
                    fullGuidance: [
                        'Do not clear land by burning and manage waste carefully to avoid sparking fires.',
                        'Immediately report any fire point to the BNPB emergency service (117) or your local BPBD so it can be handled as early as possible.',
                        'Follow official BPBD guidance on the drought and wildfire emergency alert status in this area.',
                        'Keep masks and respiratory protection gear ready at home.',
                    ],
                },
                sangat_tinggi: {
                    shortText: 'Very high risk. Do not approach the fire, stay away from the location, and follow official evacuation guidance.',
                    fullGuidance: [
                        'Do not attempt to extinguish the fire without proper equipment or training  move away from the location immediately.',
                        'Report the incident to officers or authorities as soon as possible; personal safety must be the top priority.',
                        'Know and prepare an evacuation route from your home.',
                        'Follow official guidance from BPBD and BMKG to minimize the risk of casualties and material loss.',
                    ],
                },
                na: {
                    shortText: 'Deforestation risk data for this location is not yet available.',
                    fullGuidance: [
                        'The wildfire risk score based on deforestation data could not be calculated for this point/region.',
                        'Continue monitoring the air quality (AQI) category and official BNPB/BPBD information as an alternative indicator.',
                    ],
                },
            },
            airQuality: {
                baik: {
                    shortText: 'Air quality is good, safe for outdoor activities as usual.',
                    fullGuidance: [
                        'Air quality is in the good category and poses no health risk.',
                        'Outdoor activities can proceed as usual.',
                    ],
                },
                sedang: {
                    shortText: 'Moderate air quality. Sensitive groups should start being cautious.',
                    fullGuidance: [
                        'The general public can still go about their activities as usual.',
                        'Vulnerable groups (elderly, pregnant women, children) are advised to start paying more attention to how long they spend outdoors.',
                    ],
                },
                tidak_sehat: {
                    shortText: 'Unhealthy air quality. Reduce outdoor activity and wear a mask.',
                    fullGuidance: [
                        'Reduce outdoor activities or exercise, especially for the elderly, pregnant women, and children.',
                        'Wear a mask if you must be active outdoors.',
                        'Use an indoor air purifier if available.',
                    ],
                },
                sangat_tidak_sehat: {
                    shortText: 'Very unhealthy. Limit activities and stay indoors.',
                    fullGuidance: [
                        'Everyone is advised to limit activities and stay indoors.',
                        'Wear a mask, close air vents, and turn on an indoor air purifier.',
                    ],
                },
                berbahaya: {
                    shortText: 'Hazardous condition. Avoid all outdoor activity.',
                    fullGuidance: [
                        'An emergency condition that can broadly impact public health.',
                        'Avoid all outdoor activities and follow guidance from the local health department/Ministry of Health.',
                    ],
                },
                unavailable: {
                    shortText: 'Air quality data is not yet available.',
                    fullGuidance: [
                        'Air quality data for this location/region is not yet available.',
                    ],
                },
            },
        },
    },
};