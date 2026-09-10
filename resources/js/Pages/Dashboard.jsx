import { motion } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import MapView from '@/components/MapView';
import StatTile from '@/components/StatTile';
import RegionRankingList from '@/components/RegionRankingList';
import SourceCredit from '@/components/SourceCredit';
import { Badge } from '@/components/ui/badge';
import { Flame, TreePine } from 'lucide-react';

// Sama persis dengan pola di Landing.jsx, supaya "rasa" animasinya konsisten
// di seluruh aplikasi. Bedanya: di sini dipicu `animate` (langsung jalan pas
// halaman dimuat), BUKAN `whileInView` — dashboard adalah halaman kerja yang
// datanya harus langsung kebaca begitu dibuka, bukan section landing yang
// baru "reveal" saat di-scroll ke.
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

export default function Dashboard({ hotspots, stats, topRegions }) {
    // PENTING: config('app.timezone') backend masih 'UTC', jadi
    // stats.last_updated adalah waktu UTC. Konversi ke Asia/Jakarta
    // dipaksa eksplisit via opsi `timeZone`, bukan mengandalkan
    // timezone browser pengguna (lihat juga Landing.jsx: formatUpdatedAt).
    const lastUpdated = stats.last_updated
        ? new Date(stats.last_updated).toLocaleString('id-ID', {
              timeZone: 'Asia/Jakarta',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
          }) + ' WIB'
        : 'Belum ada data';

    return (
        <AppLayout title="Dashboard" active="dashboard">
            <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="visible" className="relative">
                {/* Aksen dekoratif halus, senada dengan blob blur di section-section
                    Landing.jsx — dipasang -z-10 & pointer-events-none supaya murni
                    dekorasi, tidak pernah menghalangi klik atau bikin layout melebar. */}
                <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-forest-dark/[0.04] blur-3xl" />
                <div className="pointer-events-none absolute top-72 -left-16 -z-10 h-64 w-64 rounded-full bg-fresh/[0.05] blur-3xl" />

                {/* Page title + live indicator */}
                <motion.div variants={fadeUp} className="mb-6 flex items-end justify-between">
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
                </motion.div>

                {/* Stat tiles — stagger sendiri di dalam stagger utama, sama pola
                    dengan grid SourceBlock di Landing.jsx */}
                <motion.div
                    variants={staggerContainer(0.08)}
                    className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4"
                >
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="Total Hotspot Hari Ini"
                            value={stats.total_hotspots}
                            tooltip="Jumlah titik panas dari NASA FIRMS pada tanggal data terakhir yang berhasil di-ingest, bukan selalu tanggal hari ini jika proses pembaruan sempat tertunda."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="Wilayah Risiko Tinggi"
                            value={stats.high_risk_regions}
                            accent={stats.high_risk_regions > 0}
                            tooltip="Jumlah kabupaten/kota berkategori Priority Score 'Tinggi' atau 'Sangat Tinggi' — dihitung dari kombinasi risiko deforestasi historis (GFW), frekuensi hotspot, dan dampak AQI."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="AQI Terburuk"
                            value={stats.worst_aqi?.nearest_city_aqi ?? null}
                            sublabel={stats.worst_aqi?.nearest_city_name}
                            tooltip="Nilai AQI (skala AQI US EPA) tertinggi dari kota terdekat hotspot berkategori Tinggi/Sangat Tinggi pada data terkini."
                        />
                    </motion.div>
                    <motion.div variants={fadeUp}>
                        <StatTile
                            label="Wilayah Terpantau"
                            value={stats.total_regions}
                            sublabel="kabupaten/kota"
                            tooltip="Total kabupaten/kota se-Indonesia yang datanya dipantau sistem EMBER. Daftar Wilayah Prioritas di samping menampilkan 10 wilayah dengan Priority Score tertinggi dari total ini."
                        />
                    </motion.div>
                </motion.div>

                {/* Map + Ranking */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <motion.div
                        variants={fadeUp}
                        className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm lg:col-span-2"
                    >
                        <div className="flex items-center justify-between border-b border-black/5 px-5 py-3">
                            <h2 className="font-heading text-sm font-semibold text-ink">
                                Peta Titik Panas
                            </h2>
                            {/* Ikon legend disamakan dengan marker di MapView.jsx (flame
                                untuk sedang/tinggi/sangat tinggi, tree untuk rendah) —
                                sebelumnya cuma titik polos, jadi tidak nyambung lagi
                                begitu marker di peta diganti jadi ikon. */}
                            <div className="flex items-center gap-3 text-xs text-ink/50">
                                <LegendItem shape="tree" colorClass="text-risk-rendah" label="Rendah" />
                                <LegendItem shape="flame" colorClass="text-risk-sedang" label="Sedang" />
                                <LegendItem shape="flame" colorClass="text-risk-tinggi" label="Tinggi" />
                                <LegendItem shape="flame" colorClass="text-risk-sangat-tinggi" label="Sangat Tinggi" />
                                <LegendItem shape="na" label="N/A" />
                            </div>
                        </div>
                        <div className="h-[560px]">
                            <MapView hotspots={hotspots} mode="nasional" />
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <RegionRankingList regions={topRegions} />
                    </motion.div>
                </div>

                <motion.div variants={fadeUp}>
                    <SourceCredit className="mt-6" />
                </motion.div>
            </motion.div>
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

    // 'na': tetap titik putus-putus polos seperti semula — di peta pun kategori
    // ini sengaja tidak dipaksa jadi ikon api/pohon karena artinya "tidak
    // diketahui", bukan salah satu dari keduanya (lihat MapView.jsx).
    return (
        <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full border border-dashed border-risk-na bg-transparent" />
            {label}
        </span>
    );
}