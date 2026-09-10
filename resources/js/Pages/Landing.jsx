import { useRef } from 'react';
import { Link } from '@inertiajs/react';
import { motion, useScroll, useTransform } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import ForestHeroSection from '@/components/ForestHeroSection';
import MapView from '@/components/MapView';
import { Button } from '@/components/ui/button';
import {
    MapPin,
    ArrowRight,
    Flame,
    AlertTriangle,
    Wind,
    Leaf,
} from 'lucide-react';

// Dipakai berulang supaya elemen anak (teks, kartu, dsb) muncul satu-satu
// (staggered) alih-alih sekaligus bersamaan.
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.15, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

// Warna literal (bukan token hex baru — nilainya disalin apa adanya dari
// --color-fresh / --color-fresh-light / --color-risk-tinggi di app.css).
// Ditulis literal karena Framer Motion cuma bisa interpolasi warna dengan
// mulus dari string hex/rgb/hsl, bukan dari `var(--...)` atau `oklch(...)`.
const HERO_TEXT_FROM = '#74C69D'; // fresh-light
const HERO_TEXT_TO = '#E85D04'; // risk-tinggi
const HERO_BUTTON_FROM = '#40916C'; // fresh
const HERO_BUTTON_TO = '#E85D04'; // risk-tinggi

// Sengaja TIDAK membungkus Button atau Link dengan motion(). Button di
// project ini dibangun di atas @base-ui/react (bukan Radix Slot murni), dan
// begitu child-nya (Link) dibungkus motion.create(), Slot-nya gagal
// mendeteksi "single valid element" lalu fallback render <button> asli milik
// Button DI LUAR + Link kita sebagai children biasa DI DALAM — makanya
// muncul kotak-dalam-kotak. Solusinya: Button & Link tetap 100% plain
// (persis pola tombol lain yang sudah pasti render benar), warnanya
// "dititipkan" lewat CSS custom property di motion.div pembungkus (lihat
// style={{ '--hero-btn-color': heroButtonColor }} di bawah), lalu tombolnya
// tinggal baca var itu via class `bg-[var(--hero-btn-color)]`.

// Warna aksen per step sengaja dibedakan (bukan cuma satu warna forest polos)
// supaya section ini tidak terasa flat/monoton — tetap dari palet token yang
// sama di app.css, bukan hex baru.
const HOW_IT_WORKS_STEPS = [
    {
        step: '1. Monitor',
        image: '/assets/features/feature-monitor.png',
        title: 'Titik Panas Real-time',
        description:
            'Data hotspot dari satelit NASA FIRMS, diperbarui otomatis setiap 6 jam untuk seluruh wilayah Indonesia.',
        accent: 'tinggi',
    },
    {
        step: '2. Analisis',
        image: '/assets/features/feature-analisis.png',
        title: 'Skor Risiko Berbasis Data',
        description:
            'Tiap titik dianalisis menggunakan data deforestasi historis dari Global Forest Watch untuk menentukan tingkat risiko.',
        accent: 'sedang',
    },
    {
        step: '3. Bertindak',
        image: '/assets/features/feature-bertindak.png',
        title: 'Rekomendasi & Cek Lokasi',
        description:
            'Lihat wilayah prioritas nasional, atau cek kondisi kualitas udara dan risiko di lokasi kamu sendiri.',
        accent: 'fresh',
    },
];

// Class Tailwind ditulis literal (bukan dirakit dari template string) supaya
// tetap terdeteksi oleh JIT compiler saat build — `bg-${accent}/10` tidak
// akan ke-scan karena bukan string statis.
const ACCENT_CLASSES = {
    tinggi: { badge: 'bg-risk-tinggi/10 text-risk-tinggi', blob: 'bg-risk-tinggi/10', ring: 'ring-risk-tinggi/20' },
    sedang: {
        badge: 'bg-risk-sedang/20 text-ink',
        blob: 'bg-risk-sedang/15',
        ring: 'ring-risk-sedang/30',
    },
    fresh: { badge: 'bg-fresh/10 text-fresh', blob: 'bg-fresh/10', ring: 'ring-fresh/20' },
};

