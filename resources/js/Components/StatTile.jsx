import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const TONE_HEADLINE_CLASS = {
    neutral: 'text-ink',
    success: 'text-forest-dark',
    warning: 'text-risk-sedang',
    danger: 'text-risk-tinggi',
};

const TONE_BORDER_CLASS = {
    neutral: 'border-l-black/10',
    success: 'border-l-forest',
    warning: 'border-l-risk-sedang',
    danger: 'border-l-risk-tinggi',
};

export default function StatTile({
    label,
    value,
    sublabel,
    accent = false,
    tooltip,
    headline,
    tone = 'neutral',
    variant = 'default',
    showValue = true,
}) {
    const { t } = useLanguage();
    const isEmpty = value === null || value === undefined || value === '';
    const isMuted = variant === 'muted';

    return (
        <Card
            className={`h-full border-l-4 border-black/5 shadow-sm ${TONE_BORDER_CLASS[tone]} ${
                isMuted ? 'opacity-80' : ''
            }`}
        >
            <CardContent className="flex h-full flex-col p-4">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm text-ink/60">{label}</p>
                    {tooltip && (
                        <Tooltip>
                            <TooltipTrigger
                                render={
                                    <button
                                        type="button"
                                        className="text-ink/30 hover:text-ink/60 transition-colors"
                                        aria-label={t('statTile.infoAria', { label })}
                                    >
                                        <Info className="size-3.5" />
                                    </button>
                                }
                            />
                            <TooltipContent side="top" className="max-w-64 text-sm">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                {headline ? (
                    <>
                        <div className="flex flex-1 flex-col justify-center">
                            <p
                                className={`font-heading text-lg font-semibold leading-tight ${
                                    isEmpty ? 'text-ink/30' : isMuted ? 'text-ink' : TONE_HEADLINE_CLASS[tone]
                                }`}
                            >
                                {isEmpty ? t('common.dataNotAvailable') : headline}
                            </p>
                        </div>
                        <div className="min-h-[1.25rem] pt-1">
                            {!isEmpty && (showValue || sublabel) && (
                                <p className="truncate text-sm tabular-nums text-ink/50">
                                    {showValue && <AnimatedNumber value={value} />}
                                    {showValue && sublabel && <span className="text-ink/40"> · </span>}
                                    {sublabel && (
                                        <span className={showValue ? 'text-ink/40' : ''}>{sublabel}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-1 flex-col justify-center">
                            <p
                                className={`tabular-nums text-stat-md ${
                                    isEmpty ? 'text-ink/30' : accent ? 'text-risk-tinggi' : 'text-forest-dark'
                                }`}
                            >
                                {isEmpty ? '' : <AnimatedNumber value={value} />}
                            </p>
                        </div>
                        <div className="min-h-[1.25rem] pt-1">
                            {sublabel && <p className="truncate text-xs text-ink/50">{sublabel}</p>}
                            {isEmpty && !sublabel && (
                                <p className="text-xs text-ink/40">{t('common.dataNotAvailable')}</p>
                            )}
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function AnimatedNumber({ value }) {
    const { localeCode } = useLanguage();
    const numericValue = Number(value);
    const isNumeric = !Number.isNaN(numericValue);

    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString(localeCode));

    useEffect(() => {
        if (!isNumeric) return;
        const controls = animate(motionValue, numericValue, { duration: 0.9, ease: 'easeOut' });
        return () => controls.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numericValue, isNumeric]);

    if (!isNumeric) return <>{value}</>;

    return <motion.span>{rounded}</motion.span>;
}