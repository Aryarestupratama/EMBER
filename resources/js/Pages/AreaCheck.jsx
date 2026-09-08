import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import MapView from '@/components/MapView';
import SummaryCard from '@/components/SummaryCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, LocateFixed, Loader2 } from 'lucide-react';

export default function AreaCheck() {
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [result, setResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState(null);

    const { post, processing } = useForm();

    const submitCheck = async (lat, lon) => {
        setSelectedLocation([lat, lon]);
        setResult(null);
        setError(null);
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

    return (
        <>
            <Head title="Cek Daerah Kamu — EMBER" />

            <div className="min-h-screen bg-canvas">
                <header className="sticky top-0 z-10 border-b border-black/5 bg-white/95 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                        <Link href={route('home')} className="flex items-baseline gap-2">
                            <span className="font-heading text-xl font-bold tracking-tight text-forest-dark">
                                EMBER
                            </span>
                        </Link>
                        <nav className="flex items-center gap-6 text-sm font-medium text-ink/70">
                            <Link href={route('dashboard')} className="transition-colors hover:text-forest-dark">
                                Dashboard
                            </Link>
                            <Link href={route('area-check')} className="text-forest-dark">
                                Cek Daerah Kamu
                            </Link>
                            <Link href={route('about')} className="transition-colors hover:text-forest-dark">
                                Metodologi
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 py-8">
                    <div className="mb-6">
                        <h1 className="font-heading text-2xl font-bold text-ink">Cek Daerah Kamu</h1>
                        <p className="mt-1 text-sm text-ink/60">
                            Klik lokasi di peta atau gunakan lokasi kamu saat ini untuk melihat status risiko karhutla,
                            kualitas udara, dan hotspot terdekat.
                        </p>
                    </div>

                    <div className="mb-4 flex items-center gap-3">
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
                        <p className="flex items-center gap-1.5 text-sm text-ink/50">
                            <MapPin className="h-4 w-4" />
                            atau klik langsung di peta
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                        <div className="h-[560px] overflow-hidden rounded-xl border border-black/5 bg-white shadow-sm lg:col-span-2">
                            <MapView
                                selectable
                                onMapClick={handleMapClick}
                                selectedLocation={selectedLocation}
                                checkRadiusKm={25}
                            />
                        </div>

                        <div>
                            {checking && (
                                <Card className="border-black/5 shadow-sm">
                                    <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-forest" />
                                        <p className="text-sm text-ink/60">Menganalisis lokasi...</p>
                                    </CardContent>
                                </Card>
                            )}

                            {!checking && error && (
                                <Card className="border-risk-tinggi/20 shadow-sm">
                                    <CardContent className="py-8 text-center">
                                        <p className="text-sm text-risk-tinggi">{error}</p>
                                    </CardContent>
                                </Card>
                            )}

                            {!checking && !error && result && <SummaryCard result={result} />}

                            {!checking && !error && !result && (
                                <Card className="border-black/5 border-dashed shadow-none">
                                    <CardContent className="py-12 text-center">
                                        <MapPin className="mx-auto mb-3 h-8 w-8 text-ink/20" />
                                        <p className="text-sm text-ink/50">
                                            Pilih lokasi untuk melihat ringkasan kondisi wilayah.
                                        </p>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </>
    );
}