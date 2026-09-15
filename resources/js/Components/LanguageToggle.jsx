import { useLanguage } from '@/lib/i18n/LanguageContext';

/**
 * Tombol toggle ID/EN. `tone` menyesuaikan dengan Navbar yang punya varian
 * transparan (di atas hero) dan solid (setelah scroll)  lihat Design.md §6
 * untuk perilaku Navbar.
 */
export default function LanguageToggle({ tone = 'solid', className = '' }) {
    const { language, toggleLanguage, t } = useLanguage();
    const isTransparentTone = tone === 'transparent';

    const baseClass = isTransparentTone
        ? 'border-white/30 bg-white/15 text-white/90 hover:bg-white/25 backdrop-blur-sm'
        : 'border-black/10 bg-black/5 text-ink/70 hover:bg-black/10 hover:text-ink';

    const ariaLabel = language === 'id' ? t('languageToggle.switchToEnglish') : t('languageToggle.switchToIndonesian');

    return (
        <button
            type="button"
            onClick={toggleLanguage}
            aria-label={ariaLabel}
            title={ariaLabel}
            className={`inline-flex h-8 items-center gap-1 rounded-full border px-1 text-xs font-semibold transition-colors duration-300 ${baseClass} ${className}`}
        >
            <span
                className={`rounded-full px-2 py-1 transition-colors ${
                    language === 'id' ? (isTransparentTone ? 'bg-white/25' : 'bg-white text-forest-dark shadow-sm') : ''
                }`}
            >
                ID
            </span>
            <span
                className={`rounded-full px-2 py-1 transition-colors ${
                    language === 'en' ? (isTransparentTone ? 'bg-white/25' : 'bg-white text-forest-dark shadow-sm') : ''
                }`}
            >
                EN
            </span>
        </button>
    );
}