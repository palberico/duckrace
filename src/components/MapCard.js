import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapCard = ({ location }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!location.startLocation || !location.newLocation) return;

    const map = L.map(mapRef.current, {
      scrollWheelZoom: false,
      dragging: false,
      zoomControl: false,
    }).setView([0, 0], 1);

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

    // Custom Icon for red marker. Change URL path and delete the above method. 

  //   const redIcon = L.icon({
  //     iconUrl: 'path/to/red-marker-icon.png', // Path to your red marker image
  //     iconSize: [25, 41], // Size of the icon, default is [25, 41]
  //     iconAnchor: [12, 41], // Point of the icon which will correspond to marker's location
  //     popupAnchor: [1, -34], // Point from which the popup should open relative to the iconAnchor
  //     shadowUrl: 'path/to/marker-shadow.png', // Optional: Path to marker shadow image
  //     shadowSize: [41, 41] // Optional: Size of the shadow image, default is [41, 41]
  // });
  
  // Create end marker with the custom red icon and bind a popup
  //     const endMarker = L.marker(endLatLng, {icon: redIcon}).addTo(map);
  //     endMarker.bindPopup(
  //     `<b>New Location</b><br>${location.newLocation.city}, ${location.newLocation.state}`
  // );

    // Add a polyline between start and end markers
    const polyline = L.polyline([startLatLng, endLatLng], { color: 'red' }).addTo(map);

    // Fit the map to the polyline's bounds
    map.fitBounds(polyline.getBounds());

    // Cleanup function to remove the map when the component unmounts
    return () => map.remove();
  }, [location]); // Run the effect when 'location' changes

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} />;
};

export default MapCard;
