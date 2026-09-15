import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function SourceCredit({ className = '' }) {
    const { t } = useLanguage();

    return (
        <p className={`text-xs text-ink/50 ${className}`}>
            {t('footer.credit')}
        </p>
    );
}