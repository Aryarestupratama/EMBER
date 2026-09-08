import { Head } from '@inertiajs/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Layout bersama untuk seluruh halaman EMBER.
 * Merangkai <Navbar> (transparan → solid saat scroll) dan <Footer> opsional,
 * supaya keduanya tidak diduplikasi di tiap Page component.
 *
 * Props:
 * - title        : judul halaman, dipakai untuk <Head title="{title} — EMBER" />
 * - active       : 'dashboard' | 'area-check' | 'about' | null — menandai nav item aktif
 * - showCtaButton: tampilkan tombol "Buka Dashboard" di navbar (khusus Landing)
 * - transparentNav: true → Navbar pakai variant="transparent" (absolute, selalu
 *                  transparan, teks putih; tidak makan ruang layout sehingga hero
 *                  di baliknya bisa mulai persis dari y=0 tanpa celah putih).
 *                  Default false → Navbar pakai variant="solid" (sticky, scroll-aware,
 *                  seperti dipakai di Dashboard/halaman lain).
 * - showFooter   : tampilkan <Footer>
 * - footerDark   : varian footer gelap (dipakai di Landing, di atas bg-forest-dark)
 * - mainClassName: override className <main>, default max-w-7xl. Kosongkan ('')
 *                  kalau halaman tidak butuh <main> wrapper (mis. Landing yang full <section>).
 */
export default function AppLayout({
    title,
    active = null,
    showCtaButton = false,
    transparentNav = false,
    showFooter = false,
    footerDark = false,
    mainClassName = 'mx-auto max-w-7xl px-6 py-8',
    children,
}) {
    // Navbar sekarang selalu `fixed`, jadi tidak pernah reserve ruang sendiri
    // di layout. Untuk halaman non-transparent (variant solid), kita perlu
    // kompensasi manual via padding-top setinggi navbar (kira-kira 72px),
    // supaya konten <main> tidak ketutupan. Landing (transparentNav) sengaja
    // TIDAK diberi padding ini, karena hero-nya memang didesain mulai dari
    // y=0, di belakang navbar yang transparan.
    const resolvedMainClassName =
        mainClassName && !transparentNav ? `pt-[72px] ${mainClassName}` : mainClassName;

    return (
        <>
            <Head title={`${title} — EMBER`} />

            <div className="min-h-screen bg-canvas">
                <Navbar
                    active={active}
                    showCtaButton={showCtaButton}
                    variant={transparentNav ? 'transparent' : 'solid'}
                />

                {resolvedMainClassName ? (
                    <main className={resolvedMainClassName}>{children}</main>
                ) : (
                    children
                )}

                {showFooter && <Footer dark={footerDark} />}
            </div>
        </>
    );
}