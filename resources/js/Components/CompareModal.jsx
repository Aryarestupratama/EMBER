import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import RiskBadge from '@/components/RiskBadge';

export default function CompareModal({ open, onOpenChange, regionIds }) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open || regionIds.length < 2) {
            setData([]);
            return;
        }

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
            <DialogContent className="max-h-[85vh] max-w-4xl sm:max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading">Bandingkan Wilayah</DialogTitle>
                </DialogHeader>

                {loading && (
                    <p className="py-8 text-center text-sm text-ink/50">Memuat data...</p>
                )}

                {error && (
                    <p className="py-8 text-center text-sm text-risk-sangat-tinggi">{error}</p>
                )}

                {!loading && !error && regionIds.length < 2 && (
                    <p className="py-8 text-center text-sm text-ink/50">
                        Pilih minimal 2 wilayah untuk dibandingkan.
                    </p>
                )}

                {!loading && !error && regionIds.length >= 2 && (
                    <div className={`grid grid-cols-1 gap-4 ${data.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {data.map((item) => (
                            <div key={item.region.id} className="space-y-2">
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