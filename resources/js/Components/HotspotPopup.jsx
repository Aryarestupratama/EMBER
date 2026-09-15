import { Popup } from 'react-leaflet';
import { MapPin, Gauge, Calendar, Flame as FlameIcon, TreePine } from 'lucide-react';
import { RISK_CONFIG, getRiskLabel } from '@/components/RiskBadge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

function categoryIcon(category) {
    return category === 'rendah' ? TreePine : FlameIcon;
}

export default function HotspotPopup({ hotspot }) {
    const { t, localeCode } = useLanguage();
    const category = hotspot.gfw_risk_category;
    const config = RISK_CONFIG[category] ?? RISK_CONFIG.na;
    const CategoryIcon = categoryIcon(category);

    const regionName = hotspot.region?.name ?? null;
    const coordText = `${parseFloat(hotspot.latitude).toFixed(4)}, ${parseFloat(hotspot.longitude).toFixed(4)}`;

    const detectedAtText = hotspot.acq_date
        ? new Date(hotspot.acq_date).toLocaleDateString(localeCode, {
              day: 'numeric',
              month: 'short',
          })
        : t('hotspotPopup.unknown');

    return (
        <Popup minWidth={200}>
            <div className="w-48 p-3">
                <div className="mb-2 flex items-start gap-1.5">
                    <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-ink/40" />
                    <div className="min-w-0">
                        {regionName ? (
                            <>
                                <div className="truncate text-xs font-semibold leading-tight text-ink">
                                    {regionName}
                                </div>
                                <div className="tabular-nums text-[10px] leading-tight text-ink/50">
                                    {coordText}
                                </div>
                            </>
                        ) : (
                            <div className="tabular-nums text-[10px] leading-tight text-ink/50">
                                {coordText}
                            </div>
                        )}
                    </div>
                </div>

                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className={`text-lg font-bold leading-none ${config.textClass}`}>
                            {getRiskLabel(t, category)}
                        </div>
                        <div className="mt-1 text-[10px] font-medium leading-tight text-ink/50">
                            {t('hotspotPopup.riskCategoryLabel')}
                        </div>
                    </div>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.softBgClass}`}>
                        <CategoryIcon className={`h-4 w-4 ${config.textClass}`} strokeWidth={2.2} />
                    </div>
                </div>

                <div className="space-y-1.5 border-t border-dashed border-black/10 pt-2">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-ink/60">
                            <Gauge className="h-3 w-3 text-ink/40" />
                            {t('hotspotPopup.detectionConfidence')}
                        </span>
                        <span className="tabular-nums font-semibold text-ink">
                            {hotspot.confidence}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-ink/60">
                            <Calendar className="h-3 w-3 text-ink/40" />
                            {t('hotspotPopup.detectedAt')}
                        </span>
                        <span
                            className={`tabular-nums ${
                                hotspot.acq_date ? 'font-semibold text-ink' : 'text-ink/40'
                            }`}
                        >
                            {detectedAtText}
                        </span>
                    </div>
                </div>
            </div>
        </Popup>
    );
}