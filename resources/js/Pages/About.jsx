import { Head, Link } from '@inertiajs/react';
import RiskBadge from '@/components/RiskBadge';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import {
    Satellite,
    TreeDeciduous,
    Wind,
    MapPinned,
    ScaleIcon,
    TriangleAlert,
    ShieldCheck,
} from 'lucide-react';

const DATA_SOURCES = [
    {
        icon: Satellite,
        name: 'NASA FIRMS',
        role: 'Titik panas (hotspot) kebakaran',
        description:
            'Deteksi titik panas near real-time dari sensor satelit MODIS dan VIIRS, diambil untuk seluruh wilayah Indonesia setiap 6 jam.',
    },
    {
        icon: TreeDeciduous,
        name: 'Global Forest Watch',
        role: 'Proksi skor risiko karhutla',
        description:
            'Data tree cover loss (Hansen/GLAD) dalam radius 5 km di sekitar tiap hotspot, dipakai sebagai indikator riwayat deforestasi di area tersebut.',
    },
    {
        icon: Wind,
        name: 'IQAir AirVisual',
        role: 'Kualitas udara',
        description:
            'AQI kota terdekat, diambil untuk wilayah dengan kategori risiko tinggi/sangat tinggi dan untuk lokasi yang dicek pengguna.',
    },
    {
        icon: MapPinned,
        name: 'GADM v4.1',
        role: 'Batas wilayah administratif',
        description:
            '502 kabupaten/kota se-Indonesia, dipakai sebagai unit agregasi untuk Ranking Wilayah Prioritas.',
    },
];

const THRESHOLDS = [
    { category: 'rendah', range: '0% – 13%', score: '0 – 0.37' },
    { category: 'sedang', range: '13% – 18%', score: '0.37 – 0.51' },
    { category: 'tinggi', range: '18% – 23%', score: '0.51 – 0.66' },
    { category: 'sangat_tinggi', range: '23% – 35%+', score: '0.66 – 1.0' },
];

