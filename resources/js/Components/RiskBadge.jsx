import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

// Hanya menyimpan kelas styling per kategori. Label ditentukan lewat
// terjemahan (lihat lib/i18n/translations.js -> risk.*) supaya konsisten
// dengan pola single source of truth threshold di Rules.md §2/§7.
export const RISK_CONFIG = {
    rendah: {
        textClass: 'text-risk-rendah',
        softBgClass: 'bg-risk-rendah/10',
        dotClass: 'bg-risk-rendah',
    },
    sedang: {
        textClass: 'text-amber-700',
        softBgClass: 'bg-risk-sedang/15',
        dotClass: 'bg-risk-sedang',
    },
    tinggi: {
        textClass: 'text-risk-tinggi',
        softBgClass: 'bg-risk-tinggi/10',
        dotClass: 'bg-risk-tinggi',
    },
    sangat_tinggi: {
        textClass: 'text-risk-sangat-tinggi',
        softBgClass: 'bg-risk-sangat-tinggi/10',
        dotClass: 'bg-risk-sangat-tinggi',
    },
    na: {
        textClass: 'text-ink/50',
        softBgClass: 'bg-transparent',
        dotClass: 'bg-risk-na',
    },
};

// Helper dipakai juga oleh HotspotPopup.jsx supaya label kategori risiko
// konsisten di seluruh aplikasi, bukan didefinisikan berulang.
export function getRiskLabel(t, category) {
    return RISK_CONFIG[category] ? t(`risk.${category}`) : t('risk.na');
}

export default function RiskBadge({ category, className = '' }) {
    const { t } = useLanguage();
    const config = RISK_CONFIG[category] ?? RISK_CONFIG.na;
    const isNa = !RISK_CONFIG[category] || category === 'na';
    const badgeClass = isNa
        ? 'border border-dashed border-risk-na/40 bg-transparent text-ink/50'
        : `border-0 ${config.softBgClass} ${config.textClass}`;

    return (
        <Badge
            variant="outline"
            className={`gap-1.5 font-medium ${badgeClass} ${className}`}
        >
            {isNa ? (
                <HelpCircle className="h-3 w-3" strokeWidth={2.5} />
            ) : (
                <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
            )}
            {getRiskLabel(t, category)}
        </Badge>
    );
}