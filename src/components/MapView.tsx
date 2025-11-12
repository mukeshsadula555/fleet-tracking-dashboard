import "leaflet/dist/leaflet.css"; // ✅ must come first
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { FC } from "react";

type Pos = {
  lat: number;
  lng: number;
  label: string;
  info?: string;
};

// ✅ Default marker fix (so Leaflet icons load properly in Vite)
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const MapView: FC<{ positions: Pos[] }> = ({ positions }) => {
  const center: [number, number] =
    positions.length > 0 ? [positions[0].lat, positions[0].lng] : [39.5, -98.35];

  return (
    <MapContainer
      center={center}
      zoom={4}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {positions.map((p) => (
        <Marker key={p.label} position={[p.lat, p.lng]} icon={defaultIcon}>
          <Popup>
            <strong>{p.label}</strong>
            <div>{p.info}</div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapView;
