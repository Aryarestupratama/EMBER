import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Urutan & bobot komponen formula (Rules.md §3)  nilai numerik ini tetap,
// hanya label & tooltip yang diambil dari kamus terjemahan.
const COMPONENT_KEYS = [
    { key: 'gfw_risk', weight: 0.4, barClass: 'bg-forest-dark' },
    { key: 'hotspot_frequency', weight: 0.4, barClass: 'bg-fresh' },
    { key: 'aqi_impact', weight: 0.2, barClass: 'bg-fresh-light' },
];

function InfoTooltip({ text, ariaLabel }) {
    return (
        <Tooltip>
            <TooltipTrigger
                className="text-ink/30 hover:text-ink/60 transition-colors"
                aria-label={ariaLabel}
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
    const { t } = useLanguage();

    if (!score) {
        return (
            <Card className="border-black/5 shadow-sm">
                <CardContent className="py-8 text-center text-sm text-ink/50">
                    {t('scoreBreakdown.empty')}
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
                    {t('scoreBreakdown.title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                {COMPONENT_KEYS.map((c, index) => {
                    const value = normalized[c.key];
                    const contribution = value * c.weight;
                    const unavailable =
                        (c.key === 'gfw_risk' && gfwUnavailable) ||
                        (c.key === 'aqi_impact' && aqiUnavailable);

                    return (
                        <div key={c.key}>
                            <div className="mb-1 flex items-baseline justify-between text-sm">
                                <span className="flex items-center gap-1.5 text-ink/70">
                                    {t(`scoreBreakdown.components.${c.key}.label`)}{' '}
                                    <span className="text-xs text-ink/40">
                                        {t('scoreBreakdown.weightLabel', { weight: c.weight })}
                                    </span>
                                    <InfoTooltip
                                        text={t(`scoreBreakdown.components.${c.key}.tooltip`)}
                                        ariaLabel={t('scoreBreakdown.infoAria')}
                                    />
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
                        {t('scoreBreakdown.priorityScore')}
                        <InfoTooltip
                            text={t('scoreBreakdown.priorityScoreTooltip')}
                            ariaLabel={t('scoreBreakdown.infoAria')}
                        />
                    </span>
                    <span className="tabular-nums text-forest-dark">
                        {parseFloat(score.priority_score).toFixed(3)}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}