import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import HotspotPopup from '@/components/HotspotPopup';

// Dibaca dari CSS custom property (--color-risk-*, --color-forest-dark) yang
// sudah didefinisikan di app.css — bukan ditulis ulang di sini. Ini konteks
// Leaflet (attribute SVG/canvas & <img> divIcon), yang TIDAK bisa resolve
// var(--x) langsung seperti CSS biasa, jadi nilainya perlu di-resolve sekali
// ke string hex/rgb lewat getComputedStyle, lalu dipakai sebagai string biasa.
function cssVar(name, fallback) {
    if (typeof window === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
}

const RISK_COLOR = {
    rendah: cssVar('--color-risk-rendah', '#40916C'),
    sedang: cssVar('--color-risk-sedang', '#FFD60A'),
    tinggi: cssVar('--color-risk-tinggi', '#E85D04'),
    sangat_tinggi: cssVar('--color-risk-sangat-tinggi', '#D00000'),
    na: cssVar('--color-risk-na', '#ADB5BD'),
};

const FOREST_DARK_COLOR = cssVar('--color-forest-dark', '#1B4332');

// Titik tengah kasar wilayah Indonesia (kira-kira di antara Kalimantan Tengah
// dan Sulawesi) — dipakai sebagai view AWAL peta (mode nasional, zoom 5)
// sebelum FlyToLocation (di bawah) membawa peta terbang ke titik target
// (RegionDetail / AreaCheck).
const INDONESIA_CENTER = [-2.5, 118];

// Level zoom saat sebuah titik hotspot diklik di peta — dibuat cukup dekat
// (14) supaya user langsung dapat konteks area sekitar titik, lebih dekat
// dari zoom target RegionDetail/AreaCheck (11/13) karena di sini fokusnya
// satu titik spesifik, bukan satu wilayah/radius pengecekan.
const HOTSPOT_CLICK_ZOOM = 14;

// Kategori yang dapat ikon: rendah -> pohon, selain itu (kuning s/d merah) -> api.
// 'na' (abu-abu, tidak ada data/klasifikasi) sengaja TIDAK dipaksa jadi salah
// satu dari keduanya — tetap pakai titik polos (CircleMarker) di bawah, supaya
// ikon api/pohon murni menandakan "ada klasifikasi risiko", bukan dipakai
// serampangan untuk kategori yang sebenarnya tidak diketahui.
const ICON_SHAPE = {
    rendah: 'tree',
    sedang: 'flame',
    tinggi: 'flame',
    sangat_tinggi: 'flame',
};

// Path SVG persis dari lucide-static (paket ikon yang sama dipakai lucide-react
// di komponen lain), supaya gaya ikonnya konsisten di seluruh aplikasi.
const FLAME_PATH =
    'M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4';
const TREE_PATHS = [
    'm17 14 3 3.3a1 1 0 0 1-.7 1.7H4.7a1 1 0 0 1-.7-1.7L7 14h-.3a1 1 0 0 1-.7-1.7L9 9h-.2A1 1 0 0 1 8 7.3L12 3l4 4.3a1 1 0 0 1-.8 1.7H15l3 3.3a1 1 0 0 1-.7 1.7H17Z',
    'M12 22v-3',
];

function buildHotspotIcon(category) {
    const color = RISK_COLOR[category] ?? RISK_COLOR.na;
    const shape = ICON_SHAPE[category];
    const inner =
        shape === 'tree'
            ? TREE_PATHS.map((d) => `<path d="${d}" />`).join('')
            : `<path d="${FLAME_PATH}" />`;

    return L.divIcon({
        className: '', // reset default styling kotak putih bawaan Leaflet untuk divIcon
        html: `
            <div style="
                width: 26px; height: 26px; border-radius: 9999px;
                background: #fff; border: 2px solid ${color};
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 1px 4px rgba(0,0,0,0.25);
            ">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
                     fill="none" stroke="${color}" stroke-width="2.4"
                     stroke-linecap="round" stroke-linejoin="round">
                    ${inner}
                </svg>
            </div>
        `,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
        popupAnchor: [0, -13],
    });
}

// Dibuat sekali di module scope (bukan tiap render) — cuma ada 4 kombinasi
// warna/bentuk yang mungkin, jadi tidak perlu bikin ulang L.divIcon tiap kali
// daftar hotspot di-render.
const HOTSPOT_ICONS = {
    rendah: buildHotspotIcon('rendah'),
    sedang: buildHotspotIcon('sedang'),
    tinggi: buildHotspotIcon('tinggi'),
    sangat_tinggi: buildHotspotIcon('sangat_tinggi'),
};


// Pin "lokasi kamu" — bentuk teardrop bertema forest-dark (bukan marker biru
// default Leaflet), supaya tetap satu bahasa visual dengan ikon hotspot di
// atas (lingkaran putih + stroke berwarna), alih-alih memasukkan warna asing
// ke tengah peta yang seluruhnya sudah dipetakan ke palet EMBER.
const selectedIcon = L.divIcon({
    className: '',
    html: `
        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42"
             style="filter: drop-shadow(0 1px 3px rgba(0,0,0,0.35));">
            <path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0Z"
                  fill="${FOREST_DARK_COLOR}" />
            <circle cx="15" cy="15" r="5.5" fill="#fff" />
        </svg>
    `,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -38],
});

