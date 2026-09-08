import { Head, Link } from '@inertiajs/react';
import MapView from '@/components/MapView';
import StatTile from '@/components/StatTile';
import RegionRankingList from '@/components/RegionRankingList';
import SourceCredit from '@/components/SourceCredit';
import { Badge } from '@/components/ui/badge';

export default function Dashboard({ hotspots, stats, topRegions }) {
    const lastUpdated = stats.last_updated
        ? new Date(stats.last_updated).toLocaleString('id-ID', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          })
        : 'Belum ada data';

    return (
        <>
            <Head title="Dashboard — EMBER" />

            <div className="min-h-screen bg-canvas">
                {/* Header */}
                <header className="sticky top-0 z-10 border-b border-black/5 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <div>
                            <Link href={route('home')} className="flex items-baseline gap-2">
                                <span className="font-heading text-xl font-bold tracking-tight text-forest-dark">
                                    EMBER
                                </span>
                                <span className="hidden text-xs text-ink/40 sm:inline">
                                    Early Monitoring for Burning Environment &amp; Reforestation
                                </span>
                            </Link>
                        </div>

                        <nav className="flex items-center gap-6 text-sm font-medium text-ink/70">
                            <Link href={route('dashboard')} className="text-forest-dark">
                                Dashboard
                            </Link>
                            <Link href={route('area-check')} className="transition-colors hover:text-forest-dark">
                                Cek Daerah Kamu
                            </Link>
                            <Link href={route('about')} className="transition-colors hover:text-forest-dark">
                                Metodologi
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-8">
                    {/* Page title + live indicator */}
                    <div className="mb-6 flex items-end justify-between">
                        <div>
                            <h1 className="font-heading text-2xl font-bold text-ink">
                                Dashboard Nasional
                            </h1>
                            <p className="mt-1 text-sm text-ink/60">
                                Monitoring titik panas kebakaran hutan dan lahan di seluruh Indonesia
                            </p>
                        </div>

                        <Badge className="gap-1.5 border-0 bg-fresh/10 text-fresh">
                            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fresh" />
                            Diperbarui {lastUpdated}
                        </Badge>
                    </div>

                    {/* Stat tiles */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        <StatTile
                            label="Total Hotspot Hari Ini"
                            value={stats.total_hotspots}
                        />
                        <StatTile
                            label="Wilayah Risiko Tinggi"
                            value={stats.high_risk_regions}
                            accent={stats.high_risk_regions > 0}
                        />
                        <StatTile
                            label="AQI Terburuk"
                            value={stats.worst_aqi?.nearest_city_aqi ?? null}
                            sublabel={stats.worst_aqi?.nearest_city_name}
                        />
                        <StatTile
                            label="Wilayah Terpantau"
                            value={topRegions.length}
                            sublabel="dari 502 kabupaten/kota"
                        />
                    </div>

                    {/* Map + Ranking */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm lg:col-span-2">
                            <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
                                <h2 className="font-heading text-sm font-semibold text-ink">
                                    Peta Titik Panas
                                </h2>
                                {/* Sebelumnya hex hardcode di sini (#40916C, dst) — sekarang
                                    pakai token yang sama dengan RiskBadge, jadi kalau palet
                                    berubah, legend ini otomatis ikut, tidak perlu diedit manual. */}
                                <div className="flex items-center gap-3 text-xs text-ink/50">
                                    <LegendDot tokenClass="bg-risk-rendah" label="Rendah" />
                                    <LegendDot tokenClass="bg-risk-sedang" label="Sedang" />
                                    <LegendDot tokenClass="bg-risk-tinggi" label="Tinggi" />
                                    <LegendDot tokenClass="bg-risk-sangat-tinggi" label="Sangat Tinggi" />
                                    <LegendDot tokenClass="bg-risk-na" label="N/A" dashed />
                                </div>
                            </div>
                            <div className="h-[560px]">
                                <MapView hotspots={hotspots} mode="nasional" />
                            </div>
                        </div>

                        <RegionRankingList regions={topRegions} />
                    </div>

                    <SourceCredit className="mt-6" />
                </main>
            </div>
        </>
    );
}

function LegendDot({ tokenClass, label, dashed = false }) {
    return (
        <span className="flex items-center gap-1.5">
            <span
                className={`h-2 w-2 rounded-full ${dashed ? 'border border-dashed border-risk-na bg-transparent' : tokenClass}`}
            />
            {label}
        </span>
    );
}