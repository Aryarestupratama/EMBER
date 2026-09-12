import { useState } from 'react';
import { Link } from '@inertiajs/react';
import RiskBadge from '@/components/RiskBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { GitCompareArrows, X } from 'lucide-react';

// `compareMode` disimpan lokal di sini (bukan di Dashboard) karena ini murni
// state UI "lagi mode pilih atau tidak" — tidak perlu dan tidak seharusnya
// nyampur sama `selectedIds` yang memang milik Dashboard (dipakai juga oleh
// CompareTrigger & CompareModal).
export default function RegionRankingList({ regions, selected = [], onToggleSelect, onClearSelection }) {
    const [compareMode, setCompareMode] = useState(false);

    const startCompare = () => setCompareMode(true);

    // Keluar dari mode compare: matikan checkbox DAN bersihkan seleksi yang
    // sudah kepilih (`onClearSelection`) — supaya kalau user buka mode ini
    // lagi nanti, dia mulai dari kosong, bukan bawa-bawa seleksi lama yang
    // sudah tidak kelihatan checkbox-nya.
    const cancelCompare = () => {
        setCompareMode(false);
        onClearSelection?.();
    };

    return (
        <Card className="border-black/5 shadow-sm">
            <CardHeader className="flex-row items-center justify-between border-b border-black/5 pb-3">
                <CardTitle className="font-heading text-sm font-semibold text-ink">
                    Wilayah Prioritas
                </CardTitle>

                {onToggleSelect && (
                    compareMode ? (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelCompare}
                            className="h-7 gap-1.5 px-2 text-xs text-ink/50 hover:text-ink"
                        >
                            <X className="size-3.5" />
                            Batal
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={startCompare}
                            className="h-7 gap-1.5 px-2 text-xs text-forest-dark hover:bg-forest-dark/10 hover:text-forest-dark"
                        >
                            <GitCompareArrows className="size-3.5" />
                            Bandingkan Wilayah
                        </Button>
                    )
                )}
            </CardHeader>

            {/* Panduan singkat, cuma tampil begitu mode compare aktif — bukan
                noise yang harus dilihat user tiap buka dashboard, tapi hadir
                tepat saat dibutuhkan (persis setelah klik "Bandingkan Wilayah").
                Pesannya berubah begitu limit 3 tercapai — supaya "kenapa
                checkbox ini mati?" langsung terjawab di sini, bukan cuma
                ditebak dari checkbox yang disabled tanpa keterangan. */}
            {compareMode && (
                <div className="border-b border-black/5 bg-forest-dark/5 px-4 py-2 text-xs text-forest-dark">
                    {selected.length >= 3 ? (
                        <>
                            Maksimum <span className="font-medium">3 wilayah</span> sekaligus. Hapus satu
                            untuk memilih yang lain, atau klik <span className="font-medium">Bandingkan</span>.
                        </>
                    ) : (
                        <>
                            Pilih 2–3 wilayah di bawah, lalu klik <span className="font-medium">Bandingkan</span> yang muncul.
                        </>
                    )}
                </div>
            )}

            <CardContent className="space-y-0.5 p-2">
                {regions.length === 0 && (
                    <p className="py-6 text-center text-sm text-ink/50">
                        Belum ada data wilayah prioritas untuk hari ini.
                    </p>
                )}

                {regions.map((item, index) => {
                    const isSelected = selected.includes(item.region.id);
                    // Batasi maksimum 3 dipilih sekaligus (selaras validasi backend) —
                    // checkbox yang belum terpilih otomatis nonaktif begitu sudah ada 3.
                    const disableUnselected = !isSelected && selected.length >= 3;

                    return (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-canvas ${
                                disableUnselected ? 'opacity-40' : ''
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Checkbox cuma dirender saat compareMode aktif — sebelum
                                    itu list-nya polos/bersih, tidak ada elemen interaktif
                                    ekstra yang bikin bingung "checkbox ini buat apa".
                                    title: alasan kenapa mati muncul di tooltip native saat
                                    hover, melengkapi opacity baris & pesan panduan di atas —
                                    3 sinyal berbeda (visual redup, tooltip, teks panduan)
                                    supaya "kenapa gak bisa diklik" gak cuma bisa ditebak. */}
                                {onToggleSelect && compareMode && (
                                    <Checkbox
                                        checked={isSelected}
                                        disabled={disableUnselected}
                                        onCheckedChange={() => onToggleSelect(item.region.id)}
                                        aria-label={`Pilih ${item.region.name} untuk dibandingkan`}
                                        title={disableUnselected ? 'Maksimum 3 wilayah sekaligus' : undefined}
                                    />
                                )}
                                <span className="tabular-nums w-5 text-sm font-medium text-ink/30">
                                    {index + 1}
                                </span>
                                <Link
                                    href={route('region.detail', item.region.slug)}
                                    className="group"
                                >
                                    <p className="text-sm font-medium text-ink group-hover:underline">
                                        {item.region.name}
                                    </p>
                                    <p className="text-xs text-ink/50">{item.region.province}</p>
                                </Link>
                            </div>
                            <RiskBadge category={item.priority_rank_category} />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}