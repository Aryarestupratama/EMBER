import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import MapView from '@/components/MapView';
import SummaryCard from '@/components/SummaryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, LocateFixed, Loader2, Link2, TreePine, Flame } from 'lucide-react';

// Sama persis pola di Dashboard.jsx/RegionDetail.jsx — animate langsung
// jalan pas halaman dimuat (bukan whileInView), karena ini halaman kerja.
const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: {},
    visible: { transition: { staggerChildren, delayChildren } },
});

// Tahapan pesan loading — dicocokkan dengan urutan nyata proses backend
// (AreaCheckController::check → GfwService → IqairService), bukan teks
// generik, supaya user paham ada beberapa sumber data yang sedang diproses.
const LOADING_STAGES = [
    'Mengecek titik panas terdekat...',
    'Menghitung risiko deforestasi (GFW)...',
    'Mengambil data kualitas udara...',
    'Menyusun ringkasan wilayah...',
];

function MorphingLoadingIcon() {
    const [stage, setStage] = useState(0);
    const isTree = stage % 2 === 0;

    useEffect(() => {
        const interval = setInterval(() => {
            setStage((s) => s + 1);
        }, 900);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative flex h-16 w-16 items-center justify-center">
            {/* Ring berdenyut di belakang ikon — warnanya ikut berubah
                senada dengan ikon aktif (hijau untuk pohon, oranye api). */}
            <motion.span
                key={`ring-${isTree}`}
                className={`absolute inset-0 rounded-full ${
                    isTree ? 'bg-forest/10' : 'bg-risk-tinggi/10'
                }`}
                initial={{ scale: 0.6, opacity: 0.6 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <AnimatePresence mode="wait">
                <motion.div
                    key={stage}
                    initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="relative"
                >
                    {isTree ? (
                        <TreePine className="h-8 w-8 text-forest" strokeWidth={2.2} />
                    ) : (
                        <Flame className="h-8 w-8 text-risk-tinggi" strokeWidth={2.2} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function LoadingCard() {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((i) => (i + 1) % LOADING_STAGES.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="border-black/5 shadow-sm">
            <CardContent className="flex flex-col items-center gap-4 py-14 text-center">
                <MorphingLoadingIcon />
                <AnimatePresence mode="wait">
                    <motion.p
                        key={messageIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="text-sm text-ink/60"
                    >
                        {LOADING_STAGES[messageIndex]}
                    </motion.p>
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}

export default function AreaCheck() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState(null);

    const [mapsLink, setMapsLink] = useState('');
    const [resolvingLink, setResolvingLink] = useState(false);
    const [linkError, setLinkError] = useState(null);

    const submitCheck = async (lat, lon) => {
        setSelectedLocation([lat, lon]);
        setResult(null);
        setError(null);
        setLinkError(null);
        setChecking(true);

        try {
            const response = await window.axios.post('/area-check', { lat, lon });
            setResult(response.data);
        } catch (err) {
            setError(
                err.response?.data?.message ??
                    'Lokasi di luar cakupan wilayah Indonesia atau terjadi kesalahan. Coba lokasi lain.'
            );
        } finally {
            setChecking(false);
        }
    };

    const handleMapClick = (lat, lon) => {
        submitCheck(lat, lon);
    };

    const handleGeolocate = () => {
        if (!navigator.geolocation) {
            setError('Browser kamu tidak mendukung geolokasi.');
            return;
        }

        setChecking(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                submitCheck(position.coords.latitude, position.coords.longitude);
            },
            () => {
                setChecking(false);
                setError('Tidak bisa mengambil lokasi kamu. Coba klik langsung di peta.');
            }
        );
    };

    const handleResolveMapsLink = async (e) => {
        e.preventDefault();
        if (!mapsLink.trim()) return;

        setLinkError(null);
        setResolvingLink(true);

        try {
            const response = await window.axios.post('/area-check/resolve-maps-link', {
                url: mapsLink.trim(),
            });
            const { lat, lon } = response.data;
            setMapsLink('');
            await submitCheck(lat, lon);
        } catch (err) {
            setLinkError(
                err.response?.data?.message ?? 'Gagal memproses link. Coba tempel ulang.'
            );
        } finally {
            setResolvingLink(false);
        }
    };

    return (
        <AppLayout title="Cek Daerah Kamu" active="area-check">
            <motion.div
                variants={staggerContainer(0.12)}
                initial="hidden"
                animate="visible"
                className="relative"
            >
                {/* Aksen dekoratif halus, konsisten dengan Dashboard.jsx/RegionDetail.jsx */}
                <div className="pointer-events-none absolute -top-10 right-0 -z-10 h-72 w-72 rounded-full bg-forest-dark/[0.04] blur-3xl" />
                <div className="pointer-events-none absolute top-72 -left-16 -z-10 h-64 w-64 rounded-full bg-fresh/[0.05] blur-3xl" />

                <motion.div variants={fadeUp} className="mb-6">
                    <h1 className="font-heading text-2xl font-bold text-ink">Cek Daerah Kamu</h1>
                    <p className="mt-1 text-sm text-ink/60">
                        Klik lokasi di peta, gunakan lokasi kamu saat ini, atau tempel link Google
                        Maps untuk melihat status risiko karhutla, kualitas udara, dan hotspot
                        terdekat.
                    </p>
                </motion.div>

                <motion.div
                    variants={fadeUp}
                    className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={handleGeolocate}
                            disabled={checking}
                            className="gap-2 bg-forest hover:bg-forest-dark"
                        >
                            {checking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <LocateFixed className="h-4 w-4" />
                            )}
                            Gunakan Lokasi Saya
                        </Button>
                        <p className="hidden items-center gap-1.5 text-sm text-ink/50 sm:flex">
                            <MapPin className="h-4 w-4" />
                            atau klik langsung di peta
                        </p>
                    </div>

                    <form onSubmit={handleResolveMapsLink} className="flex w-full gap-2 sm:w-auto">
                        <div className="relative flex-1 sm:w-72">
                            <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
                            <input
                                type="text"
                                value={mapsLink}
                                onChange={(e) => setMapsLink(e.target.value)}
                                placeholder="Tempel link Google Maps..."
                                disabled={resolvingLink || checking}
                                className="w-full rounded-md border border-black/10 bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-ink/30 focus:border-forest focus:outline-none focus:ring-1 focus:ring-forest disabled:opacity-60"
                            />
                        </div>
                        <Button
                            type="submit"
                            variant="outline"
                            disabled={resolvingLink || checking || !mapsLink.trim()}
                            className="shrink-0 gap-2"
                        >
                            {resolvingLink ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Cek'
                            )}
                        </Button>
                    </form>
                </motion.div>

                <AnimatePresence>
                    {linkError && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            className="mb-4 text-sm text-risk-tinggi"
                        >
                            {linkError}
                        </motion.p>
                    )}
                </AnimatePresence>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <motion.div
                        variants={fadeUp}
                        className="h-[560px] overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm lg:col-span-2"
                    >
                        <MapView
                            selectable
                            onMapClick={handleMapClick}
                            selectedLocation={selectedLocation}
                            checkRadiusKm={25}
                        />
                    </motion.div>

                    <motion.div variants={fadeUp}>
                        <AnimatePresence mode="wait">
                            {checking && (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <LoadingCard />
                                </motion.div>
                            )}

                            {!checking && error && (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Card className="border-risk-tinggi/20 shadow-sm">
                                        <CardContent className="py-8 text-center">
                                            <p className="text-sm text-risk-tinggi">{error}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {!checking && !error && result && (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                >
                                    <SummaryCard result={result} />
                                </motion.div>
                            )}

                            {!checking && !error && !result && (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Card className="border-dashed border-black/5 shadow-none">
                                        <CardContent className="py-12 text-center">
                                            <MapPin className="mx-auto mb-3 h-8 w-8 text-ink/20" />
                                            <p className="text-sm text-ink/50">
                                                Pilih lokasi untuk melihat ringkasan kondisi
                                                wilayah.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>
        </AppLayout>
    );
}