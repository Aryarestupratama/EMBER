import { Card, CardContent } from '@/components/ui/card';

/**
 * `text-stat-md` sebelumnya dipakai tapi tidak pernah didefinisikan di app.css —
 * artinya browser diam-diam fallback ke ukuran default, bukan error yang kelihatan.
 * Ditambahkan sebagai token resmi di app.css (lihat file app.css revisi).
 */
export default function StatTile({ label, value, sublabel, accent = false }) {
    const isEmpty = value === null || value === undefined || value === '—';

    return (
        <Card className="border-black/5 shadow-sm">
            <CardContent className="p-4">
                <p className="text-sm text-ink/60">{label}</p>
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