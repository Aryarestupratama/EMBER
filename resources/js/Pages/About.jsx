import AppLayout from '@/Layouts/AppLayout';
import RiskBadge from '@/components/RiskBadge';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import {
    Satellite,
    TreeDeciduous,
    Wind,
    MapPinned,
    ScaleIcon,
    TriangleAlert,
    ShieldCheck,
    LifeBuoy,
    Users,
    GraduationCap,
} from 'lucide-react';

// Sama persis pola di Dashboard.jsx/RegionDetail.jsx/AreaCheck.jsx — animate
// langsung jalan pas halaman dimuat (bukan whileInView), supaya "rasa"
// transisi antar halaman konsisten se-aplikasi, bukan cuma di halaman kerja.
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

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
    {
        icon: LifeBuoy,
        name: 'BNPB',
        role: 'Panduan kesiapsiagaan & mitigasi',
        description:
            'Konten rekomendasi kesiapsiagaan karhutla dikurasi dari siaran pers dan imbauan resmi BNPB, dipetakan ke kategori risiko wilayah/lokasi. Ini konten statis yang dikurasi tim, bukan panggilan API real-time ke BNPB.',
    },
];

const SUPERVISOR = {
    name: 'Siti Maesaroh, S.Kom., M.T.I.',
    title: 'Dosen Pembimbing',
    affiliation: 'Universitas Mercu Buana',
};

const TEAM_MEMBERS = [
    { name: 'Arya Restu Pratama', role: '[Peran]' },
    { name: 'Justin Dwinata', role: '[Peran]' },
    { name: 'Mutia Bela Puspita', role: '[Peran]' },
    { name: 'Azka Niaji Rangkuti', role: '[Peran]' },
];

const THRESHOLDS = [
    { category: 'rendah', range: '0% – 13%', score: '0 – 0.37' },
    { category: 'sedang', range: '13% – 18%', score: '0.37 – 0.51' },
    { category: 'tinggi', range: '18% – 23%', score: '0.51 – 0.66' },
    { category: 'sangat_tinggi', range: '23% – 35%+', score: '0.66 – 1.0' },
];

// Header section dengan icon dalam chip warna — pola yang sama dengan
// SectionRow di SummaryCard.jsx dan GuidanceColumn di RegionDetail.jsx,
// supaya kepala tiap section terasa konsisten dengan komponen lain,
// bukan cuma icon polos mengambang di sebelah teks.
function SectionHeading({ icon: Icon, iconClass, bgClass, children }) {
    return (
        <h2 className="mb-4 flex items-center gap-2.5 font-heading text-lg font-semibold text-ink">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
                <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={2.2} />
            </span>
            {children}
        </h2>
    );
}

