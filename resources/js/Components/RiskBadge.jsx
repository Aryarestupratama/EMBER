import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

export const RISK_CONFIG = {
    rendah: {
        label: 'Rendah',
        textClass: 'text-risk-rendah',
        softBgClass: 'bg-risk-rendah/10',
        dotClass: 'bg-risk-rendah',
    },
    sedang: {
        label: 'Sedang',
        textClass: 'text-amber-700',
        softBgClass: 'bg-risk-sedang/15',
        dotClass: 'bg-risk-sedang',
    },
    tinggi: {
        label: 'Tinggi',
        textClass: 'text-risk-tinggi',
        softBgClass: 'bg-risk-tinggi/10',
        dotClass: 'bg-risk-tinggi',
    },
    sangat_tinggi: {
        label: 'Sangat Tinggi',
        textClass: 'text-risk-sangat-tinggi',
        softBgClass: 'bg-risk-sangat-tinggi/10',
        dotClass: 'bg-risk-sangat-tinggi',
    },
    na: {
        label: 'N/A',
        textClass: 'text-ink/50',
        softBgClass: 'bg-transparent',
        dotClass: 'bg-risk-na',
    },
};

export default function RiskBadge({ category, className = '' }) {
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
            {config.label}
        </Badge>
    );
}