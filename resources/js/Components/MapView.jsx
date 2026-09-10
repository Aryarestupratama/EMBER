import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import RiskBadge from '@/components/RiskBadge';

const RISK_COLOR = {
    rendah: '#40916C',
    sedang: '#FFD60A',
    tinggi: '#E85D04',
    sangat_tinggi: '#D00000',
    na: '#ADB5BD',
};

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

function HotspotPopup({ hotspot }) {
    return (
        <Popup>
            <div className="space-y-1.5 text-sm">
                <RiskBadge category={hotspot.gfw_risk_category} />
                <p className="text-ink/70">
                    Confidence: {hotspot.confidence}% · FRP: {hotspot.frp}
                </p>
            </div>
        </Popup>
    );
}

const INDONESIA_CENTER = [-2.5, 118];

const selectedIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
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

    return (
        <div className="h-full w-full overflow-hidden rounded-xl">
            <MapContainer
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

                    // Ada ikon (kategori dikenali) -> pakai Marker api/pohon.
                    // Tidak ada (na / kategori tak dikenal) -> titik polos abu-abu, apa adanya.
                    return icon ? (
                        <Marker key={hotspot.id} position={position} icon={icon}>
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
                                pathOptions={{ color: '#2D6A4F', fillOpacity: 0.05, weight: 1 }}
                            />
                        )}
                    </>
                )}
            </MapContainer>
        </div>
    );
}