export default function Landing({ stats, previewHotspots }) {
    // Ref yang sama persis dipakai ForestHeroSection untuk useScroll internalnya
    // (lihat forwardRef di ForestHeroSection.jsx). Dengan target & offset yang
    // sama, heroProgress di sini selalu selaras dengan transisi forest -> fire
    // di background — bukan animasi terpisah yang kebetulan mirip.
    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end end'],
    });

    // Rentang 0.1 -> 0.9 sengaja disamakan dengan fireInsetTop di
    // ForestHeroSection, supaya teks & tombol berubah warna PAS di jendela
    // waktu yang sama dengan api "memakan" hutan, bukan lebih cepat/lambat.
    const indonesiaColor = useTransform(heroProgress, [0.1, 0.9], [HERO_TEXT_FROM, HERO_TEXT_TO], {
        clamp: true,
    });
    const heroButtonColor = useTransform(heroProgress, [0.1, 0.9], [HERO_BUTTON_FROM, HERO_BUTTON_TO], {
        clamp: true,
    });

    return (
        <AppLayout
            title="EMBER — Monitoring Karhutla Indonesia"
            transparentNav
            showFooter
            footerDark
            mainClassName=""
        >
            {/* Hero — sticky-pinned, background bertransisi forest -> fire mengikuti scroll */}
            <ForestHeroSection ref={heroRef}>
                <motion.div
                    variants={staggerContainer(0.18, 0.1)}
                    initial="hidden"
                    animate="visible"
                    className="mx-auto max-w-xl text-center"
                >
                    <motion.span
                        variants={fadeUp}
                        className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-white shadow-sm backdrop-blur-sm"
                    >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fresh-light" />
                        {stats?.data_updated_at
                            ? `Data terakhir diperbarui ${formatUpdatedAt(stats.data_updated_at)}`
                            : 'Data belum tersedia'}
                    </motion.span>

                    <motion.h1
                        variants={fadeUp}
                        className="font-heading text-4xl font-bold leading-tight text-white [text-shadow:0_2px_16px_rgb(0_0_0_/_55%)] lg:text-5xl"
                    >
                        Pantau Karhutla{' '}
                        <motion.span style={{ color: indonesiaColor }}>Indonesia</motion.span>, Berbasis Data.
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="mx-auto mt-5 max-w-md text-base text-white/90 [text-shadow:0_1px_10px_rgb(0_0_0_/_50%)]"
                    >
                        EMBER menggabungkan data satelit NASA FIRMS, analisis deforestasi Global Forest Watch,
                        dan kualitas udara IQAir menjadi satu skor prioritas — supaya siapa saja bisa memahami
                        risiko karhutla di sekitar mereka.
                    </motion.p>

                    <motion.div
                        variants={fadeUp}
                        style={{ '--hero-btn-color': heroButtonColor }}
                        className="mt-8 flex flex-wrap items-center justify-center gap-3"
                    >
                        <Button
                            render={
                                <Link href={route('area-check')} className="inline-flex items-center gap-2" />
                            }
                            nativeButton={false}
                            size="lg"
                            className="h-14 bg-[var(--hero-btn-color)] px-8 text-base transition-[filter] hover:brightness-90"
                        >
                            <MapPin className="h-5 w-5" />
                            Cek Daerah Kamu
                        </Button>
                    </motion.div>
                </motion.div>
            </ForestHeroSection>

            {/* The Problem — kondisi nyata + statistik live, layout 2 kolom */}
            <section className="relative overflow-hidden bg-white">
                {/* Aksen dekoratif halus, biar section tidak terasa kosong/datar */}
                <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-risk-tinggi/5 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fresh/5 blur-3xl" />

                <motion.div
                    variants={staggerContainer(0.15)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative mx-auto grid max-w-7xl grid-cols-1 gap-14 px-6 pt-20 lg:grid-cols-2 lg:items-center"
                >
                    {/* Kolom kiri: narasi masalah */}
                    <div>
                        <motion.span
                            variants={fadeUp}
                            className="inline-flex items-center gap-1.5 rounded-full bg-risk-tinggi/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-risk-tinggi"
                        >
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Masalah Nyata
                        </motion.span>

                        <motion.h2
                            variants={fadeUp}
                            className="mt-4 font-heading text-3xl font-bold leading-tight text-ink"
                        >
                            Karhutla Terjadi Berulang, Setiap Musim Kemarau
                        </motion.h2>

                        <motion.p variants={fadeUp} className="mt-4 max-w-lg text-sm leading-relaxed text-ink/60">
                            Kebakaran hutan dan lahan bukan cuma soal asap sesaat — dampaknya menumpuk tiap tahun
                            dan melampaui kehilangan tutupan hutan saja.
                        </motion.p>

                        <div className="mt-8 space-y-5">
                            <ImpactRow
                                icon={<Wind className="h-4 w-4" />}
                                title="Kualitas Udara Memburuk"
                                description="Asap karhutla menyebar lintas wilayah dan menurunkan kualitas udara yang dihirup warga sekitar."
                            />
                            <ImpactRow
                                icon={<Leaf className="h-4 w-4" />}
                                title="Keanekaragaman Hayati Terancam"
                                description="Habitat flora dan fauna ikut hilang bersamaan dengan tutupan hutan yang terbakar."
                            />
                            <ImpactRow
                                icon={<Flame className="h-4 w-4" />}
                                title="Berulang Setiap Tahun"
                                description="Tanpa pemantauan dini, titik-titik rawan yang sama cenderung terbakar kembali musim berikutnya."
                            />
                        </div>
                    </div>

                    {/* Kolom kanan: statistik live */}
                    <motion.div
                        variants={staggerContainer(0.15)}
                        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-1"
                    >
                        <StatBlock
                            icon={<Flame className="h-5 w-5" />}
                            value={stats?.total_hotspots ?? '—'}
                            label="Titik panas terdeteksi hari ini"
                        />
                        <StatBlock
                            icon={<AlertTriangle className="h-5 w-5" />}
                            value={stats?.high_risk_regions ?? '—'}
                            label="Wilayah berstatus risiko tinggi"
                            accent
                        />
                    </motion.div>
                </motion.div>

                {/* Peta titik panas nasional — preview singkat dari data hari ini */}
                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="relative mx-auto mt-4 max-w-7xl px-6 pb-20"
                >
                    <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm shadow-black/[0.03]">
                        <div className="flex items-center justify-between border-b border-black/5 bg-white px-5 py-4">
                            <div>
                                <h3 className="font-heading text-sm font-semibold text-ink">
                                    Peta Titik Panas Nasional
                                </h3>
                                <p className="mt-0.5 text-xs text-ink/50">
                                    Preview titik panas terdeteksi hari ini di seluruh Indonesia
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-risk-tinggi/10 px-2.5 py-1 text-xs font-medium text-risk-tinggi">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-tinggi" />
                                Live
                            </span>
                        </div>
                        <div className="h-[420px] w-full">
                            <MapView hotspots={previewHotspots ?? []} mode="nasional" />
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* How it Works */}
            <section className="border-b border-black/5 bg-canvas">
                <div className="mx-auto max-w-7xl px-6 py-20">
                    <div className="mx-auto max-w-xl text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-dark">
                            Cara Kerja
                        </span>
                        <h2 className="mt-4 font-heading text-3xl font-bold text-ink">
                            Sederhana, Tapi Menyeluruh
                        </h2>
                        <p className="mt-3 text-sm text-ink/60">
                            Tiga langkah dari data mentah satelit sampai rekomendasi yang bisa langsung kamu
                            pakai.
                        </p>
                    </div>

                    <motion.div
                        variants={staggerContainer(0.18)}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        className="relative mt-16 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8"
                    >
                        {/* Garis penghubung antar-step, cuma tampil di desktop, sejajar dengan bulatan nomor */}
                        <div className="pointer-events-none absolute inset-x-[12%] top-6 hidden border-t-2 border-dashed border-forest-dark/15 md:block" />

                        {HOW_IT_WORKS_STEPS.map((item, index) => (
                            <HowItWorksStep key={item.step} {...item} number={index + 1} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Data Sources — trust signal */}
            <section className="relative overflow-hidden border-b border-black/5">
                {/* Aksen dekoratif halus, konsisten dengan section Problem di atas */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-forest-dark/[0.04] blur-3xl" />

                <motion.div
                    variants={staggerContainer(0.12)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative mx-auto max-w-7xl px-6 py-14 text-center"
                >
                    <motion.h2 variants={fadeUp} className="font-heading text-2xl font-bold text-ink">
                        Data dari Sumber Tepercaya
                    </motion.h2>
                    <motion.p variants={fadeUp} className="mx-auto mt-2 max-w-lg text-sm text-ink/60">
                        EMBER tidak membuat data sendiri — semuanya diagregasi dari sumber resmi yang dapat
                        diverifikasi.
                    </motion.p>

                    <motion.div
                        variants={staggerContainer(0.08)}
                        className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                    >
                        <SourceBlock name="NASA FIRMS" desc="Titik panas satelit VIIRS/MODIS" />
                        <SourceBlock name="Global Forest Watch" desc="Data deforestasi historis" />
                        <SourceBlock name="IQAir" desc="Kualitas udara real-time" />
                        <SourceBlock name="GADM" desc="Batas wilayah administratif" />
                    </motion.div>
                </motion.div>
            </section>

            {/* CTA Penutup */}
            <section className="relative overflow-hidden bg-forest-dark">
                {/* Aksen dekoratif halus supaya tidak terasa flat, senada dengan warna fresh & risk di hero */}
                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-fresh/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-risk-tinggi/10 blur-3xl" />

                <motion.div
                    variants={staggerContainer(0.12)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    className="relative mx-auto max-w-7xl px-6 py-14 text-center"
                >
                    <motion.h2 variants={fadeUp} className="font-heading text-2xl font-bold text-white">
                        Mulai Pantau Wilayahmu Sekarang
                    </motion.h2>
                    <motion.p variants={fadeUp} className="mx-auto mt-2 max-w-md text-sm text-white/70">
                        Data selalu terbuka untuk siapa saja — warga, peneliti, hingga pengambil kebijakan.
                    </motion.p>
                    <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center justify-center gap-3">
                        <Button
                            render={
                                <Link href={route('area-check')} className="inline-flex items-center gap-2" />
                            }
                            nativeButton={false}
                            size="lg"
                            className="bg-white text-forest-dark hover:bg-white/90"
                        >
                            Cek Daerah Kamu
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button
                            render={<Link href={route('dashboard')} />}
                            nativeButton={false}
                            size="lg"
                            variant="outline"
                            className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                        >
                            Buka Dashboard
                        </Button>
                    </motion.div>
                </motion.div>
            </section>
        </AppLayout>
    );
}

function formatUpdatedAt(isoString) {
    // PENTING: config('app.timezone') di backend masih 'UTC' (lihat config/app.php),
    // jadi isoString dari data_ingestion_logs.finished_at adalah waktu UTC.
    // Konversi ke Asia/Jakarta dipaksa eksplisit di sini via opsi `timeZone`,
    // bukan mengandalkan timezone browser pengguna (bisa berbeda-beda) atau
    // sekadar menempel label "WIB" tanpa konversi.
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta',
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    }) + ' WIB';
}

function StatBlock({ icon, value, label, accent = false }) {
    return (
        <motion.div
            variants={fadeUp}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm shadow-black/[0.03]"
        >
            <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${
                    accent ? 'bg-risk-tinggi/10 text-risk-tinggi' : 'bg-forest-dark/10 text-forest-dark'
                }`}
            >
                {icon}
            </div>
            <p className={`tabular-nums text-stat-lg ${accent ? 'text-risk-tinggi' : 'text-forest-dark'}`}>
                {value}
            </p>
            <p className="mt-1 text-sm text-ink/60">{label}</p>
        </motion.div>
    );
}

function ImpactRow({ icon, title, description }) {
    return (
        <motion.div variants={fadeUp} className="flex gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-fresh/10 text-fresh">
                {icon}
            </div>
            <div>
                <h3 className="font-heading text-sm font-semibold text-ink">{title}</h3>
                <p className="mt-1 text-sm text-ink/60">{description}</p>
            </div>
        </motion.div>
    );
}

function HowItWorksStep({ image, step, title, description, accent, number }) {
    const accentClasses = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.fresh;

    return (
        <motion.div
            variants={fadeUp}
            className={`relative rounded-2xl border border-black/5 bg-white p-6 pt-8 shadow-sm shadow-black/[0.03] transition-transform duration-300 hover:-translate-y-1 hover:shadow-md`}
        >
            {/* Bulatan nomor, sejajar dengan garis penghubung horizontal di atas grid */}
            <div
                className={`absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold ring-4 ring-white ${accentClasses.badge}`}
            >
                {number}
            </div>

            <div className={`mb-4 flex h-28 w-28 items-center justify-center rounded-2xl ${accentClasses.blob}`}>
                <img src={image} alt="" aria-hidden="true" className="h-20 w-20 object-contain" />
            </div>

            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{step}</p>
            <h3 className="mt-1 font-heading text-base font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm text-ink/60">{description}</p>
        </motion.div>
    );
}

function SourceBlock({ name, desc }) {
    return (
        <motion.div
            variants={fadeUp}
            className="rounded-xl border border-black/5 p-5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-sm hover:shadow-black/[0.03]"
        >
            <p className="font-heading text-sm font-semibold text-forest-dark">{name}</p>
            <p className="mt-1 text-xs text-ink/50">{desc}</p>
        </motion.div>
    );
}