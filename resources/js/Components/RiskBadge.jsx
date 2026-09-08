import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

// Kelas ditulis literal (bukan interpolasi string) supaya terdeteksi Tailwind JIT.
// Warna aktualnya tetap satu sumber: token --color-risk-* di app.css.
const RISK_CONFIG = {
    rendah: {
        label: 'Rendah',
        badgeClass: 'bg-risk-rendah/10 text-risk-rendah',
        dotClass: 'bg-risk-rendah',
    },
    sedang: {
        label: 'Sedang',
        badgeClass: 'bg-risk-sedang/15 text-amber-700',
        dotClass: 'bg-risk-sedang',
    },
    tinggi: {
        label: 'Tinggi',
        badgeClass: 'bg-risk-tinggi/10 text-risk-tinggi',
        dotClass: 'bg-risk-tinggi',
    },
    sangat_tinggi: {
        label: 'Sangat Tinggi',
        badgeClass: 'bg-risk-sangat-tinggi/10 text-risk-sangat-tinggi',
        dotClass: 'bg-risk-sangat-tinggi',
    },
    na: {
        label: 'N/A',
        badgeClass: 'border border-dashed border-risk-na/40 bg-transparent text-ink/50',
        dotClass: 'bg-risk-na',
    },
};

/**
 * `na` sengaja dirender berbeda secara struktural, bukan cuma beda warna:
 * - border dashed (bukan solid) → menyampaikan "tidak terukur", beda dari "terukur rendah"
 * - icon tanya menggantikan dot solid → dot bulat penuh menyiratkan nilai pasti,
 *   sementara `na` berarti sistem gagal mengambil data (Rules.md §2: null ≠ 0)
 * Ini penting karena kalau na cuma abu-abu solid, orang bisa salah baca sebagai
 * "risiko rendah versi pucat", padahal maknanya sama sekali beda.
 */
export default function RiskBadge({ category, className = '' }) {
    const config = RISK_CONFIG[category] ?? RISK_CONFIG.na;
    const isNa = !RISK_CONFIG[category] || category === 'na';

    return (
        <Badge
            variant="outline"
            className={`gap-1.5 border-0 font-medium ${config.badgeClass} ${className}`}
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