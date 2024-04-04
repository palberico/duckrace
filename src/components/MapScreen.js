
import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapScreen = () => {
  const mapRef = useRef(null);
  const defaultPosition = [51.505, -0.09]; // Default coordinates for the map's initial view

  useEffect(() => {
    // Initialize the map
    const map = L.map(mapRef.current).setView(defaultPosition, 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Cleanup function to remove the map when the component unmounts
    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapScreen;
