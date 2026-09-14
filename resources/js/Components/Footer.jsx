import SourceCredit from '@/components/SourceCredit';

export default function Footer({ dark = false }) {
    return (
        <footer className={dark ? 'bg-forest-dark px-6 py-6' : 'border-t border-black/5 px-6 py-6'}>
            <div className="mx-auto max-w-7xl">
                <SourceCredit className={dark ? 'text-white/50' : undefined} />
            </div>
        </footer>
    );
}