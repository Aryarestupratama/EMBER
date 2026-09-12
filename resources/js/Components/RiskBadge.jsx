import { Badge } from '@/components/ui/badge';
import { HelpCircle } from 'lucide-react';

// Kelas ditulis literal (bukan interpolasi string) supaya terdeteksi Tailwind JIT.
// Warna aktualnya tetap satu sumber: token --color-risk-* di app.css.
// Diexport (bukan cuma dipakai lokal) supaya komponen lain yang butuh mapping
// kategori -> label/warna yang SAMA PERSIS (mis. HotspotPopup di MapView.jsx)
// tidak perlu bikin ulang mapping ketiga yang bisa gampang divergen.
export const RISK_CONFIG = {
    rendah: {
        label: 'Rendah',
        textClass: 'text-risk-rendah',
        softBgClass: 'bg-risk-rendah/10',
        dotClass: 'bg-risk-rendah',
    },
    // text-amber-700 (bukan text-risk-sedang) sengaja dipertahankan: bg kuning
    // amber (#FFD60A) terlalu terang untuk kontras teks AA jika teksnya juga
    // kuning. Shade amber-700 ini adalah standar tunggal dipakai di seluruh
    // app untuk elemen bertema info/kuning (lihat juga SummaryCard.jsx) —
    // jangan pakai shade amber lain (amber-600, dst) di tempat lain.
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