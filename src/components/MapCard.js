import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapCard = ({ location }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Fix for Leaflet Default Icon issue in React/Webpack
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
      iconUrl: require('leaflet/dist/images/marker-icon.png'),
      shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
    });

    if (!location.startLocation || !location.newLocation) return;

    // Ensure container exists
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
    });

    // Invalidate size after mount to fix grey tiles issue
    const timerId = setTimeout(() => {
      if (map) {
        map.invalidateSize();
      }
    }, 100);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const startLatLng = [
      location.startLocation.coordinates.latitude,
      location.startLocation.coordinates.longitude,
    ];
    const endLatLng = [
      location.newLocation.coordinates.latitude,
      location.newLocation.coordinates.longitude,
    ];

    // Create marker bounds to center properly
    const bounds = L.latLngBounds([startLatLng, endLatLng]);

    // Create start marker with popup
    const startMarker = L.marker(startLatLng).addTo(map);
    startMarker.bindPopup(
      `<b>Start Location</b><br>${location.startLocation.city}, ${location.startLocation.state}`
    );

    // Create end marker with popup
    const endMarker = L.marker(endLatLng).addTo(map);
    endMarker.bindPopup(
      `<b>New Location</b><br>${location.newLocation.city}, ${location.newLocation.state}`
    );

    // Add a polyline between start and end markers
    L.polyline([startLatLng, endLatLng], { color: 'red' }).addTo(map);

    // Fit the map to the bounds with padding
    map.fitBounds(bounds, { padding: [20, 20] });

    // Cleanup function to remove the map when the component unmounts
    return () => {
      clearTimeout(timerId); // Prevent invalidateSize from running if unmounted
      map.remove();
    };
  }, [location]); // Run the effect when 'location' changes

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
};

export default MapCard;
