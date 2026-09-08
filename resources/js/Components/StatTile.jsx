import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

/**
 * `text-stat-md` sebelumnya dipakai tapi tidak pernah didefinisikan di app.css —
 * artinya browser diam-diam fallback ke ukuran default, bukan error yang kelihatan.
 * Ditambahkan sebagai token resmi di app.css (lihat file app.css revisi).
 *
 * `tooltip` (opsional): teks penjelasan singkat yang muncul saat hover pada
 * ikon info di sebelah label. Dipakai untuk istilah yang butuh konteks
 * tambahan (mis. "Wilayah Risiko Tinggi" — dihitung dari apa?), konsisten
 * dengan prinsip "actionable, bukan sekadar informatif" (PRD.md §4).
 */
export default function StatTile({ label, value, sublabel, accent = false, tooltip }) {
    const isEmpty = value === null || value === undefined || value === '—';

    return (
        <Card className="border-black/5 shadow-sm">
            <CardContent className="p-4">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm text-ink/60">{label}</p>
                    {tooltip && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    type="button"
                                    className="text-ink/30 hover:text-ink/60 transition-colors"
                                    aria-label={`Penjelasan: ${label}`}
                                >
                                    <Info className="size-3.5" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-64 text-sm">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                <p
                    className={`tabular-nums text-stat-md ${
                        isEmpty ? 'text-ink/30' : accent ? 'text-risk-tinggi' : 'text-forest-dark'
                    }`}
                >
                    {isEmpty ? '—' : value}
                </p>
                {sublabel && <p className="mt-1 truncate text-xs text-ink/50">{sublabel}</p>}
                {isEmpty && !sublabel && (
                    <p className="mt-1 text-xs text-ink/40">Data tidak tersedia</p>
                )}
            </CardContent>
        </Card>
    );
}