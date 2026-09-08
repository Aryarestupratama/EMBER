import { MapContainer, TileLayer, CircleMarker, Circle, Marker, Popup, useMapEvents } from 'react-leaflet';
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

export default function MapView({
    hotspots = [],
    mode = 'nasional',
    zoomTo = null,
    selectable = false,
    onMapClick = null,
    selectedLocation = null,
    checkRadiusKm = null,
}) {
    const center = zoomTo ?? selectedLocation ?? INDONESIA_CENTER;
    const zoom = mode === 'zoom-lokasi' || selectedLocation ? 10 : 5;

    return (
        <div className="h-full w-full overflow-hidden rounded-xl">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%', cursor: selectable ? 'crosshair' : '' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {selectable && <ClickHandler onMapClick={onMapClick} />}

                {hotspots.map((hotspot) => (
                    <CircleMarker
                        key={hotspot.id}
                        center={[parseFloat(hotspot.latitude), parseFloat(hotspot.longitude)]}
                        radius={6}
                        pathOptions={{
                            color: RISK_COLOR[hotspot.gfw_risk_category] ?? RISK_COLOR.na,
                            fillColor: RISK_COLOR[hotspot.gfw_risk_category] ?? RISK_COLOR.na,
                            fillOpacity: 0.7,
                            weight: 1.5,
                        }}
                    >
                        <Popup>
                            <div className="space-y-1.5 text-sm">
                                <RiskBadge category={hotspot.gfw_risk_category} />
                                <p className="text-ink/70">
                                    Confidence: {hotspot.confidence}% · FRP: {hotspot.frp}
                                </p>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

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