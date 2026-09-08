import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
const NAV_ITEMS = [
    { route: 'dashboard', label: 'Dashboard' },
    { route: 'area-check', label: 'Cek Daerah Kamu' },
    { route: 'about', label: 'Metodologi' },
];

/**
 * Navbar EMBER — selalu `fixed` (bukan sticky) supaya TIDAK makan ruang di
 * layout sama sekali. Ini penting khusus di Landing: hero di baliknya bisa
 * mulai persis dari y=0 tanpa celah putih. Konsekuensinya, halaman lain
 * (variant="solid") perlu padding-top di <main> sebesar tinggi navbar —
 * ini sudah diatur otomatis lewat AppLayout, tidak perlu diubah manual.
 *
 * 2 varian:
 * - variant="solid" (default, halaman selain Landing): dari awal sudah
 *   background putih + teks gelap, tetap begitu terus (tidak ada hero
 *   gelap di baliknya untuk dijaga transparansinya).
 * - variant="transparent" (Landing): mulai transparan + teks putih di atas
 *   hero. Begitu discroll (scrollY > 8px), otomatis switch ke background
 *   putih blur + teks gelap — supaya tetap kebaca begitu ketemu section
 *   putih di bawah hero, bukan cuma pas di atas hero saja.
 *
 * Props:
 * - active  : 'dashboard' | 'area-check' | 'about' | null
 * - variant : 'solid' | 'transparent' (default 'solid')
 */
export default function Navbar({ active = null, variant = 'solid' }) {
    const isTransparentVariant = variant === 'transparent';
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState(null);

    useEffect(() => {
        if (!isTransparentVariant) return; // solid: warna sudah fix, tidak perlu listener
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isTransparentVariant]);

    // "showSolidStyle" = kapan navbar tampil sebagai bar putih blur + teks gelap.
    // solid variant: selalu true. transparent variant: cuma setelah discroll.
    const showSolidStyle = !isTransparentVariant || scrolled;

    const headerBgClass = showSolidStyle
        ? 'border-b border-black/5 bg-white/80 backdrop-blur-md'
        : 'border-b border-transparent bg-transparent';

    const logoClass = showSolidStyle ? 'text-forest-dark' : 'text-white';
    const linkTextClass = showSolidStyle
        ? 'text-ink/70 hover:text-forest-dark'
        : 'text-white/85 hover:text-fresh-light';
    const pillClass = showSolidStyle ? 'bg-black/5' : 'bg-white/15 backdrop-blur-sm';

    return (
        <header
            style={{ zIndex: 9999 }}
            className={`fixed inset-x-0 top-0 transition-[background-color,backdrop-filter,border-color] duration-300 ${headerBgClass}`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href={route('home')} className="flex items-center gap-2">
                    <img src="/assets/logo/ember-logo.png" alt="" aria-hidden="true" className="h-8 w-auto" />
                    <span
                        className={`font-heading text-xl font-bold tracking-tight transition-colors duration-300 ${logoClass}`}
                    >
                        EMBER
                    </span>
                </Link>

                <NavigationMenu>
                    <NavigationMenuList
                        className="relative flex items-center gap-1"
                        onMouseLeave={() => setHovered(null)}
                    >
                        {NAV_ITEMS.map((item) => (
                            <NavigationMenuItem key={item.route} className="relative">
                                <NavigationMenuLink
                                    href={route(item.route)}
                                    active={active === item.route}
                                    onMouseEnter={() => setHovered(item.route)}
                                    className={`relative z-10 inline-flex rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${linkTextClass}`}
                                >
                                    {item.label}
                                </NavigationMenuLink>

                                {/* Pill background: hanya 1 instance yang "hidup" berkat
                                    layoutId sama di semua item — Framer Motion otomatis
                                    animasikan posisi/ukurannya saat pindah item. */}
                                {hovered === item.route && (
                                    <motion.div
                                        layoutId={`nav-hover-pill-${variant}`}
                                        className={`absolute inset-0 rounded-full transition-colors duration-300 ${pillClass}`}
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </NavigationMenuItem>
                        ))}
                    </NavigationMenuList>
                </NavigationMenu>

                {/* spacer supaya logo & nav tetap center-balanced (menu Dashboard sudah ada di NAV_ITEMS) */}
                <div className="w-0 sm:w-[1px]" aria-hidden="true" />
            </div>
        </header>
    );
}