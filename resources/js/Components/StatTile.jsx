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
 *
 * --- Revisi hierarki (lihat Progress.md, diskusi StatTile 11 Sep) ---
 * Sebelumnya angka besar (`AnimatedNumber`) adalah satu-satunya elemen yang
 * menonjol di tile — masalahnya angka mentah ("247", "156") tidak
 * actionable buat pengguna awam tanpa baseline/arah. "247 hotspot" itu
 * banyak atau sedikit? Sekarang ditambah `headline`: satu frasa pendek
 * yang menerjemahkan angka jadi makna ("Tidak Sehat", "12 wilayah perlu
 * perhatian") — headline inilah yang jadi elemen paling menonjol,
 * `AnimatedNumber` turun jadi detail pendukung di bawahnya untuk yang mau
 * presisi (peneliti/pemda/juri). `headline` opsional & fallback ke
 * perilaku lama (angka besar) kalau tidak diisi, supaya pemanggilan lama
 * tidak patah.
 *
 * `tone` mengatur warna aksen headline + border kiri tipis (selaras
 * palet risiko Design.md §2), independen dari `accent` yang sudah ada
 * (accent tetap mengontrol warna AnimatedNumber lama, dipertahankan
 * untuk kompatibilitas pemanggilan yang belum dimigrasi ke `tone`).
 *
 * `variant="muted"` untuk tile yang sifatnya trust-signal, bukan alert
 * (mis. "Wilayah Terpantau") — supaya dia tidak menyita perhatian visual
 * yang seharusnya untuk tile lain yang lebih actionable.
 *
 * `showValue` (default true): kontrol baris angka sekunder di bawah
 * headline. Set `false` kalau angkanya sudah tertanam di teks `headline`
 * sendiri (mis. headline = "238 titik terdeteksi") — supaya angka yang
 * sama tidak dobel ditampilkan (sekali di headline, sekali lagi polos di
 * bawahnya tanpa konteks tambahan). Kalau `sublabel` tetap diisi saat
 * `showValue={false}`, sublabel tetap tampil sendirian (tanpa angka) —
 * berguna untuk kasus seperti "13 wilayah perlu perhatian" + sublabel
 * "dari 502 dipantau", di mana yang baru adalah konteks pembandingnya,
 * bukan angka 13-nya lagi.
 */
const TONE_HEADLINE_CLASS = {
    neutral: 'text-ink',
    success: 'text-forest-dark',
    warning: 'text-risk-sedang',
    danger: 'text-risk-tinggi',
};

const TONE_BORDER_CLASS = {
    neutral: 'border-l-black/10',
    success: 'border-l-forest',
    warning: 'border-l-risk-sedang',
    danger: 'border-l-risk-tinggi',
};

export default function StatTile({
    label,
    value,
    sublabel,
    accent = false,
    tooltip,
    headline,
    tone = 'neutral',
    variant = 'default',
    showValue = true,
}) {
    const isEmpty = value === null || value === undefined || value === '—';
    const isMuted = variant === 'muted';

    return (
        // h-full: grid (grid-cols-2 lg:grid-cols-4 di Dashboard.jsx) sudah stretch
        // tinggi tiap KOLOM secara default, tapi Card di dalamnya tidak otomatis
        // ikut ngisi penuh tanpa h-full — makanya sebelumnya tinggi tiap card beda
        // tergantung ada/tidaknya sublabel atau tooltip.
        //
        // border-l-4: penanda urgensi cepat tanpa perlu baca teks. Warna
        // 'neutral' (border-l-black/10) sengaja nyaris tidak kelihatan bedanya
        // dari border default Card, supaya tile tanpa `tone` eksplisit tidak
        // ikut-ikutan kelihatan "beraksen" secara tidak sengaja.
        <Card
            className={`h-full border-l-4 border-black/5 shadow-sm ${TONE_BORDER_CLASS[tone]} ${
                isMuted ? 'opacity-80' : ''
            }`}
        >
            <CardContent className="flex h-full flex-col p-4">
                <div className="flex items-center gap-1.5">
                    <p className="text-sm text-ink/60">{label}</p>
                    {tooltip && (
                        <Tooltip>
                            {/*
                                Base UI (@base-ui/react/tooltip) TIDAK memakai pola
                                `asChild` ala Radix. API-nya pakai prop `render`:
                                elemen yang diberikan lewat `render` akan disatukan
                                (merge) dengan behavior trigger, BUKAN dibungkus
                                dengan <button> tambahan bawaan Base UI.

                                Sebelumnya di sini dipakai `asChild` (pola Radix) —
                                itu prop yang tidak dikenali Base UI, jadi Base UI
                                tetap merender <button>-nya sendiri lalu <button>
                                Info di bawah ini nempel jadi ANAK-nya. Hasilnya:
                                <button> di dalam <button> (invalid HTML, dan
                                warning validateDOMNesting), ditambah `asChild`
                                ikut ke-spread sebagai atribut DOM asing.
                            */}
                            <TooltipTrigger
                                render={
                                    <button
                                        type="button"
                                        className="text-ink/30 hover:text-ink/60 transition-colors"
                                        aria-label={`Penjelasan: ${label}`}
                                    >
                                        <Info className="size-3.5" />
                                    </button>
                                }
                            />
                            <TooltipContent side="top" className="max-w-64 text-sm">
                                {tooltip}
                            </TooltipContent>
                        </Tooltip>
                    )}
                </div>
                {headline ? (
                    // Jalur baru — 3 zona tetap di dalam tinggi card yang sama
                    // (h-full):
                    //   1. label (baris di atas, sudah dirender sebelum blok ini)
                    //   2. headline: dibungkus flex-1 + justify-center supaya dia
                    //      mengisi proporsi ruang tengah secara vertikal, bukan
                    //      cuma nempel rapat di bawah label — jadi kartu dengan
                    //      headline pendek ("Baik") tetap terasa "penuh" secara
                    //      visual sama seperti kartu dengan headline panjang.
                    //   3. baris bawah: SELALU reserve tinggi yang sama
                    //      (min-h-[1.25rem]) walau kosong, supaya tinggi visual
                    //      tiap card konsisten satu sama lain — tanpa ini, tile
                    //      yang showValue=false & tanpa sublabel (mis. "Titik
                    //      Panas Hari Ini") keliatan lebih pendek/kosong
                    //      dibanding tile lain yang punya baris angka/sublabel.
                    <>
                        <div className="flex flex-1 flex-col justify-center">
                            <p
                                className={`font-heading text-lg font-semibold leading-tight ${
                                    isEmpty ? 'text-ink/30' : isMuted ? 'text-ink' : TONE_HEADLINE_CLASS[tone]
                                }`}
                            >
                                {isEmpty ? 'Data tidak tersedia' : headline}
                            </p>
                        </div>
                        <div className="min-h-[1.25rem] pt-1">
                            {!isEmpty && (showValue || sublabel) && (
                                <p className="truncate text-sm tabular-nums text-ink/50">
                                    {showValue && <AnimatedNumber value={value} />}
                                    {showValue && sublabel && <span className="text-ink/40"> · </span>}
                                    {sublabel && (
                                        <span className={showValue ? 'text-ink/40' : ''}>{sublabel}</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </>
                ) : (
                    // Jalur lama (tanpa headline): pola 3-zona yang sama
                    // diterapkan juga di sini, supaya pemanggilan lama yang
                    // belum dimigrasi ke `headline` tetap ikut selaras tinggi
                    // dan proporsinya dengan tile yang sudah pakai headline.
                    <>
                        <div className="flex flex-1 flex-col justify-center">
                            <p
                                className={`tabular-nums text-stat-md ${
                                    isEmpty ? 'text-ink/30' : accent ? 'text-risk-tinggi' : 'text-forest-dark'
                                }`}
                            >
                                {isEmpty ? '—' : <AnimatedNumber value={value} />}
                            </p>
                        </div>
                        <div className="min-h-[1.25rem] pt-1">
                            {sublabel && <p className="truncate text-xs text-ink/50">{sublabel}</p>}
                            {isEmpty && !sublabel && (
                                <p className="text-xs text-ink/40">Data tidak tersedia</p>
                            )}
                        </div>
                    </>
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