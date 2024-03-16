import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/Config';

const MapCard = ({ duckId }) => {
  const mapRef = useRef(null); // Reference to the map container

  useEffect(() => {
    const fetchLocationsAndRenderMap = async () => {
      if (duckId) {
        const docRef = doc(db, 'ducks', duckId);
        const docSnap = await getDoc(docRef);
  
        if (docSnap.exists()) {
          const data = docSnap.data();
          const startLoc = data.startLocation.coordinates; // Assuming this is a Firestore GeoPoint
          const lastLoc = data.lastLocation.coordinates;   // Assuming this is a Firestore GeoPoint
  
          // Clean up the existing map before initializing a new one
          if (mapRef.current.leafletMap) {
            mapRef.current.leafletMap.remove();
          }
  
          // Initialize the map
          const map = L.map(mapRef.current).setView([startLoc.latitude, startLoc.longitude], 13);
          mapRef.current.leafletMap = map; // Store the map instance for later access
  
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);
  
          // Add markers for the startLocation and lastLocation
          L.marker([startLoc.latitude, startLoc.longitude]).addTo(map);
          L.marker([lastLoc.latitude, lastLoc.longitude]).addTo(map);
  
          // Draw a line between startLocation and lastLocation
          const latlngs = [
            [startLoc.latitude, startLoc.longitude],
            [lastLoc.latitude, lastLoc.longitude]
          ];
          const polyline = L.polyline(latlngs, {color: 'red'}).addTo(map);
          mapRef.current.polyline = polyline; // Store the polyline for later access
  
          map.fitBounds(polyline.getBounds());
        } else {
          console.log('No such document!');
        }
      }
    };
  
    fetchLocationsAndRenderMap();
  
    // Cleanup function to remove the map instance on component unmount
    return () => {
      if (mapRef.current && mapRef.current.leafletMap) {
        mapRef.current.leafletMap.remove();
        mapRef.current.leafletMap = null;
      }
    };
  }, [duckId]);

  return <div id="map" ref={mapRef} style={{ height: '300px', width: '100%' }}></div>;
};

export default MapCard;
