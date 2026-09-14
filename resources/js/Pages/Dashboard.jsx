import { useState } from 'react';
import { motion } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import MapView from '@/components/MapView';
import StatTile from '@/components/StatTile';
import RegionRankingList from '@/components/RegionRankingList';
import CompareTrigger from '@/components/CompareTrigger';
import CompareModal from '@/components/CompareModal';
import SourceCredit from '@/components/SourceCredit';
import { Badge } from '@/components/ui/badge';
import { Flame, TreePine } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

function aqiToHeadline(aqi) {
    if (aqi == null) return null;
    if (aqi <= 50) return { headline: 'Baik', tone: 'success' };
    if (aqi <= 100) return { headline: 'Sedang', tone: 'neutral' };
    if (aqi <= 150) return { headline: 'Tidak Sehat (Sensitif)', tone: 'warning' };
    return { headline: 'Tidak Sehat', tone: 'danger' };
}

export default function Dashboard({ hotspots, stats, topRegions }) {
    const lastUpdated = stats.last_updated
        ? new Date(stats.last_updated).toLocaleString('id-ID', {
              timeZone: 'Asia/Jakarta',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          }) + ' WIB'
        : 'Belum ada data';

    const [selectedIds, setSelectedIds] = useState([]);
    const [compareOpen, setCompareOpen] = useState(false);

    const toggleSelect = (regionId) => {
        setSelectedIds((prev) =>
            prev.includes(regionId)
                ? prev.filter((id) => id !== regionId)
                : [...prev, regionId].slice(0, 3)
        );
    };

    const selectedRegions = topRegions
        .filter((item) => selectedIds.includes(item.region.id))
        .map((item) => item.region);

    const worstAqi = stats.worst_aqi?.nearest_city_aqi ?? null;
    const aqiStatus = aqiToHeadline(worstAqi);

    return (
        <AppLayout title="Dashboard" active="dashboard">
            <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="visible" className="relative">
                <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-forest-dark/[0.04] blur-3xl" />
                <div className="pointer-events-none absolute top-72 -left-16 -z-10 h-64 w-64 rounded-full bg-fresh/[0.05] blur-3xl" />

                <motion.div variants={fadeUp} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="font-heading text-xl font-bold text-ink sm:text-2xl">
                            Dashboard Nasional
                        </h1>
                        <p className="mt-1 text-sm text-ink/60">
                            Monitoring titik panas kebakaran hutan dan lahan di seluruh Indonesia
                        </p>
                    </div>

                    <Badge className="w-fit gap-1.5 border-0 bg-fresh/10 text-fresh">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fresh" />
                        Diperbarui {lastUpdated}
                    </Badge>
                </motion.div>

                <motion.div
                    variants={staggerContainer(0.08)}
                    className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
                >
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="Titik Panas Hari Ini"
                            headline={
                                stats.total_hotspots > 0
                                    ? `${stats.total_hotspots.toLocaleString('id-ID')} titik terdeteksi`
                                    : 'Tidak ada titik terdeteksi'
                            }
                            value={stats.total_hotspots}
                            tone={stats.total_hotspots > 0 ? 'warning' : 'success'}
                            showValue={false}
                            tooltip="Titik panas dari NASA FIRMS pada data terakhir yang berhasil di-ingest, bukan selalu hari ini jika pembaruan sempat tertunda."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="Wilayah Risiko Tinggi"
                            headline={
                                stats.high_risk_regions > 0
                                    ? `${stats.high_risk_regions} wilayah perlu perhatian`
                                    : 'Tidak ada wilayah berisiko tinggi'
                            }
                            value={stats.high_risk_regions}
                            sublabel={`dari ${stats.total_regions} dipantau`}
                            tone={stats.high_risk_regions > 0 ? 'danger' : 'success'}
                            showValue={false}
                            tooltip="Kabupaten/kota berkategori Priority Score 'Tinggi' atau 'Sangat Tinggi' — kombinasi risiko deforestasi historis (GFW), frekuensi hotspot, dan dampak AQI."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="Kualitas Udara Terburuk"
                            headline={aqiStatus?.headline}
                            value={worstAqi}
                            sublabel={stats.worst_aqi?.nearest_city_name}
                            tone={aqiStatus?.tone}
                            tooltip="AQI (skala AQI US EPA) tertinggi dari kota terdekat hotspot berkategori Tinggi/Sangat Tinggi."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="Cakupan Sistem"
                            headline="Terpantau di seluruh Indonesia"
                            value={stats.total_regions}
                            sublabel="kabupaten/kota"
                            variant="muted"
                            tooltip="Total kabupaten/kota se-Indonesia yang datanya dipantau EMBER. Daftar Wilayah Prioritas di samping menampilkan 10 wilayah dengan Priority Score tertinggi dari total ini."
                        />
                    </motion.div>
                </motion.div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-col overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm lg:col-span-2"
                    >
                        <div className="flex flex-col gap-2 border-b border-black/5 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                            <h2 className="font-heading text-sm font-semibold text-ink">
                                Peta Titik Panas
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-ink/50 sm:gap-3">
                                <LegendItem shape="tree" colorClass="text-risk-rendah" label="Rendah" />
                                <LegendItem shape="flame" colorClass="text-risk-sedang" label="Sedang" />
                                <LegendItem shape="flame" colorClass="text-risk-tinggi" label="Tinggi" />
                                <LegendItem shape="flame" colorClass="text-risk-sangat-tinggi" label="Sangat Tinggi" />
                                <LegendItem shape="na" label="N/A" />
                            </div>
                        </div>
                        <div className="min-h-[320px] flex-1 sm:min-h-[420px] lg:min-h-[560px]">
                            <MapView hotspots={hotspots} mode="nasional" />
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="relative">
                        <RegionRankingList
                            regions={topRegions}
                            selected={selectedIds}
                            onToggleSelect={toggleSelect}
                            onClearSelection={() => setSelectedIds([])}
                        />
                        <CompareTrigger
                            selectedRegions={selectedRegions}
                            onRemove={toggleSelect}
                            onCompare={() => setCompareOpen(true)}
                        />
                    </motion.div>
                </div>

                <motion.div variants={fadeUp}>
                    <SourceCredit className="mt-6" />
                </motion.div>
            </motion.div>

            <CompareModal
                open={compareOpen}
                onOpenChange={setCompareOpen}
                regionIds={selectedIds}
            />
        </AppLayout>
    );
}

function LegendItem({ shape, colorClass, label }) {
    if (shape === 'tree') {
        return (
            <span className="flex items-center gap-1.5">
                <TreePine className={`h-3 w-3 ${colorClass}`} strokeWidth={2.5} />
                {label}
            </span>
        );
    }

    if (shape === 'flame') {
        return (
            <span className="flex items-center gap-1.5">
                <Flame className={`h-3 w-3 ${colorClass}`} strokeWidth={2.5} />
                {label}
            </span>
        );
    }

    return (
        <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-dashed border-risk-na bg-transparent" />
            {label}
        </span>
    );
}