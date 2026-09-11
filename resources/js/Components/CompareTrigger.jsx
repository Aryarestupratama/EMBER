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
                                className="flex items-center gap-1 rounded-full bg-canvas px-2 py-1 text-xs text-ink/70"
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
                    <Button size="sm" onClick={onCompare} className="gap-1.5 shrink-0">
                        <GitCompare className="size-3.5" />
                        Bandingkan
                    </Button>
                </motion.div>
            )}
        </AnimatePresence>
    );
}