import RiskBadge from '@/components/RiskBadge';
import SourceCredit from '@/components/SourceCredit';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Flame, Wind, Radar, Lightbulb, Thermometer } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

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
    const { t } = useLanguage();
    const { location, risk, air_quality, weather, nearby_hotspots, mitigation } = result;

    const aqiCategoryLabel = air_quality.category
        ? t(`summaryCard.aqiCategory.${air_quality.category}`)
        : t('summaryCard.unknownCategory');

    // Backend hanya mengirim kategori (lihat MitigationHelper::forLocation);
    // teksnya sepenuhnya diambil dari kamus terjemahan supaya ikut toggle bahasa.
    const fireRiskCategory = mitigation?.fire_risk?.category ?? 'na';
    const airQualityCategory = mitigation?.air_quality?.category ?? null;
    const fireRiskShortText = t(`mitigation.fireRisk.${fireRiskCategory}.shortText`);
    const airQualityShortText = airQualityCategory
        ? t(`mitigation.airQuality.${airQualityCategory}.shortText`)
        : t('mitigation.airQuality.unavailable.shortText');

    return (
        <Card className="border-black/5 shadow-sm">
            <CardContent className="space-y-5 p-6">
                <SectionRow
                    icon={MapPin}
                    iconClass="text-forest-dark"
                    bgClass="bg-forest/10"
                    label={t('summaryCard.location')}
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
                    label={t('summaryCard.riskStatus')}
                >
                    <div className="flex items-center gap-2">
                        <RiskBadge category={risk.category} className="px-3 py-1 text-sm" />
                        {risk.score !== null && (
                            <span className="tabular-nums text-sm text-ink/50">
                                {t('summaryCard.scoreLabel', { score: risk.score.toFixed(2) })}
                            </span>
                        )}
                    </div>
                </SectionRow>

                <SectionRow
                    icon={Wind}
                    iconClass="text-fresh"
                    bgClass="bg-fresh/10"
                    label={t('summaryCard.airQuality')}
                >
                    {air_quality.aqi ? (
                        <p className="text-sm text-ink">
                            <span className="tabular-nums text-lg font-semibold text-forest-dark">
                                AQI {air_quality.aqi}
                            </span>{' '}
                             <span className={AQI_CATEGORY_TONE[air_quality.category] ?? ''}>{aqiCategoryLabel}</span>
                        </p>
                    ) : (
                        <p className="text-sm text-ink/50">{t('common.dataNotAvailable')}</p>
                    )}
                </SectionRow>

                <SectionRow
                    icon={Thermometer}
                    iconClass="text-amber-600"
                    bgClass="bg-amber-500/10"
                    label={t('summaryCard.temperature')}
                >
                    {weather?.temp_c != null ? (
                        <p className="text-sm text-ink">
                            <span className="tabular-nums text-lg font-semibold text-forest-dark">
                                {Math.round(weather.temp_c)}°C
                            </span>
                            {weather.heat_index_c != null && (
                                <span className="text-ink/50">
                                    {' '}
                                    {t('summaryCard.feelsLike', { temp: Math.round(weather.heat_index_c) })}
                                </span>
                            )}
                        </p>
                    ) : (
                        <p className="text-sm text-ink/50">{t('common.dataNotAvailable')}</p>
                    )}
                </SectionRow>

                <SectionRow
                    icon={Radar}
                    iconClass="text-ink/60"
                    bgClass="bg-ink/5"
                    label={t('summaryCard.nearbyHotspots')}
                >
                    {nearby_hotspots.count > 0 ? (
                        <p className="text-sm text-ink">
                            <span className="tabular-nums font-semibold">{nearby_hotspots.count}</span>{' '}
                            {t('summaryCard.hotspotCountSuffix', { radius: nearby_hotspots.radius_km })}
                            {nearby_hotspots.nearest_km !== null && (
                                <span className="text-ink/50">
                                    {t('summaryCard.nearestDistance', {
                                        distance: nearby_hotspots.nearest_km.toFixed(1),
                                    })}
                                </span>
                            )}
                        </p>
                    ) : (
                        <p className="text-sm text-ink/50">
                            {t('summaryCard.noHotspots', { radius: nearby_hotspots.radius_km })}
                        </p>
                    )}
                </SectionRow>

                <SectionRow
                    icon={Lightbulb}
                    iconClass="text-amber-700"
                    bgClass="bg-amber-500/10"
                    label={t('summaryCard.recommendation')}
                >
                    <div className="space-y-2 rounded-lg bg-canvas p-3">
                        <p className="text-sm text-ink/80">{fireRiskShortText}</p>
                        <p className="text-sm text-ink/80">{airQualityShortText}</p>
                    </div>
                </SectionRow>

                <SourceCredit />
            </CardContent>
        </Card>
    );
}