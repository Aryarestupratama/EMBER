import { Link } from '@inertiajs/react';
import RiskBadge from '@/components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function RegionRankingList({ regions }) {
    return (
        <Card className="border-black/5 shadow-sm">
            <CardHeader className="border-b border-black/5 pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-ink">
                    Wilayah Prioritas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0.5 p-2">
                {regions.length === 0 && (
                    <p className="py-6 text-center text-sm text-ink/50">
                        Belum ada data wilayah prioritas untuk hari ini.
                    </p>
                )}

                {regions.map((item, index) => (
                    <Link
                        key={item.id}
                        href={route('region.detail', item.region.slug)}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-canvas"
                    >
                        <div className="flex items-center gap-3">
                            <span className="tabular-nums w-5 text-sm font-medium text-ink/30">
                                {index + 1}
                            </span>
                            <div>
                                <p className="text-sm font-medium text-ink">{item.region.name}</p>
                                <p className="text-xs text-ink/50">{item.region.province}</p>
                            </div>
                        </div>
                        <RiskBadge category={item.priority_rank_category} />
                    </Link>
                ))}
            </CardContent>
        </Card>
    );
}