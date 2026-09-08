import { Head, Link } from '@inertiajs/react';
import MapView from '@/components/MapView';
import SourceCredit from '@/components/SourceCredit';
import { Button } from '@/components/ui/button';
import { Satellite, TreePine, MapPin, ArrowRight } from 'lucide-react';

export default function Landing({ stats, previewHotspots }) {
    return (
        <>
            <Head title="EMBER — Monitoring Karhutla Indonesia" />

            <div className="min-h-screen bg-white">
                {/* Header */}
                <header className="border-b border-black/5">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <span className="font-heading text-xl font-bold tracking-tight text-forest-dark">
                            EMBER
                        </span>
                        <nav className="flex items-center gap-6 text-sm font-medium text-ink/70">
                            <Link href={route('dashboard')} className="transition-colors hover:text-forest-dark">
                                Dashboard
                            </Link>
                            <Link href={route('area-check')} className="transition-colors hover:text-forest-dark">
                                Cek Daerah Kamu
                            </Link>
                            <Link href={route('about')} className="transition-colors hover:text-forest-dark">
                                Metodologi
                            </Link>
                        </nav>
                        <Button asChild className="bg-forest hover:bg-forest-dark">
                            <Link href={route('dashboard')}>Buka Dashboard</Link>
                        </Button>
                    </div>
                </header>

                {/* Hero — peta live sungguhan, bukan ilustrasi (Design.md §1) */}
                <section className="border-b border-black/5 bg-canvas">
                    <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-2">
                        <div>
                            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-fresh/10 px-3 py-1 text-xs font-medium text-fresh">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fresh" />
                                Data diperbarui otomatis tiap 6 jam
                            </span>

                            <h1 className="font-heading text-4xl font-bold leading-tight text-ink lg:text-5xl">
                                Pantau Karhutla{' '}
                                <span className="text-forest-dark">Indonesia</span>, Berbasis Data.
                            </h1>

                            <p className="mt-5 max-w-md text-base text-ink/60">
                                EMBER menggabungkan data satelit NASA FIRMS, analisis deforestasi Global Forest Watch,
                                dan kualitas udara IQAir menjadi satu skor prioritas — supaya siapa saja bisa memahami
                                risiko karhutla di sekitar mereka.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Button asChild size="lg" className="bg-forest hover:bg-forest-dark">
                                    <Link href={route('dashboard')} className="inline-flex items-center gap-2">
                                        Buka Dashboard
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button asChild size="lg" variant="outline">
                                    <Link href={route('area-check')} className="inline-flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        Cek Daerah Kamu
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="h-[420px] overflow-hidden rounded-xl border border-black/5 shadow-sm">
                            <MapView hotspots={previewHotspots ?? []} mode="nasional" />
                        </div>
                    </div>
                </section>

                {/* The Problem — statistik live singkat */}
                <section className="border-b border-black/5">
                    <div className="mx-auto max-w-7xl px-6 py-14">
                        <h2 className="font-heading text-2xl font-bold text-ink">Masalahnya Nyata, Hari Ini</h2>
                        <p className="mt-2 max-w-2xl text-sm text-ink/60">
                            Kebakaran hutan dan lahan terjadi berulang setiap musim kemarau, dengan dampak yang
                            melampaui kehilangan tutupan hutan.
                        </p>

                        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <StatBlock
                                value={stats?.total_hotspots ?? '—'}
                                label="Titik panas terdeteksi hari ini"
                            />
                            <StatBlock
                                value={stats?.high_risk_regions ?? '—'}
                                label="Wilayah berstatus risiko tinggi"
                                accent
                            />
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="border-b border-black/5 bg-canvas">
                    <div className="mx-auto max-w-7xl px-6 py-14">
                        <h2 className="text-center font-heading text-2xl font-bold text-ink">
                            Sederhana, Tapi Menyeluruh
                        </h2>

                        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
                            <HowItWorksStep
                                icon={<Satellite className="h-5 w-5" />}
                                step="1. Monitor"
                                title="Titik Panas Real-time"
                                description="Data hotspot dari satelit NASA FIRMS, diperbarui otomatis setiap 6 jam untuk seluruh wilayah Indonesia."
                            />
                            <HowItWorksStep
                                icon={<TreePine className="h-5 w-5" />}
                                step="2. Analisis"
                                title="Skor Risiko Berbasis Data"
                                description="Tiap titik dianalisis menggunakan data deforestasi historis dari Global Forest Watch untuk menentukan tingkat risiko."
                            />
                            <HowItWorksStep
                                icon={<MapPin className="h-5 w-5" />}
                                step="3. Bertindak"
                                title="Rekomendasi & Cek Lokasi"
                                description="Lihat wilayah prioritas nasional, atau cek kondisi kualitas udara dan risiko di lokasi kamu sendiri."
                            />
                        </div>
                    </div>
                </section>

                {/* Data Sources — trust signal */}
                <section className="border-b border-black/5">
                    <div className="mx-auto max-w-7xl px-6 py-14 text-center">
                        <h2 className="font-heading text-2xl font-bold text-ink">Data dari Sumber Tepercaya</h2>
                        <p className="mx-auto mt-2 max-w-lg text-sm text-ink/60">
                            EMBER tidak membuat data sendiri — semuanya diagregasi dari sumber resmi yang dapat
                            diverifikasi.
                        </p>

                        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            <SourceBlock name="NASA FIRMS" desc="Titik panas satelit VIIRS/MODIS" />
                            <SourceBlock name="Global Forest Watch" desc="Data deforestasi historis" />
                            <SourceBlock name="IQAir" desc="Kualitas udara real-time" />
                            <SourceBlock name="GADM" desc="Batas wilayah administratif" />
                        </div>
                    </div>
                </section>

                {/* CTA Penutup */}
                <section className="bg-forest-dark">
                    <div className="mx-auto max-w-7xl px-6 py-14 text-center">
                        <h2 className="font-heading text-2xl font-bold text-white">
                            Mulai Pantau Wilayahmu Sekarang
                        </h2>
                        <p className="mx-auto mt-2 max-w-md text-sm text-white/70">
                            Data selalu terbuka untuk siapa saja — warga, peneliti, hingga pengambil kebijakan.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <Button asChild size="lg" className="bg-white text-forest-dark hover:bg-white/90">
                                <Link href={route('area-check')} className="inline-flex items-center gap-2">
                                    Cek Daerah Kamu
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button
                                asChild
                                size="lg"
                                variant="outline"
                                className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"
                            >
                                <Link href={route('dashboard')}>Buka Dashboard</Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-forest-dark px-6 py-6">
                    <div className="mx-auto max-w-7xl">
                        <SourceCredit className="text-white/50" />
                    </div>
                </footer>
            </div>
        </>
    );
}

function StatBlock({ value, label, accent = false }) {
    return (
        <div className="rounded-xl border border-black/5 bg-white p-6">
            <p className={`tabular-nums text-stat-lg ${accent ? 'text-risk-tinggi' : 'text-forest-dark'}`}>
                {value}
            </p>
            <p className="mt-1 text-sm text-ink/60">{label}</p>
        </div>
    );
}

function HowItWorksStep({ icon, step, title, description }) {
    return (
        <div className="rounded-xl border border-black/5 bg-white p-6">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-fresh/10 text-fresh">
                {icon}
            </div>
            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{step}</p>
            <h3 className="mt-1 font-heading text-base font-semibold text-ink">{title}</h3>
            <p className="mt-2 text-sm text-ink/60">{description}</p>
        </div>
    );
}

function SourceBlock({ name, desc }) {
    return (
        <div className="rounded-xl border border-black/5 p-5">
            <p className="font-heading text-sm font-semibold text-forest-dark">{name}</p>
            <p className="mt-1 text-xs text-ink/50">{desc}</p>
        </div>
    );
}