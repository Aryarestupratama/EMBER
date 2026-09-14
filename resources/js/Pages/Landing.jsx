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

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.15, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

const HERO_TEXT_FROM = '#74C69D';
const HERO_TEXT_TO = '#E85D04';
const HERO_BUTTON_FROM = '#40916C';
const HERO_BUTTON_TO = '#E85D04';

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
    const heroRef = useRef(null);
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end end'],
    });

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
            <ForestHeroSection ref={heroRef}>
                <motion.div
                    variants={staggerContainer(0.18, 0.1)}
                    initial="hidden"
                    animate="visible"
                    className="mx-auto max-w-xl px-4 text-center sm:px-0"
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
                        className="font-heading text-3xl font-bold leading-tight text-white [text-shadow:0_2px_16px_rgb(0_0_0_/_55%)] sm:text-4xl lg:text-5xl"
                    >
                        Pantau Karhutla{' '}
                        <motion.span style={{ color: indonesiaColor }}>Indonesia</motion.span>, Berbasis Data.
                    </motion.h1>

                    <motion.p
                        variants={fadeUp}
                        className="mx-auto mt-5 max-w-md text-sm text-white/90 [text-shadow:0_1px_10px_rgb(0_0_0_/_50%)] sm:text-base"
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
                            className="h-12 w-full bg-[var(--hero-btn-color)] px-6 text-sm transition-[filter] hover:brightness-90 sm:h-14 sm:w-auto sm:px-8 sm:text-base"
                        >
                            <MapPin className="h-5 w-5" />
                            Cek Daerah Kamu
                        </Button>
                    </motion.div>
                </motion.div>
            </ForestHeroSection>

            <section className="relative overflow-hidden bg-white">
                <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-risk-tinggi/5 blur-3xl" />
                <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-fresh/5 blur-3xl" />

                <motion.div
                    variants={staggerContainer(0.15)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 pt-12 sm:gap-14 sm:px-6 sm:pt-20 lg:grid-cols-2 lg:items-center"
                >
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
                            className="mt-4 font-heading text-2xl font-bold leading-tight text-ink sm:text-3xl"
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

                <motion.div
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    className="relative mx-auto mt-4 max-w-7xl px-4 pb-12 sm:px-6 sm:pb-20"
                >
                    <div className="overflow-hidden rounded-2xl border border-black/5 shadow-sm shadow-black/[0.03]">
                        <div className="flex flex-col gap-2 border-b border-black/5 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4">
                            <div>
                                <h3 className="font-heading text-sm font-semibold text-ink">
                                    Peta Titik Panas Nasional
                                </h3>
                                <p className="mt-0.5 text-xs text-ink/50">
                                    Preview titik panas terdeteksi hari ini di seluruh Indonesia
                                </p>
                            </div>
                            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-risk-tinggi/10 px-2.5 py-1 text-xs font-medium text-risk-tinggi">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-risk-tinggi" />
                                Live
                            </span>
                        </div>
                        <div className="h-[280px] w-full sm:h-[360px] lg:h-[420px]">
                            <MapView hotspots={previewHotspots ?? []} mode="nasional" />
                        </div>
                    </div>
                </motion.div>
            </section>

            <section className="border-b border-black/5 bg-canvas">
                <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
                    <div className="mx-auto max-w-xl text-center">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-dark/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-forest-dark">
                            Cara Kerja
                        </span>
                        <h2 className="mt-4 font-heading text-2xl font-bold text-ink sm:text-3xl">
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
                        className="relative mt-14 grid grid-cols-1 gap-10 sm:mt-16 md:grid-cols-3 md:gap-8"
                    >
                        <div className="pointer-events-none absolute inset-x-[12%] top-6 hidden border-t-2 border-dashed border-forest-dark/15 md:block" />

                        {HOW_IT_WORKS_STEPS.map((item, index) => (
                            <HowItWorksStep key={item.step} {...item} number={index + 1} />
                        ))}
                    </motion.div>
                </div>
            </section>

            <section className="relative overflow-hidden border-b border-black/5">
                <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-forest-dark/[0.04] blur-3xl" />

                <motion.div
                    variants={staggerContainer(0.12)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-14"
                >
                    <motion.h2 variants={fadeUp} className="font-heading text-xl font-bold text-ink sm:text-2xl">
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

            <section className="relative overflow-hidden bg-forest-dark">
                <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-fresh/10 blur-3xl" />
                <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-risk-tinggi/10 blur-3xl" />

                <motion.div
                    variants={staggerContainer(0.12)}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.4 }}
                    className="relative mx-auto max-w-7xl px-4 py-12 text-center sm:px-6 sm:py-14"
                >
                    <motion.h2 variants={fadeUp} className="font-heading text-xl font-bold text-white sm:text-2xl">
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
            className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm shadow-black/[0.03] sm:p-6"
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
            className={`relative rounded-2xl border border-black/5 bg-white p-5 pt-8 shadow-sm shadow-black/[0.03] transition-transform duration-300 hover:-translate-y-1 hover:shadow-md sm:p-6`}
        >
            <div
                className={`absolute -top-5 left-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold ring-4 ring-white ${accentClasses.badge}`}
            >
                {number}
            </div>

            <div className={`mb-4 flex h-24 w-24 items-center justify-center rounded-2xl sm:h-28 sm:w-28 ${accentClasses.blob}`}>
                <img src={image} alt="" aria-hidden="true" className="h-16 w-16 object-contain sm:h-20 sm:w-20" />
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