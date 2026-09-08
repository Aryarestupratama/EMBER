import RiskBadge from '@/components/RiskBadge';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

// Catatan: ambang batas AQI dan isi rekomendasi TIDAK didefinisikan di sini.
// Keduanya berasal dari backend (MitigationHelper + config/ember.php) agar
// tetap satu sumber kebenaran (Rules.md §7). Peta di bawah ini murni label
// tampilan untuk kunci kategori yang dikirim backend, bukan logic ambang batas.
const AQI_CATEGORY_LABELS = {
    baik: 'Baik',
    sedang: 'Sedang',
    tidak_sehat: 'Tidak Sehat',
    sangat_tidak_sehat: 'Sangat Tidak Sehat',
    berbahaya: 'Berbahaya',
};

export default function SummaryCard({ result }) {
    const { risk, air_quality, nearby_hotspots, mitigation } = result;

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
                            — {AQI_CATEGORY_LABELS[air_quality.category] ?? 'Kategori tidak diketahui'}
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

                <div className="rounded-lg bg-canvas p-4 space-y-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                        Rekomendasi
                    </p>
                    <p className="text-sm text-ink/80">
                        {mitigation?.fire_risk?.short_text}
                    </p>
                    {mitigation?.air_quality?.short_text && (
                        <p className="text-sm text-ink/80">
                            {mitigation.air_quality.short_text}
                        </p>
                    )}
                </div>

                <SourceCredit />
            </CardContent>
        </Card>
    );
}