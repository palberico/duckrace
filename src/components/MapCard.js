import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapCard = ({ location }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Initialize the map with options to disable zooming and dragging
    const map = L.map(mapRef.current, {
      scrollWheelZoom: false, // Disable zooming with the scroll wheel
      dragging: false,        // Disable dragging to pan
      zoomControl: false,     // Disable zoom control buttons
    }).setView([0, 0], 1);

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
    }

    // Cleanup function to remove the map when the component unmounts
    return () => {
      map.remove();
    };
  }, [location]); // Effect runs when location changes

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
};

export default MapCard;
