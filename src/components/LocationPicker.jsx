import { useState, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function DraggableMarker({ position, setPosition }) {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current;
                if (marker != null) {
                    setPosition(marker.getLatLng());
                }
            },
        }),
        [setPosition],
    );

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

function MapClickEvents({ setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });
    return null;
}

export default function LocationPicker({ position, setPosition }) {
    // Default center: Quito
    const center = [-0.1807, -78.4678];

    return (
        <div className="location-picker-container">
            <MapContainer center={center} zoom={13} style={{ height: '300px', width: '100%', borderRadius: '12px', zIndex: 0 }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker position={position || center} setPosition={setPosition} />
                <MapClickEvents setPosition={setPosition} />
            </MapContainer>
            <div className="map-instructions">
                <small>📍 Arrastra el marcador o haz clic en el mapa para ajustar tu ubicación de entrega.</small>
            </div>

            <style>{`
        .location-picker-container {
          margin: 1rem 0;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .map-instructions {
          padding: 0.5rem;
          background: #f8fafc;
          text-align: center;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
      `}</style>
        </div>
    );
}
