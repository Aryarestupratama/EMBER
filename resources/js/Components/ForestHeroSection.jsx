import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// File ada di public/assets/hero/, jadi diakses via path URL langsung
// (bukan di-bundle Vite), supaya bisa diganti tanpa rebuild.
const forestNormal = '/assets/hero/forest-normal.jpg';
const forestFire = '/assets/hero/forest-fire.jpg';

/**
 * Wrapper hero dengan pola "sticky-pinned": konten tetap nempel di layar
 * selama user scroll sepanjang `pinHeightVh`, sementara background di
 * belakangnya bertransisi dari forest normal -> forest fire mengikuti
 * progress scroll. Setelah rentang itu habis, section lepas dan halaman
 * lanjut scroll normal ke section berikutnya.
 *
 * Cara pakai (Landing.jsx), GANTI seluruh <section> hero lama dengan:
 *
 *   <ForestHeroSection>
 *       <div className="max-w-xl"> ...konten teks & tombol... </div>
 *   </ForestHeroSection>
 */
export default function ForestHeroSection({ children, pinHeightVh = 200 }) {
    const containerRef = useRef(null);

    // progress 0 -> 1 dihitung sepanjang TINGGI WRAPPER LUAR (yang sengaja
    // dibuat lebih tinggi dari 1 viewport), bukan sepanjang tinggi konten
    // hero itu sendiri. Ini yang menjamin jarak scroll-nya cukup panjang.
    //
    // PENTING: pinHeightVh sengaja dipas-kan (default 200 = 100vh layar +
    // 100vh jarak scroll untuk transisi) supaya progress mencapai 1 TEPAT
    // saat section lepas dari sticky. Kalau pinHeightVh dibuat lebih besar
    // dari itu, akan ada jarak scroll "sisa" setelah progress=1 di mana
    // section masih di layar sambil lepas sticky — pada jarak sisa itu,
    // reflow (misalnya gambar baru selesai dimuat) bisa membuat Framer
    // Motion mengukur ulang & progress terlihat "mundur".
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    // insetTop 100% -> 0%: di awal, gambar fire sepenuhnya "ketutup" dari
    // atas (tidak terlihat). Seiring scroll, insetTop mengecil, sehingga
    // area yang terlihat merambat dari BAWAH ke ATAS — efek "fire memakan
    // forest dari bawah". clamp:true memastikan begitu progress lewat 1,
    // nilainya tetap 0 (gambar fire full terlihat, tidak pernah balik lagi
    // ke forest walau section sudah lepas dari sticky dan discroll lewat).
    const fireInsetTop = useTransform(scrollYProgress, [0.1, 0.9], [100, 0], {
        clamp: true,
    });
    const fireClipPath = useTransform(fireInsetTop, (v) => `inset(${v}% 0% 0% 0%)`);

    return (
        <div ref={containerRef} className="relative" style={{ height: `${pinHeightVh}vh` }}>
            <div className="sticky top-0 h-screen overflow-hidden border-b border-black/5">
                {/* Layer dasar: hutan normal, selalu terlihat */}
                <img
                    src={forestNormal}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Layer atas: hutan terbakar, "memakan" layer forest dari bawah ke atas mengikuti scroll */}
                <motion.img
                    src={forestFire}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                    style={{ clipPath: fireClipPath }}
                />

                {/* Overlay supaya teks di atas gambar tetap kontras & kebaca,
                    di kedua kondisi (hijau maupun oranye-terang). Konten hero
                    sekarang rata tengah, jadi gelapnya dipusatkan (radial)
                    tepat di area teks, bukan gradient kiri-ke-kanan lagi. */}
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_60%_at_50%_50%,rgba(0,0,0,0.55),rgba(0,0,0,0)_70%)]" />

                {/* Konten teks & tombol, tetap nempel selagi background berubah */}
                <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-6">
                    {children}
                </div>
            </div>
        </div>
    );
}