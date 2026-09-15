import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ScoreBreakdown from '@/components/ScoreBreakdown';
import RiskBadge from '@/components/RiskBadge';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function CompareModal({ open, onOpenChange, regionIds }) {
    const { t } = useLanguage();
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
                if (!res.ok) throw new Error(t('compareModal.fetchError'));
                return res.json();
            })
            .then((json) => setData(json.data))
            .catch(() => setError(t('compareModal.loadError')))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, regionIds]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[85vh] max-w-4xl sm:max-w-4xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-heading">{t('compareModal.title')}</DialogTitle>
                </DialogHeader>

                {loading && (
                    <p className="py-8 text-center text-sm text-ink/50">{t('compareModal.loading')}</p>
                )}

                {error && (
                    <p className="py-8 text-center text-sm text-risk-sangat-tinggi">{error}</p>
                )}

                {!loading && !error && regionIds.length < 2 && (
                    <p className="py-8 text-center text-sm text-ink/50">
                        {t('compareModal.selectAtLeast2')}
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