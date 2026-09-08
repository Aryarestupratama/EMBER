import RiskBadge from '@/components/RiskBadge';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

const RECOMMENDATIONS = {
    rendah: 'Kondisi wilayah ini relatif aman. Tetap waspada terhadap perubahan cuaca musim kemarau.',
    sedang: 'Pantau perkembangan kondisi di wilayah ini secara berkala, terutama saat musim kemarau.',
    tinggi: 'Kurangi aktivitas luar ruangan. Wilayah ini prioritas untuk monitoring & mitigasi karhutla.',
    sangat_tinggi: 'Kurangi aktivitas luar ruangan secara signifikan. Wilayah ini prioritas tinggi untuk monitoring & mitigasi karhutla.',
    na: 'Data risiko untuk lokasi ini belum tersedia. Lokasi kemungkinan berada di luar cakupan analisis (area non-hutan/lahan).',
};

function aqiLabel(aqi) {
    if (aqi === null) return null;
    if (aqi <= 50) return 'Baik';
    if (aqi <= 100) return 'Sedang';
    if (aqi <= 150) return 'Tidak Sehat untuk Kelompok Sensitif';
    if (aqi <= 200) return 'Tidak Sehat';
    if (aqi <= 300) return 'Sangat Tidak Sehat';
    return 'Berbahaya';
}

export default function SummaryCard({ result }) {
    const { risk, air_quality, nearby_hotspots } = result;

    return (
        <Card className="border-black/5 shadow-sm">
            <CardContent className="space-y-5 p-6">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                        Status Risiko Karhutla
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                        <RiskBadge category={risk.category} className="px-3 py-1 text-sm" />
                        {risk.score !== null && (
                            <span className="tabular-nums text-sm text-ink/50">
                                skor {risk.score.toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                        Kualitas Udara Saat Ini
                    </p>
                    {air_quality.aqi ? (
                        <p className="mt-1.5 text-sm text-ink">
                            <span className="tabular-nums text-lg font-semibold text-forest-dark">
                                AQI {air_quality.aqi}
                            </span>{' '}
                            — {aqiLabel(air_quality.aqi)}
                            {air_quality.city && (
                                <span className="text-ink/50"> · {air_quality.city}</span>
                            )}
                        </p>
                    ) : (
                        <p className="mt-1.5 text-sm text-ink/50">Data tidak tersedia</p>
                    )}
                </div>

                <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                        Hotspot Terdekat
                    </p>
                    {nearby_hotspots.count > 0 ? (
                        <p className="mt-1.5 text-sm text-ink">
                            <span className="tabular-nums font-semibold">{nearby_hotspots.count}</span> titik
                            dalam radius {nearby_hotspots.radius_km} km
                            {nearby_hotspots.nearest_km !== null && (
                                <span className="text-ink/50">
                                    {' '}· terdekat {nearby_hotspots.nearest_km.toFixed(1)} km
                                </span>
                            )}
                        </p>
                    ) : (
                        <p className="mt-1.5 text-sm text-ink/50">
                            Tidak ada hotspot dalam radius {nearby_hotspots.radius_km} km
                        </p>
                    )}
                </div>

                <div className="rounded-lg bg-canvas p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                        Rekomendasi
                    </p>
                    <p className="mt-1.5 text-sm text-ink/80">
                        {RECOMMENDATIONS[risk.category] ?? RECOMMENDATIONS.na}
                    </p>
                </div>

                <SourceCredit />
            </CardContent>
        </Card>
    );
}