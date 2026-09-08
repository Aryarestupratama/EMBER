import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Sebelumnya: hex hardcode (#2D6A4F, #40916C, #74C69D) — duplikat dari token app.css.
// Sekarang: pakai kelas Tailwind yang sudah di-generate dari token forest/fresh.
const COMPONENTS = [
    { key: 'gfw_risk', label: 'Risiko Deforestasi (GFW)', weight: 0.4, barClass: 'bg-forest-dark' },
    { key: 'hotspot_frequency', label: 'Frekuensi Hotspot', weight: 0.4, barClass: 'bg-fresh' },
    { key: 'aqi_impact', label: 'Dampak Kualitas Udara', weight: 0.2, barClass: 'bg-fresh-light' },
];

export default function ScoreBreakdown({ score }) {
    if (!score) {
        return (
            <Card className="border-black/5 shadow-sm">
                <CardContent className="py-8 text-center text-sm text-ink/50">
                    Belum ada perhitungan skor prioritas untuk wilayah ini.
                </CardContent>
            </Card>
        );
    }

    // avg_gfw_risk_score bisa null (semua hotspot di wilayah ini gagal di-enrich GFW).
    // Ini beda makna dari 0 (risiko terukur rendah) — Rules.md §2 & §5 tegas soal ini,
    // jadi UI juga harus bilang "tidak tersedia", bukan diam-diam menampilkan 0%.
    const gfwUnavailable = score.avg_gfw_risk_score === null || score.avg_gfw_risk_score === undefined;

    const normalized = {
        gfw_risk: gfwUnavailable ? 0 : parseFloat(score.avg_gfw_risk_score),
        hotspot_frequency: parseFloat(score.normalized_hotspot_frequency),
        aqi_impact: score.normalized_aqi_impact !== null ? parseFloat(score.normalized_aqi_impact) : 0,
    };

    const aqiUnavailable = score.normalized_aqi_impact === null || score.normalized_aqi_impact === undefined;

    return (
        <Card className="border-black/5 shadow-sm">
            <CardHeader className="border-b border-black/5 pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-ink">
                    Kontribusi Skor Prioritas
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {COMPONENTS.map((c) => {
                    const value = normalized[c.key];
                    const contribution = value * c.weight;
                    const unavailable =
                        (c.key === 'gfw_risk' && gfwUnavailable) ||
                        (c.key === 'aqi_impact' && aqiUnavailable);

                    return (
                        <div key={c.key}>
                            <div className="mb-1 flex items-baseline justify-between text-sm">
                                <span className="text-ink/70">
                                    {c.label}{' '}
                                    <span className="text-xs text-ink/40">(bobot {c.weight})</span>
                                </span>
                                <span className="tabular-nums font-medium text-ink">
                                    {unavailable ? (
                                        <span className="text-xs font-normal text-ink/40">N/A</span>
                                    ) : (
                                        contribution.toFixed(3)
                                    )}
                                </span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-canvas">
                                {unavailable ? (
                                    <div
                                        className="h-full w-full rounded-full"
                                        style={{
                                            backgroundImage:
                                                'repeating-linear-gradient(45deg, var(--color-risk-na) 0, var(--color-risk-na) 4px, transparent 4px, transparent 8px)',
                                            opacity: 0.3,
                                        }}
                                    />
                                ) : (
                                    <div
                                        className={`h-full rounded-full transition-all ${c.barClass}`}
                                        style={{ width: `${Math.min(value * 100, 100)}%` }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}

                <div className="flex items-baseline justify-between border-t border-black/5 pt-3 text-sm font-semibold">
                    <span className="text-ink">Priority Score</span>
                    <span className="tabular-nums text-forest-dark">
                        {parseFloat(score.priority_score).toFixed(3)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}