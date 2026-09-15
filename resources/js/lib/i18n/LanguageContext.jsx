import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from './translations';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'ember-language';
const LOCALE_MAP = { id: 'id-ID', en: 'en-US' };

function getInitialLanguage() {
    if (typeof window === 'undefined') return 'id';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' || stored === 'id' ? stored : 'id';
}

function resolvePath(obj, path) {
    return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function interpolate(str, vars) {
    if (!vars) return str;
    return str.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] !== undefined ? vars[key] : `{{${key}}}`));
}

export function LanguageProvider({ children }) {
    const [language, setLanguageState] = useState(getInitialLanguage);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, language);
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = useCallback((lang) => {
        setLanguageState(lang === 'en' ? 'en' : 'id');
    }, []);

    const toggleLanguage = useCallback(() => {
        setLanguageState((prev) => (prev === 'id' ? 'en' : 'id'));
    }, []);

    // t('nav.dashboard') atau t('regionRanking.maxHint', { max: 3 })
    // Fallback ke Bahasa Indonesia jika key tidak ditemukan di bahasa aktif,
    // supaya penambahan key baru yang belum sempat diterjemahkan tidak
    // membuat UI kosong.
    const t = useCallback(
        (key, vars) => {
            const value = resolvePath(translations[language], key) ?? resolvePath(translations.id, key);
            if (value === undefined) {
                console.warn(`[i18n] Missing translation key: ${key}`);
                return key;
            }
            // Beberapa key menyimpan array (mis. areaCheck.loadingStages)  hanya
            // string yang diinterpolasi, array/objek dikembalikan apa adanya.
            if (typeof value !== 'string') return value;
            return interpolate(value, vars);
        },
        [language],
    );

    const value = useMemo(
        () => ({ language, setLanguage, toggleLanguage, t, localeCode: LOCALE_MAP[language] }),
        [language, setLanguage, toggleLanguage, t],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage harus dipakai di dalam <LanguageProvider>');
    }
    return ctx;
}