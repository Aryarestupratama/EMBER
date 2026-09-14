import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Flame, Wind, CheckCircle2 } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

export default function RegionDetail({ region, score, hotspots, mitigation }) {
    const center = [parseFloat(region.centroid_lat), parseFloat(region.centroid_lon)];

    return (
        <AppLayout title={region.name}>
            <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-forest-dark/[0.04] blur-3xl" />
            <div className="pointer-events-none absolute top-96 -left-16 -z-10 h-64 w-64 rounded-full bg-fresh/[0.05] blur-3xl" />

            <motion.div variants={staggerContainer(0.12)} initial="hidden" animate="visible" className="relative">
                <motion.div variants={fadeUp}>
                    <Link
                        href={route('dashboard')}
                        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink/50 transition-colors hover:text-forest-dark"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Dashboard
                    </Link>
                </motion.div>

                <motion.div variants={fadeUp} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className="font-heading text-xl font-bold text-ink sm:text-2xl">{region.name}</h1>
                        <p className="mt-1 text-sm text-ink/60">{region.province}</p>
                    </div>
                    {score && (
                        <RiskBadge
                            category={score.priority_rank_category}
                            className="w-fit px-3 py-1.5 text-sm"
                        />
                    )}
                </motion.div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <motion.div
                        variants={fadeUp}
                        className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm lg:col-span-2"
                    >
                        <div className="h-[280px] sm:h-[360px] lg:h-[420px]">
                            <MapView
                                hotspots={hotspots}
                                mode="zoom-lokasi"
                                zoomTo={center}
                            />
                        </div>
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <ScoreBreakdown score={score} />
                    </motion.div>
                </div>

                {mitigation?.fire_risk && (
                    <motion.div variants={fadeUp}>
                        <Card className="mt-6 border-black/5 shadow-sm">
                            <CardContent className="p-4">
                                <motion.div
                                    variants={staggerContainer(0.15)}
                                    className="grid grid-cols-1 gap-4 sm:grid-cols-2"
                                >
                                    <GuidanceColumn
                                        icon={Flame}
                                        accentClass="border-risk-tinggi/15 bg-risk-tinggi/[0.04]"
                                        iconClass="text-risk-tinggi"
                                        title="Panduan Kesiapsiagaan Karhutla"
                                        points={mitigation.fire_risk.full_guidance}
                                    />

                                    {mitigation.air_quality?.full_guidance?.length > 0 && (
                                        <GuidanceColumn
                                            icon={Wind}
                                            accentClass="border-fresh/15 bg-fresh/[0.04]"
                                            iconClass="text-fresh"
                                            title="Panduan Kualitas Udara"
                                            points={mitigation.air_quality.full_guidance}
                                        />
                                    )}
                                </motion.div>

                                <p className="mt-4 text-[11px] text-ink/40">
                                    Sumber: BNPB (siaran pers resmi) · skala AQI mengacu standar AQI US EPA
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                <motion.div variants={fadeUp} className="mt-6">
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
                            <div className="max-h-[420px] overflow-x-auto overflow-y-auto">
                                <table className="w-full min-w-[560px] text-sm">
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
                </motion.div>

                <motion.div variants={fadeUp}>
                    <SourceCredit className="mt-6" />
                </motion.div>
            </motion.div>
        </AppLayout>
    );
}

function GuidanceColumn({ icon: Icon, accentClass, iconClass, title, points }) {
    return (
        <div className={`rounded-xl border p-4 ${accentClass}`}>
            <div className="mb-3 flex items-center gap-2">
                <Icon className={`h-4 w-4 ${iconClass}`} />
                <p className="text-xs font-semibold uppercase tracking-wide text-ink/60">{title}</p>
            </div>
            <ul className="space-y-2">
                {points.map((point, i) => (
                    <motion.li
                        key={i}
                        variants={fadeUp}
                        className="flex items-start gap-2 rounded-lg bg-white px-3 py-2 text-sm text-ink/80 shadow-sm"
                    >
                        <CheckCircle2 className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${iconClass} opacity-60`} />
                        <span>{point}</span>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}