export default function About() {
    return (
        <AppLayout title="Metodologi" active="about" mainClassName="mx-auto max-w-4xl px-6 py-10">
            <motion.div
                variants={staggerContainer(0.12)}
                initial="hidden"
                animate="visible"
                className="relative"
            >
                {/* Aksen dekoratif halus, konsisten dengan Dashboard.jsx/RegionDetail.jsx/
                    AreaCheck.jsx — murni dekorasi, tidak pernah menghalangi klik. */}
                <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-forest-dark/[0.04] blur-3xl" />
                <div className="pointer-events-none absolute top-96 -left-16 -z-10 h-64 w-64 rounded-full bg-fresh/[0.05] blur-3xl" />

                {/* Intro */}
                <motion.div variants={fadeUp} className="mb-10">
                    <h1 className="font-heading text-2xl font-bold text-ink">Metodologi</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink/70">
                        EMBER menggabungkan tiga sumber data resmi menjadi satu skor prioritas yang mudah
                        dipahami. Halaman ini menjelaskan dari mana setiap angka berasal, bagaimana skor
                        dihitung, dan keterbatasan yang perlu diketahui saat membaca data di platform ini.
                    </p>
                </motion.div>

                {/* Sumber Data */}
                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={Satellite} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        Sumber Data
                    </SectionHeading>
                    <motion.div
                        variants={staggerContainer(0.08)}
                        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                    >
                        {DATA_SOURCES.map((source) => (
                            <motion.div key={source.name} variants={fadeUp}>
                                <Card className="h-full border-black/5 shadow-sm transition-shadow hover:shadow-md">
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
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.section>

                {/* Cara Menghitung Skor */}
                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={ScaleIcon} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        Cara Skor Risiko Dihitung
                    </SectionHeading>

                    <Card className="mb-4 border-black/5 shadow-sm">
                        <CardContent className="space-y-3 p-5 text-sm leading-relaxed text-ink/70">
                            <p>
                                Global Forest Watch tidak menyediakan skor risiko prediktif per titik.
                                Sebagai gantinya, EMBER menurunkan skor risiko dari{' '}
                                <strong className="text-ink">persentase tree cover loss historis</strong>{' '}
                                dalam radius 5 km di sekitar tiap titik hotspot — semakin tinggi
                                deforestasi historis di sekitar suatu titik, semakin tinggi skor risiko
                                karhutla berulang di area tersebut.
                            </p>
                            <p className="rounded-lg bg-canvas px-4 py-3 font-mono text-xs text-ink/80">
                                risk_score = min(loss_percentage / 35, 1)
                            </p>
                            <p>
                                Angka <strong className="text-ink">35%</strong> adalah skala maksimum,
                                ditentukan dari nilai tertinggi yang teramati pada sampel pengujian awal
                                (33,88%, dibulatkan ke atas untuk memberi ruang toleransi). Radius 5 km
                                dipilih setelah pengujian empiris terhadap radius 3 km, 5 km, dan 10 km —
                                memberi keseimbangan terbaik antara konteks area sekitar dan daya pembeda
                                antar wilayah.
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
                                Titik dengan kategori{' '}
                                <RiskBadge category="na" className="mx-1 align-middle" />
                                berarti data GFW gagal diambil — bukan risiko nol.
                            </p>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Priority Score */}
                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={ScaleIcon} iconClass="text-fresh" bgClass="bg-fresh/10">
                        Skor Prioritas Wilayah
                    </SectionHeading>
                    <Card className="border-black/5 shadow-sm">
                        <CardContent className="space-y-3 p-5 text-sm leading-relaxed text-ink/70">
                            <p>
                                Setiap wilayah kabupaten/kota mendapat satu skor prioritas harian, gabungan
                                dari tiga komponen:
                            </p>
                            <p className="rounded-lg bg-canvas px-4 py-3 font-mono text-xs text-ink/80">
                                Priority_Score = 0.4 × Risiko GFW + 0.4 × Frekuensi Hotspot + 0.2 × Dampak
                                AQI
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
                </motion.section>

                {/* Keterbatasan Data */}
                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading
                        icon={TriangleAlert}
                        iconClass="text-risk-tinggi"
                        bgClass="bg-risk-tinggi/10"
                    >
                        Keterbatasan Data
                    </SectionHeading>
                    <Card className="border-black/5 shadow-sm">
                        <CardContent className="p-5">
                            <motion.ul
                                variants={staggerContainer(0.06)}
                                className="space-y-2.5 text-sm leading-relaxed text-ink/70"
                            >
                                {[
                                    <>
                                        Skor risiko adalah <strong className="text-ink">proksi</strong>{' '}
                                        berbasis data deforestasi historis, bukan prediksi resmi dari
                                        lembaga pemerintah.
                                    </>,
                                    <>
                                        Analisis dilakukan dalam radius 5 km di sekitar tiap titik hotspot,
                                        sehingga tidak mencerminkan kondisi persis di satu titik koordinat.
                                    </>,
                                    <>
                                        Data satelit (FIRMS) berpotensi mengalami delay dan tertutup awan,
                                        sehingga tidak semua titik api aktual terdeteksi.
                                    </>,
                                    <>
                                        Ambang batas kategori risiko dihitung dari sampel awal 20 titik
                                        hotspot asli, belum tervalidasi dengan sampel yang lebih besar
                                        (50–100+ titik).
                                    </>,
                                    <>
                                        Penetapan wilayah pada tiap hotspot memakai pendekatan titik pusat
                                        terdekat (nearest-centroid), bukan batas wilayah presisi — titik
                                        yang sangat dekat garis batas dua wilayah berpotensi salah assign.
                                    </>,
                                    <>
                                        Panduan kesiapsiagaan yang ditampilkan bersifat umum dan dikurasi
                                        dari imbauan resmi BNPB serta standar AQI US EPA — bukan peringatan
                                        dini (early warning) real-time dari BNPB/BPBD, dan tidak
                                        menggantikan arahan resmi dari petugas setempat saat kondisi
                                        darurat.
                                    </>,
                                ].map((point, i) => (
                                    <motion.li
                                        key={i}
                                        variants={fadeUp}
                                        className="flex items-start gap-2.5 rounded-lg px-3 py-2 transition-colors hover:bg-canvas"
                                    >
                                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ink/30" />
                                        <span>{point}</span>
                                    </motion.li>
                                ))}
                            </motion.ul>
                        </CardContent>
                    </Card>
                </motion.section>

                {/* Netralitas */}
                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={ShieldCheck} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        Netralitas Platform
                    </SectionHeading>
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
                </motion.section>

                {/* Tentang Tim & Pembimbing */}
                <motion.section variants={fadeUp} className="mb-10">
                    <SectionHeading icon={Users} iconClass="text-forest-dark" bgClass="bg-forest/10">
                        Tim Pengembang
                    </SectionHeading>
                    <Card className="border-black/5 shadow-sm">
                        <CardContent className="p-5">
                            <p className="mb-5 text-sm leading-relaxed text-ink/70">
                                EMBER dikembangkan oleh tim mahasiswa untuk International Web Technology
                                Competition — Gayatama 5 (UNESA), didorong oleh keresahan atas dampak
                                karhutla yang berulang setiap musim kemarau namun datanya tersebar di
                                berbagai sumber resmi yang sulit diakses bersama oleh warga umum.
                            </p>

                            {/* Dosen Pembimbing — ditampilkan terpisah dari grid anggota supaya
                                perannya sebagai pembimbing tidak tercampur secara visual dengan
                                anggota tim pelaksana. */}
                            <div className="mb-5 flex items-center gap-3 rounded-lg bg-canvas px-4 py-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest-dark/10 text-forest-dark">
                                    <GraduationCap className="h-4.5 w-4.5" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                                        {SUPERVISOR.title}
                                    </p>
                                    <p className="font-heading text-sm font-semibold text-ink">
                                        {SUPERVISOR.name}
                                    </p>
                                    <p className="text-xs text-ink/50">{SUPERVISOR.affiliation}</p>
                                </div>
                            </div>

                            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-ink/40">
                                Anggota Tim
                            </p>
                            <motion.div
                                variants={staggerContainer(0.08)}
                                className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                            >
                                {TEAM_MEMBERS.map((member) => (
                                    <motion.div
                                        key={member.name}
                                        variants={fadeUp}
                                        className="flex items-center gap-3 rounded-lg border border-black/5 px-4 py-3 transition-colors hover:bg-canvas"
                                    >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fresh/10 text-fresh">
                                            <Users className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-ink">
                                                {member.name}
                                            </p>
                                            <p className="text-xs text-ink/50">{member.role}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.section>

                <motion.div variants={fadeUp}>
                    <SourceCredit />
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}