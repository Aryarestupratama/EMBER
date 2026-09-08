import SourceCredit from '@/components/SourceCredit';

/**
 * Footer EMBER — atribusi sumber data (Design.md §8).
 *
 * Props:
 * - dark : varian gelap di atas bg-forest-dark (dipakai di Landing).
 *          Halaman lain memakai varian terang di atas bg-canvas.
 */
export default function Footer({ dark = false }) {
    return (
        <footer className={dark ? 'bg-forest-dark px-6 py-6' : 'border-t border-black/5 px-6 py-6'}>
            <div className="mx-auto max-w-7xl">
                <SourceCredit className={dark ? 'text-white/50' : undefined} />
            </div>
        </footer>
    );
}