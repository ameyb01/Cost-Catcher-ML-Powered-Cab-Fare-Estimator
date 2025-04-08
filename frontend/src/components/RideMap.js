// src/components/RideMap.js

import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// These imports fix missing marker icons when using Leaflet in React apps (especially with Webpack)
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';

/**
 * RideMap Component
 * This component displays a map with pickup and dropoff locations.
 *
 * Props:
 * - pickupCoords: [latitude, longitude] of the pickup location
 * - dropoffCoords: [latitude, longitude] of the dropoff location
 */
function RideMap({ pickupCoords, dropoffCoords }) {
  // If either coordinate is missing, don't render the map
  if (!pickupCoords || !dropoffCoords) return null;

  return (
    <div className="map-wrapper">
      <MapContainer
        center={pickupCoords}       // Map initially centers on the pickup location
        zoom={12}                   // Default zoom level
        scrollWheelZoom={false}     // Disable scroll zoom for a cleaner user experience
        className="leaflet-container" // Styling class for map container
      >
        {/* OpenStreetMap tiles for the map background */}
        <TileLayer
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Markers for pickup and dropoff */}
        <Marker position={pickupCoords} />
        <Marker position={dropoffCoords} />

        {/* Line connecting pickup and dropoff to visualize route */}
        <Polyline positions={[pickupCoords, dropoffCoords]} color="blue" />
      </MapContainer>
    </div>
  );
}

export default RideMap;
