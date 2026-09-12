import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { GitCompare, X } from 'lucide-react';

export default function CompareTrigger({ selectedRegions, onRemove, onCompare }) {
    return (
        <AnimatePresence>
            {selectedRegions.length >= 2 && (
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="sticky bottom-4 z-10 mx-2 flex items-center justify-between gap-3 rounded-xl border border-black/5 bg-white px-4 py-2.5 shadow-lg"
                >
                    <div className="flex flex-wrap items-center gap-1.5">
                        {selectedRegions.map((r) => (
                            <span
                                key={r.id}
                                className="flex items-center gap-1 rounded-full border border-black/5 bg-canvas px-2 py-1 text-xs text-ink/70"
                            >
                                {r.name}
                                <button
                                    type="button"
                                    onClick={() => onRemove(r.id)}
                                    aria-label={`Hapus ${r.name} dari perbandingan`}
                                    className="text-ink/40 hover:text-ink/70"
                                >
                                    <X className="size-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                    {/* tabular-nums: "2/3" & "3/3" harus rata lebar sama, biar teks
                        di sebelah tombol nggak geser posisi tiap jumlah berubah. */}
                    <div className="flex shrink-0 items-center gap-2.5">
                        <span className="hidden tabular-nums text-xs text-ink/40 sm:inline">
                            {selectedRegions.length}/3 dipilih
                        </span>
                        {/* bg-forest: sebelumnya Button pakai varian default (abu-abu
                            netral) — padahal ini CTA utama dari seluruh alur compare,
                            jadi disamakan warnanya dengan brand primary (Design.md §2)
                            supaya jelas ini aksi yang harus diklik, bukan sekadar
                            salah satu tombol di antara banyak elemen lain di bar ini. */}
                        <Button
                            size="sm"
                            onClick={onCompare}
                            className="gap-1.5 bg-forest text-white hover:bg-forest-dark"
                        >
                            <GitCompare className="size-3.5" />
                            Bandingkan
                        </Button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}