import AppLayout from '@/Layouts/AppLayout';
import MapView from '@/components/MapView';
import StatTile from '@/components/StatTile';
import RegionRankingList from '@/components/RegionRankingList';
import SourceCredit from '@/components/SourceCredit';
import { Badge } from '@/components/ui/badge';

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
                    tooltip="Jumlah titik panas dari NASA FIRMS pada tanggal data terakhir yang berhasil di-ingest, bukan selalu tanggal hari ini jika proses pembaruan sempat tertunda."
                />
                <StatTile
                    label="Wilayah Risiko Tinggi"
                    value={stats.high_risk_regions}
                    accent={stats.high_risk_regions > 0}
                    tooltip="Jumlah kabupaten/kota berkategori Priority Score 'Tinggi' atau 'Sangat Tinggi' — dihitung dari kombinasi risiko deforestasi historis (GFW), frekuensi hotspot, dan dampak AQI."
                />
                <StatTile
                    label="AQI Terburuk"
                    value={stats.worst_aqi?.nearest_city_aqi ?? null}
                    sublabel={stats.worst_aqi?.nearest_city_name}
                    tooltip="Nilai AQI (skala AQI US EPA) tertinggi dari kota terdekat hotspot berkategori Tinggi/Sangat Tinggi pada data terkini."
                />
                <StatTile
                    label="Wilayah Terpantau"
                    value={stats.total_regions}
                    sublabel="kabupaten/kota"
                    tooltip="Total kabupaten/kota se-Indonesia yang datanya dipantau sistem EMBER. Daftar Wilayah Prioritas di samping menampilkan 10 wilayah dengan Priority Score tertinggi dari total ini."
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
        </AppLayout>
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