function ClickHandler({ onMapClick }) {
    useMapEvents({
        click(e) {
            onMapClick?.(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

// MapContainer hanya membaca prop `center`/`zoom` sekali saat mount — perubahan
// selanjutnya tidak otomatis menggerakkan peta. Komponen ini hidup di dalam
// MapContainer (pakai useMap) dan secara eksplisit fly ke lokasi target setiap
// kali koordinatnya berubah — dipicu klik peta / geolokasi / resolve link Gmaps
// di AreaCheck, TAPI juga jalan saat pertama kali mount (efek dependency array
// tetap terpicu di render pertama), sehingga RegionDetail yang datang dari
// full page-load (Inertia) tetap dapat animasi "zoom masuk" dari peta
// nasional ke titik wilayah yang dipilih di list prioritas Dashboard.
function FlyToLocation({ position, zoom = 13 }) {
    const map = useMap();

    useEffect(() => {
        if (position) {
            map.flyTo(position, zoom, { duration: 1.4, easeLinearity: 0.25 });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [position?.[0], position?.[1]]);

    return null;
}

export default function MapView({
    hotspots = [],
    mode = 'nasional',
    zoomTo = null,
    selectable = false,
    onMapClick = null,
    selectedLocation = null,
    checkRadiusKm = null,
}) {
    // Target akhir: RegionDetail pakai `zoomTo`, AreaCheck pakai `selectedLocation`.
    // Peta SELALU mulai dari view nasional (bukan langsung di titik akhir),
    // supaya animasi FlyToLocation di bawah punya jarak untuk "terbang masuk" —
    // baik dipicu perubahan state (AreaCheck) maupun saat pertama render
    // (RegionDetail, full page-load baru dari Inertia).
    const target = zoomTo ?? selectedLocation;
    const targetZoom = zoomTo ? 11 : 13;

    // Dipegang lewat ref (bukan state) karena instance L.Map ini cuma dipakai
    // secara imperatif (map.flyTo saat klik marker) — tidak pernah dibaca
    // untuk keperluan render, jadi tidak perlu (dan tidak boleh, supaya tidak
    // trigger re-render sia-sia) taruh di state.
    const mapRef = useRef(null);

    return (
        <div className="h-full w-full overflow-hidden rounded-xl">
            <MapContainer
                ref={mapRef}
                center={INDONESIA_CENTER}
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', cursor: selectable ? 'crosshair' : '' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectable && <ClickHandler onMapClick={onMapClick} />}

                {target && <FlyToLocation position={target} zoom={targetZoom} />}

                {hotspots.map((hotspot) => {
                    const position = [parseFloat(hotspot.latitude), parseFloat(hotspot.longitude)];
                    const icon = HOTSPOT_ICONS[hotspot.gfw_risk_category];

                    // Klik marker/titik hotspot -> selain Leaflet otomatis buka
                    // Popup-nya, kita juga secara eksplisit flyTo ke koordinat
                    // titik itu supaya user langsung "masuk" ke lokasinya,
                    // bukan cuma lihat popup dari zoom level yang sedang aktif.
                    const eventHandlers = {
                        click: () => {
                            mapRef.current?.flyTo(position, HOTSPOT_CLICK_ZOOM, {
                                duration: 1.2,
                                easeLinearity: 0.25,
                            });
                        },
                    };

                    // Ada ikon (kategori dikenali) -> pakai Marker api/pohon.
                    // Tidak ada (na / kategori tak dikenal) -> titik polos abu-abu, apa adanya.
                    return icon ? (
                        <Marker key={hotspot.id} position={position} icon={icon} eventHandlers={eventHandlers}>
                            <HotspotPopup hotspot={hotspot} />
                        </Marker>
                    ) : (
                        <CircleMarker
                            key={hotspot.id}
                            center={position}
                            radius={6}
                            pathOptions={{
                                color: RISK_COLOR.na,
                                fillColor: RISK_COLOR.na,
                                fillOpacity: 0.7,
                                weight: 1.5,
                            }}
                            eventHandlers={eventHandlers}
                        >
                            <HotspotPopup hotspot={hotspot} />
                        </CircleMarker>
                    );
                })}

                {selectedLocation && (
                    <>
                        <Marker position={selectedLocation} icon={selectedIcon} />
                        {checkRadiusKm && (
                            <Circle
                                center={selectedLocation}
                                radius={checkRadiusKm * 1000}
                                pathOptions={{ color: cssVar('--color-forest', '#2D6A4F'), fillOpacity: 0.05, weight: 1 }}
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
}