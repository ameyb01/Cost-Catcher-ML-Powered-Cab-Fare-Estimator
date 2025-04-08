// === Imports ===
import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css'; // Leaflet default styles
import L from 'leaflet'; // Leaflet core library for map rendering

// === Custom Marker Icon ===
// This icon is used for both pickup and dropoff markers
const customIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],   // Size of the marker
  iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
});

// === MapView Component ===
// Props:
// - from: { lat, lon } for pickup
// - to: { lat, lon } for dropoff
const MapView = ({ from, to }) => {
  // Convert location objects into coordinate arrays
  const fromCoords = [from.lat, from.lon];
  const toCoords = [to.lat, to.lon];

  return (
    <MapContainer
      center={fromCoords} // Map is centered on the pickup location
      zoom={12} // Initial zoom level
      scrollWheelZoom={false} // Disable scroll zoom
      className="leaflet-container" // Class for styling
    >
      {/* TileLayer renders the base map using OpenStreetMap */}
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Markers for pickup and dropoff locations */}
      <Marker position={fromCoords} icon={customIcon} />
      <Marker position={toCoords} icon={customIcon} />

      {/* Blue line showing route between pickup and dropoff */}
      <Polyline positions={[fromCoords, toCoords]} color="blue" />
    </MapContainer>
  );
};

export default MapView;
