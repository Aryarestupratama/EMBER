import { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from '@/components/ui/navigation-menu';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Navbar({ active = null, variant = 'solid' }) {
    const { t } = useLanguage();
    const isTransparentVariant = variant === 'transparent';
    const [scrolled, setScrolled] = useState(false);
    const [hovered, setHovered] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const NAV_ITEMS = [
        { route: 'dashboard', label: t('nav.dashboard') },
        { route: 'area-check', label: t('nav.areaCheck') },
        { route: 'about', label: t('nav.about') },
    ];

    useEffect(() => {
        setMobileOpen(false);
    }, [active]);

    useEffect(() => {
        if (!isTransparentVariant) return;
        const onScroll = () => setScrolled(window.scrollY > 8);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [isTransparentVariant]);

    const showSolidStyle = !isTransparentVariant || scrolled || mobileOpen;

    const headerBgClass = showSolidStyle
        ? 'border-b border-black/5 bg-white/80 backdrop-blur-md'
        : 'border-b border-transparent bg-transparent';

    const logoClass = showSolidStyle ? 'text-forest-dark' : 'text-white';
    const linkTextClass = showSolidStyle
        ? 'text-ink/70 hover:text-forest-dark'
        : 'text-white/85 hover:text-fresh-light';
    const pillClass = showSolidStyle ? 'bg-black/5' : 'bg-white/15 backdrop-blur-sm';
    const toggleTone = showSolidStyle ? 'solid' : 'transparent';

    return (
        <header
            style={{ zIndex: 9999 }}
            className={`fixed inset-x-0 top-0 transition-[background-color,backdrop-filter,border-color] duration-300 ${headerBgClass}`}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link href={route('home')} className="flex shrink-0 items-center gap-2">
                    <img src="/assets/logo/ember-logo.png" alt="" aria-hidden="true" className="h-8 w-auto" />
                    <span
                        className={`font-heading text-xl font-bold tracking-tight transition-colors duration-300 ${logoClass}`}
                    >
                        EMBER
                    </span>
                </Link>

                <NavigationMenu className="hidden md:block">
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

                <div className="flex shrink-0 items-center gap-2">
                    <LanguageToggle tone={toggleTone} className="hidden sm:inline-flex" />

                    <button
                        type="button"
                        onClick={() => setMobileOpen((v) => !v)}
                        aria-label={mobileOpen ? t('nav.closeMenu') : t('nav.openMenu')}
                        aria-expanded={mobileOpen}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 md:hidden ${
                            showSolidStyle ? 'text-ink/70 hover:bg-black/5' : 'text-white hover:bg-white/15'
                        }`}
                    >
                        {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="overflow-hidden border-t border-black/5 bg-white md:hidden"
                    >
                        <div className="flex flex-col px-6 py-3">
                            {NAV_ITEMS.map((item) => (
                                <Link
                                    key={item.route}
                                    href={route(item.route)}
                                    onClick={() => setMobileOpen(false)}
                                    className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                        active === item.route
                                            ? 'bg-forest-dark/10 text-forest-dark'
                                            : 'text-ink/70 hover:bg-canvas hover:text-forest-dark'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            <div className="mt-2 border-t border-black/5 pt-3">
                                <LanguageToggle tone="solid" />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}