export default function About() {
    return (
        <>
            <Head title="Metodologi — EMBER" />

            <div className="min-h-screen bg-canvas">
                <header className="sticky top-0 z-10 border-b border-black/5 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href={route('home')} className="flex items-baseline gap-2">
                            <span className="font-heading text-xl font-bold tracking-tight text-forest-dark">
                                EMBER
                            </span>
                        </Link>
                        <nav className="flex items-center gap-6 text-sm font-medium text-ink/70">
                            <Link href={route('dashboard')} className="transition-colors hover:text-forest-dark">
                                Dashboard
                            </Link>
                            <Link href={route('area-check')} className="transition-colors hover:text-forest-dark">
                                Cek Daerah Kamu
                            </Link>
                            <Link href={route('about')} className="text-forest-dark">
                                Metodologi
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-4xl px-6 py-10">
                    {/* Intro */}
                    <div className="mb-10">
                        <h1 className="font-heading text-2xl font-bold text-ink">Metodologi</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
                            EMBER menggabungkan tiga sumber data resmi menjadi satu skor prioritas yang mudah
                            dipahami. Halaman ini menjelaskan dari mana setiap angka berasal, bagaimana skor
                            dihitung, dan keterbatasan yang perlu diketahui saat membaca data di platform ini.
                        </p>
                    </div>

                    {/* Sumber Data */}
                    <section className="mb-10">
                        <h2 className="mb-4 font-heading text-lg font-semibold text-ink">Sumber Data</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {DATA_SOURCES.map((source) => (
                                <Card key={source.name} className="border-black/5 shadow-sm">
                                    <CardContent className="p-5">
                                        <div className="mb-3 flex items-center gap-2.5">
                                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-forest/10 text-forest-dark">
                                                <source.icon className="h-4 w-4" />
                                            </span>
                                            <div>
                                                <p className="font-heading text-sm font-semibold text-ink">
                                                    {source.name}
                                                </p>
                                                <p className="text-xs text-ink/50">{source.role}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm leading-relaxed text-ink/70">
                                            {source.description}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Cara Menghitung Skor */}
                    <section className="mb-10">
                        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-ink">
                            <ScaleIcon className="h-4.5 w-4.5 text-forest-dark" />
                            Cara Skor Risiko Dihitung
                        </h2>

                        <Card className="mb-4 border-black/5 shadow-sm">
                            <CardContent className="space-y-3 p-5 text-sm leading-relaxed text-ink/70">
                                <p>
                                    Global Forest Watch tidak menyediakan skor risiko prediktif per titik. Sebagai
                                    gantinya, EMBER menurunkan skor risiko dari{' '}
                                    <strong className="text-ink">persentase tree cover loss historis</strong>{' '}
                                    dalam radius 5 km di sekitar tiap titik hotspot — semakin tinggi deforestasi
                                    historis di sekitar suatu titik, semakin tinggi skor risiko karhutla berulang
                                    di area tersebut.
                                </p>
                                <p className="rounded-lg bg-canvas px-4 py-3 font-mono text-xs text-ink/80">
                                    risk_score = min(loss_percentage / 35, 1)
                                </p>
                                <p>
                                    Angka <strong className="text-ink">35%</strong> adalah skala maksimum,
                                    ditentukan dari nilai tertinggi yang teramati pada sampel pengujian awal
                                    (33,88%, dibulatkan ke atas untuk memberi ruang toleransi). Radius 5 km dipilih
                                    setelah pengujian empiris terhadap radius 3 km, 5 km, dan 10 km — memberi
                                    keseimbangan terbaik antara konteks area sekitar dan daya pembeda antar
                                    wilayah.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-black/5 shadow-sm">
                            <CardContent className="p-5">
                                <p className="mb-3 text-xs font-medium text-ink/50">
                                    Ambang batas kategori risiko
                                </p>
                                <div className="overflow-hidden rounded-lg border border-black/5">
                                    <table className="w-full text-sm">
                                        <thead className="bg-canvas/70 text-left text-xs uppercase tracking-wide text-ink/40">
                                            <tr>
                                                <th className="px-4 py-2.5">Kategori</th>
                                                <th className="px-4 py-2.5">Tree cover loss</th>
                                                <th className="px-4 py-2.5">Skor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5">
                                            {THRESHOLDS.map((row) => (
                                                <tr key={row.category}>
                                                    <td className="px-4 py-2.5">
                                                        <RiskBadge category={row.category} />
                                                    </td>
                                                    <td className="tabular-nums px-4 py-2.5 text-ink/70">
                                                        {row.range}
                                                    </td>
                                                    <td className="tabular-nums px-4 py-2.5 text-ink/70">
                                                        {row.score}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-ink/50">
                                    Titik dengan kategori <RiskBadge category="na" className="mx-1 align-middle" />
                                    berarti data GFW gagal diambil — bukan risiko nol.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Priority Score */}
                    <section className="mb-10">
                        <h2 className="mb-4 font-heading text-lg font-semibold text-ink">
                            Skor Prioritas Wilayah
                        </h2>
                        <Card className="border-black/5 shadow-sm">
                            <CardContent className="space-y-3 p-5 text-sm leading-relaxed text-ink/70">
                                <p>
                                    Setiap wilayah kabupaten/kota mendapat satu skor prioritas harian, gabungan
                                    dari tiga komponen:
                                </p>
                                <p className="rounded-lg bg-canvas px-4 py-3 font-mono text-xs text-ink/80">
                                    Priority_Score = 0.4 × Risiko GFW + 0.4 × Frekuensi Hotspot + 0.2 × Dampak AQI
                                </p>
                                <p>
                                    Risiko deforestasi historis dan frekuensi hotspot riil diberi bobot setara
                                    sebagai indikator utama karena keduanya data primer yang langsung terkait
                                    kejadian karhutla. AQI diberi bobot lebih rendah karena merupakan indikator
                                    dampak sekunder — dipengaruhi banyak faktor lain di luar karhutla, seperti
                                    kendaraan dan industri.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Keterbatasan Data */}
                    <section className="mb-10">
                        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-ink">
                            <TriangleAlert className="h-4.5 w-4.5 text-risk-tinggi" />
                            Keterbatasan Data
                        </h2>
                        <Card className="border-black/5 shadow-sm">
                            <CardContent className="p-5">
                                <ul className="space-y-3 text-sm leading-relaxed text-ink/70">
                                    <li className="flex gap-2.5">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                                        <span>
                                            Skor risiko adalah <strong className="text-ink">proksi</strong>{' '}
                                            berbasis data deforestasi historis, bukan prediksi resmi dari lembaga
                                            pemerintah.
                                        </span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                                        <span>
                                            Analisis dilakukan dalam radius 5 km di sekitar tiap titik hotspot,
                                            sehingga tidak mencerminkan kondisi persis di satu titik koordinat.
                                        </span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                                        <span>
                                            Data satelit (FIRMS) berpotensi mengalami delay dan tertutup awan,
                                            sehingga tidak semua titik api aktual terdeteksi.
                                        </span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                                        <span>
                                            Ambang batas kategori risiko dihitung dari sampel awal 20 titik hotspot
                                            asli, belum tervalidasi dengan sampel yang lebih besar (50–100+ titik).
                                        </span>
                                    </li>
                                    <li className="flex gap-2.5">
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                                        <span>
                                            Penetapan wilayah pada tiap hotspot memakai pendekatan titik pusat
                                            terdekat (nearest-centroid), bukan batas wilayah presisi — titik yang
                                            sangat dekat garis batas dua wilayah berpotensi salah assign.
                                        </span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>
                    </section>

                    {/* Netralitas */}
                    <section className="mb-10">
                        <h2 className="mb-4 flex items-center gap-2 font-heading text-lg font-semibold text-ink">
                            <ShieldCheck className="h-4.5 w-4.5 text-forest-dark" />
                            Netralitas Platform
                        </h2>
                        <Card className="border-black/5 bg-forest-dark/[0.03] shadow-sm">
                            <CardContent className="p-5 text-sm leading-relaxed text-ink/70">
                                <p>
                                    EMBER adalah platform data-driven, bukan platform advokasi kebijakan. Semua
                                    klaim didasarkan pada data resmi yang dapat diverifikasi dan tidak mengambil
                                    posisi politis terhadap kebijakan pemerintah atau industri tertentu.
                                    Rekomendasi yang ditampilkan bersifat umum dan defensif secara
                                    keselamatan/kesehatan (misalnya mengurangi aktivitas luar ruangan), bukan
                                    rekomendasi kebijakan spesifik.
                                </p>
                            </CardContent>
                        </Card>
                    </section>

                    <SourceCredit />
                </main>
            </div>
        </>
    );
}