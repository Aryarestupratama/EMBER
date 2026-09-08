import { Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Flame } from 'lucide-react';

export default function RegionDetail({ region, score, hotspots, mitigation }) {
    const center = [parseFloat(region.centroid_lat), parseFloat(region.centroid_lon)];

    return (
        <AppLayout title={region.name}>
            <Link
                href={route('dashboard')}
                className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-forest-dark"
            >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Dashboard
            </Link>

            <div className="mb-6 flex items-start justify-between">
                <div>
                    <h1 className="font-heading text-2xl font-bold text-ink">{region.name}</h1>
                    <p className="mt-1 text-sm text-ink/60">{region.province}</p>
                </div>
                {score && (
                    <RiskBadge
                        category={score.priority_rank_category}
                        className="px-3 py-1.5 text-sm"
                    />
                )}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm lg:col-span-2">
                    <div className="h-[420px]">
                        <MapView
                            hotspots={hotspots}
                            mode="zoom-lokasi"
                            zoomTo={center}
                        />
                    </div>
                </div>

                <ScoreBreakdown score={score} />
            </div>

            {mitigation?.fire_risk && (
                <Card className="mt-6 border-black/5 shadow-sm">
                    <CardContent className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                                Panduan Kesiapsiagaan Karhutla
                            </p>
                            <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                                {mitigation.fire_risk.full_guidance.map((point, i) => (
                                    <li key={i} className="flex gap-2">
                                        <span className="text-ink/30">•</span>
                                        <span>{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {mitigation.air_quality?.full_guidance?.length > 0 && (
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-ink/40">
                                    Panduan Kualitas Udara
                                </p>
                                <ul className="mt-2 space-y-1.5 text-sm text-ink/80">
                                    {mitigation.air_quality.full_guidance.map((point, i) => (
                                        <li key={i} className="flex gap-2">
                                            <span className="text-ink/30">•</span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-[11px] text-ink/40 sm:col-span-2">
                            Sumber: BNPB (siaran pers resmi) · skala AQI mengacu standar AQI US EPA
                        </p>
                    </CardContent>
                </Card>
            )}

            <div className="mt-6">
                <h2 className="mb-3 flex items-center gap-2 font-heading text-sm font-semibold text-ink">
                    <Flame className="h-4 w-4 text-risk-tinggi" />
                    Hotspot 7 Hari Terakhir ({hotspots.length})
                </h2>

                {hotspots.length === 0 ? (
                    <Card className="border-dashed border-black/5 shadow-none">
                        <CardContent className="py-8 text-center text-sm text-ink/50">
                            Tidak ada hotspot tercatat di wilayah ini dalam 7 hari terakhir.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm">
                        <div className="max-h-[420px] overflow-y-auto">
                            <table className="w-full text-sm">
                                <thead className="sticky top-0 z-10 border-b border-black/5 bg-canvas text-left text-xs uppercase tracking-wide text-ink/40">
                                    <tr>
                                        <th className="px-4 py-2.5">Tanggal</th>
                                        <th className="px-4 py-2.5">Koordinat</th>
                                        <th className="px-4 py-2.5">Confidence</th>
                                        <th className="px-4 py-2.5">FRP</th>
                                        <th className="px-4 py-2.5">Risiko</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-black/5">
                                    {hotspots.map((h) => (
                                        <tr key={h.id}>
                                            <td className="px-4 py-2.5 text-ink/70">
                                                {new Date(h.acq_date).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                })}
                                            </td>
                                            <td className="tabular-nums px-4 py-2.5 text-ink/70">
                                                {parseFloat(h.latitude).toFixed(4)}, {parseFloat(h.longitude).toFixed(4)}
                                            </td>
                                            <td className="tabular-nums px-4 py-2.5 text-ink/70">{h.confidence}%</td>
                                            <td className="tabular-nums px-4 py-2.5 text-ink/70">{h.frp}</td>
                                            <td className="px-4 py-2.5">
                                                <RiskBadge category={h.gfw_risk_category} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <SourceCredit className="mt-6" />
        </AppLayout>
    );
}