import { useMemo, useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import AppLayout from '@/Layouts/AppLayout';
import MapView from '@/components/MapView';
import RiskBadge from '@/components/RiskBadge';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Flame, Wind, CheckCircle2, ChevronDown } from 'lucide-react';

const SEVERITY_ORDER = ['na', 'rendah', 'sedang', 'tinggi', 'sangat_tinggi'];

function groupHotspotsByDate(hotspots) {
    const groups = [];
    const indexByDate = new Map();

    hotspots.forEach((hotspot) => {
        const dateKey = hotspot.acq_date;
        if (!indexByDate.has(dateKey)) {
            indexByDate.set(dateKey, groups.length);
            groups.push({ date: dateKey, items: [] });
        }
        groups[indexByDate.get(dateKey)].items.push(hotspot);
    });

    return groups.map((group) => {
        const dominant = group.items.reduce((acc, h) => {
            const rank = SEVERITY_ORDER.indexOf(h.gfw_risk_category ?? 'na');
            return rank > SEVERITY_ORDER.indexOf(acc) ? h.gfw_risk_category : acc;
        }, 'na');

        return { ...group, dominantCategory: dominant };
    });
}

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

    const groupedHotspots = useMemo(() => groupHotspotsByDate(hotspots), [hotspots]);

    const [expandedDates, setExpandedDates] = useState(() =>
        groupedHotspots.length > 0 ? new Set([groupedHotspots[0].date]) : new Set()
    );

    function toggleDate(date) {
        setExpandedDates((prev) => {
            const next = new Set(prev);
            if (next.has(date)) {
                next.delete(date);
            } else {
                next.add(date);
            }
            return next;
        });
    }

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
                        <div className="space-y-2">
                            {groupedHotspots.map((group) => {
                                const isOpen = expandedDates.has(group.date);

                                return (
                                    <div
                                        key={group.date}
                                        className="overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm"
                                    >
                                        <button
                                            type="button"
                                            onClick={() => toggleDate(group.date)}
                                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas"
                                        >
                                            <div className="flex items-center gap-3">
                                                <ChevronDown
                                                    className={`h-4 w-4 shrink-0 text-ink/40 transition-transform ${
                                                        isOpen ? 'rotate-180' : ''
                                                    }`}
                                                />
                                                <span className="text-sm font-medium text-ink">
                                                    {new Date(group.date).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                                <span className="text-xs text-ink/50">
                                                    {group.items.length} titik
                                                </span>
                                            </div>
                                            <RiskBadge category={group.dominantCategory} />
                                        </button>

                                        <AnimatePresence initial={false}>
                                            {isOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                                                    className="overflow-hidden border-t border-black/5"
                                                >
                                                    <div className="max-h-[320px] overflow-x-auto overflow-y-auto">
                                                        <table className="w-full min-w-[560px] text-sm">
                                                            <thead className="sticky top-0 z-10 border-b border-black/5 bg-canvas text-left text-xs uppercase tracking-wide text-ink/40">
                                                                <tr>
                                                                    <th className="px-4 py-2.5">Posisi</th>
                                                                    <th className="px-4 py-2.5">Confidence</th>
                                                                    <th className="px-4 py-2.5">FRP</th>
                                                                    <th className="px-4 py-2.5">Risiko</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-black/5">
                                                                {group.items.map((h) => (
                                                                    <tr key={h.id}>
                                                                        <td className="px-4 py-2.5 text-ink/70">
                                                                            {h.distance_from_centroid_km} km{' '}
                                                                            {h.direction_from_centroid} dari pusat{' '}
                                                                            {region.name}
                                                                        </td>
                                                                        <td className="tabular-nums px-4 py-2.5 text-ink/70">
                                                                            {h.confidence}%
                                                                        </td>
                                                                        <td className="tabular-nums px-4 py-2.5 text-ink/70">
                                                                            {h.frp}
                                                                        </td>
                                                                        <td className="px-4 py-2.5">
                                                                            <RiskBadge category={h.gfw_risk_category} />
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
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