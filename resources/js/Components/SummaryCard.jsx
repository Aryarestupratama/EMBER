import RiskBadge from '@/components/RiskBadge';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Flame, Wind, Radar, Lightbulb } from 'lucide-react';

const AQI_CATEGORY_LABELS = {
    baik: 'Baik',
    sedang: 'Sedang',
    tidak_sehat: 'Tidak Sehat',
    sangat_tidak_sehat: 'Sangat Tidak Sehat',
    berbahaya: 'Berbahaya',
};

const AQI_CATEGORY_TONE = {
    baik: 'text-forest-dark',
    sedang: 'text-amber-700',
    tidak_sehat: 'text-risk-tinggi',
    sangat_tidak_sehat: 'text-risk-sangat-tinggi',
    berbahaya: 'text-risk-sangat-tinggi',
};

function SectionRow({ icon: Icon, iconClass, bgClass, label, children }) {
    return (
        <div className="flex gap-3">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${bgClass}`}>
                <Icon className={`h-4 w-4 ${iconClass}`} strokeWidth={2.2} />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-xs font-medium uppercase tracking-wide text-ink/40">{label}</p>
                <div className="mt-1">{children}</div>
            </div>
        </div>
    );
}

export default function SummaryCard({ result }) {
    const { location, risk, air_quality, nearby_hotspots, mitigation } = result;

    return (
        <Card className="border-black/5 shadow-sm">
            <CardContent className="space-y-5 p-6">
                <SectionRow
                    icon={MapPin}
                    iconClass="text-forest-dark"
                    bgClass="bg-forest/10"
                    label="Lokasi"
                >
                    <p className="text-sm text-ink">
                        {air_quality.city ? (
                            <>
                                <span className="font-semibold">{air_quality.city}</span>
                                <span className="text-ink/50"> · </span>
                            </>
                        ) : null}
                        <span className="tabular-nums text-ink/60">
                            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                        </span>
                    </p>
                </SectionRow>

                <SectionRow
                    icon={Flame}
                    iconClass="text-risk-tinggi"
                    bgClass="bg-risk-tinggi/10"
                    label="Status Risiko Karhutla"
                >
                    <div className="flex items-center gap-2">
                        <RiskBadge category={risk.category} className="px-3 py-1 text-sm" />
                        {risk.score !== null && (
                            <span className="tabular-nums text-sm text-ink/50">
                                skor {risk.score.toFixed(2)}
                            </span>
                        )}
                    </div>
                </SectionRow>

                <SectionRow
                    icon={Wind}
                    iconClass="text-fresh"
                    bgClass="bg-fresh/10"
                    label="Kualitas Udara Saat Ini"
                >
                    {air_quality.aqi ? (
                        <p className="text-sm text-ink">
                            <span className="tabular-nums text-lg font-semibold text-forest-dark">
                                AQI {air_quality.aqi}
                            </span>{' '}
                            — {AQI_CATEGORY_LABELS[air_quality.category] ?? 'Kategori tidak diketahui'}
                        </p>
                    ) : (
                        <p className="text-sm text-ink/50">Data tidak tersedia</p>
                    )}
                </SectionRow>

                <SectionRow
                    icon={Radar}
                    iconClass="text-ink/60"
                    bgClass="bg-ink/5"
                    label="Hotspot Terdekat"
                >
                    {nearby_hotspots.count > 0 ? (
                        <p className="text-sm text-ink">
                            <span className="tabular-nums font-semibold">{nearby_hotspots.count}</span> titik
                            dalam radius {nearby_hotspots.radius_km} km
                            {nearby_hotspots.nearest_km !== null && (
                                <span className="text-ink/50">
                                    {' '}· terdekat {nearby_hotspots.nearest_km.toFixed(1)} km
                                </span>
                            )}
                        </p>
                    ) : (
                        <p className="text-sm text-ink/50">
                            Tidak ada hotspot dalam radius {nearby_hotspots.radius_km} km
                        </p>
                    )}
                </SectionRow>

                <SectionRow
                    icon={Lightbulb}
                    iconClass="text-amber-700"
                    bgClass="bg-amber-500/10"
                    label="Rekomendasi"
                >
                    <div className="space-y-2 rounded-lg bg-canvas p-3">
                        <p className="text-sm text-ink/80">{mitigation?.fire_risk?.short_text}</p>
                        {mitigation?.air_quality?.short_text && (
                            <p className="text-sm text-ink/80">{mitigation.air_quality.short_text}</p>
                        )}
                    </div>
                </SectionRow>

                <SourceCredit />
            </CardContent>
        </Card>
    );
}