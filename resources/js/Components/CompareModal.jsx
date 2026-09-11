import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import RiskBadge from '@/components/RiskBadge';

// Fetch dipicu tiap kali modal dibuka dengan set regionIds yang berbeda —
// bukan Inertia visit, karena ini cuma partial data untuk overlay, bukan
// perpindahan halaman (state Dashboard di baliknya tidak boleh ikut reload).
export default function CompareModal({ open, onOpenChange, regionIds }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || regionIds.length < 2) return;

        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        regionIds.forEach((id) => params.append('ids[]', id));

        fetch(route('region.compare') + '?' + params.toString())
            .then((res) => {
                if (!res.ok) throw new Error('Gagal memuat data perbandingan');
                return res.json();
            })
            .then((json) => setData(json.data))
            .catch(() => setError('Gagal memuat data perbandingan. Coba lagi.'))
            .finally(() => setLoading(false));
    }, [open, regionIds]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {/* sm:max-w-4xl (bukan cuma max-w-4xl): default DialogContent di
                dialog.jsx punya "sm:max-w-sm" bawaan. Class tanpa prefix
                breakpoint gak dianggap "konflik" sama class ber-prefix sm:
                oleh tailwind-merge, jadi keduanya ikut ke-apply dan
                sm:max-w-sm menang di layar >=640px — itu sebabnya modal
                kepaksa sempit (dempet) walau sudah dikasih max-w-4xl. */}
            <DialogContent className="max-h-[85vh] max-w-4xl sm:max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading">Bandingkan Wilayah</DialogTitle>
                </DialogHeader>

                {loading && (
                    <p className="py-8 text-center text-sm text-ink/50">Memuat data...</p>
                )}

                {error && (
                    <p className="py-8 text-center text-sm text-risk-tinggi">{error}</p>
                )}

                {!loading && !error && (
                    // grid-cols-1 di mobile (kartu ditumpuk vertikal, bukan diperas
                    // jadi 2-3 kolom sempit) — baru pindah ke multi-kolom di md ke atas.
                    <div className={`grid grid-cols-1 gap-4 ${data.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {data.map((item) => (
                            <div key={item.region.id} className="space-y-2">
                                {/* min-w-0 + truncate di blok nama: mencegah nama wilayah
                                    panjang ("Kabupaten Ogan Komering Ilir") mendorong/
                                    menabrak badge. shrink-0 di badge: badge tidak pernah
                                    ikut diperas walau nama wilayah panjang. */}
                                <div className="flex items-start justify-between gap-2 px-1">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-ink" title={item.region.name}>
                                            {item.region.name}
                                        </p>
                                        <p className="truncate text-xs text-ink/50">{item.region.province}</p>
                                    </div>
                                    {item.score && (
                                        <div className="shrink-0">
                                            <RiskBadge category={item.score.priority_rank_category} />
                                        </div>
                                    )}
                                </div>
                                <ScoreBreakdown score={item.score} />
                            </div>
                        ))}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}