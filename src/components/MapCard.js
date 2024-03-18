import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapCard = ({ location }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    const map = L.map(mapRef.current).setView([0, 0], 1);
    mapRef.current.leafletMap = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    if (location.startLocation && location.newLocation && location.startLocation.coordinates && location.newLocation.coordinates) {
      const startLatLng = [
        location.startLocation.coordinates.latitude,
        location.startLocation.coordinates.longitude,
      ];
      const endLatLng = [
        location.newLocation.coordinates.latitude,
        location.newLocation.coordinates.longitude,
      ];

      L.marker(startLatLng).addTo(map);
      L.marker(endLatLng).addTo(map);

      const polyline = L.polyline([startLatLng, endLatLng], { color: 'red' }).addTo(map);
      map.fitBounds(polyline.getBounds());

      return () => {
        map.remove();
      };
    }
  }, [location]);

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
};

export default MapCard;
