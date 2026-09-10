import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
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
        // h-full: grid (grid-cols-2 lg:grid-cols-4 di Dashboard.jsx) sudah stretch
        // tinggi tiap KOLOM secara default, tapi Card di dalamnya tidak otomatis
        // ikut ngisi penuh tanpa h-full — makanya sebelumnya tinggi tiap card beda
        // tergantung ada/tidaknya sublabel atau tooltip.
        <Card className="h-full border-black/5 shadow-sm">
            <CardContent className="flex h-full flex-col p-4">
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
                    {isEmpty ? '—' : <AnimatedNumber value={value} />}
                </p>
                {/* mt-auto: baris sublabel / pesan kosong didorong ke bawah supaya
                    sejajar di semua card walau tinggi card-nya sudah disamakan
                    (h-full) — tanpa ini, tiap card yang punya sublabel/tidak akan
                    keliatan "menempel" di posisi vertikal yang beda-beda. */}
                {sublabel && <p className="mt-auto truncate pt-1 text-xs text-ink/50">{sublabel}</p>}
                {isEmpty && !sublabel && (
                    <p className="mt-auto pt-1 text-xs text-ink/40">Data tidak tersedia</p>
                )}
            </CardContent>
        </Card>
    );
}

// Count-up dari 0 ke angka aslinya. Dipilih daripada efek "randomize lalu
// berhenti" karena ini dashboard monitoring data serius (karhutla, risiko,
// kualitas udara) — count-up rapi lebih cepat dibaca dan tidak kesan
// gimmick/slot-machine untuk angka yang orang butuh percaya akurasinya.
//
// `rounded` adalah MotionValue<string>, dipasang langsung sebagai children
// <motion.span> — Framer Motion menulis teksnya langsung ke DOM node tanpa
// lewat re-render React, jadi tetap ringan walau animasinya jalan tiap frame.
function AnimatedNumber({ value }) {
    const numericValue = Number(value);
    const isNumeric = !Number.isNaN(numericValue);

    const motionValue = useMotionValue(0);
    const rounded = useTransform(motionValue, (latest) => Math.round(latest).toLocaleString('id-ID'));

    useEffect(() => {
        if (!isNumeric) return;
        const controls = animate(motionValue, numericValue, { duration: 0.9, ease: 'easeOut' });
        return () => controls.stop();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [numericValue, isNumeric]);

    // Fallback: kalau value bukan angka (string non-numerik dsb), tampilkan
    // apa adanya tanpa dipaksa dianimasikan.
    if (!isNumeric) return <>{value}</>;

    return <motion.span>{rounded}</motion.span>;
}