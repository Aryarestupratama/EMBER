import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

const COMPONENTS = [
    {
        key: 'gfw_risk',
        label: 'Risiko Deforestasi (GFW)',
        weight: 0.4,
        barClass: 'bg-forest-dark',
        tooltip:
            'Rata-rata persentase tutupan hutan yang hilang (tree cover loss) dalam radius 5 km di sekitar tiap hotspot wilayah ini sejak 2015, sebagai proksi risiko karhutla berulang — bukan prediksi resmi pemerintah.',
    },
    {
        key: 'hotspot_frequency',
        label: 'Frekuensi Hotspot',
        weight: 0.4,
        barClass: 'bg-fresh',
        tooltip:
            'Jumlah hotspot di wilayah ini dalam 7 hari terakhir, dinormalisasi relatif terhadap wilayah dengan jumlah hotspot terbanyak pada periode yang sama.',
    },
    {
        key: 'aqi_impact',
        label: 'Dampak Kualitas Udara',
        weight: 0.2,
        barClass: 'bg-fresh-light',
        tooltip:
            'Rata-rata AQI kota-kota terkait wilayah ini, dinormalisasi terhadap skala AQI US EPA (0–300). Diberi bobot lebih rendah karena AQI juga dipengaruhi faktor lain di luar karhutla, seperti kendaraan dan industri.',
    },
];

const PRIORITY_SCORE_TOOLTIP =
    'Jumlah terbobot dari tiga komponen di atas (0.4 × risiko deforestasi + 0.4 × frekuensi hotspot + 0.2 × dampak AQI). Semakin tinggi skor, semakin diprioritaskan wilayah ini untuk monitoring dan mitigasi.';

function InfoTooltip({ text }) {
    return (
        <Tooltip>
            <TooltipTrigger
                className="text-ink/30 hover:text-ink/60 transition-colors"
                aria-label="Penjelasan"
            >
                <Info className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-64 text-sm">
                {text}
            </TooltipContent>
        </Tooltip>
    );
}

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
                {COMPONENTS.map((c, index) => {
                    const value = normalized[c.key];
                    const contribution = value * c.weight;
                    const unavailable =
                        (c.key === 'gfw_risk' && gfwUnavailable) ||
                        (c.key === 'aqi_impact' && aqiUnavailable);

                    return (
                        <div key={c.key}>
                            <div className="mb-1 flex items-baseline justify-between text-sm">
                                <span className="flex items-center gap-1.5 text-ink/70">
                                    {c.label}{' '}
                                    <span className="text-xs text-ink/40">(bobot {c.weight})</span>
                                    <InfoTooltip text={c.tooltip} />
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
                                    <motion.div
                                        className={`h-full rounded-full ${c.barClass}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(value * 100, 100)}%` }}
                                        transition={{ duration: 0.9, ease: 'easeOut', delay: 0.25 + index * 0.12 }}
                                    />
                                )}
                            </div>
                        </div>
                    );
                })}

                <div className="flex items-baseline justify-between border-t border-black/5 pt-3 text-sm font-semibold">
                    <span className="flex items-center gap-1.5 text-ink">
                        Priority Score
                        <InfoTooltip text={PRIORITY_SCORE_TOOLTIP} />
                    </span>
                    <span className="tabular-nums text-forest-dark">
                        {parseFloat(score.priority_score).toFixed(3)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}