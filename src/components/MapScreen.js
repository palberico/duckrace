import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config'; // Ensure this path is correct

const MapScreen = () => {
  const mapRef = useRef(null);
  const defaultPosition = [51.505, -0.09]; // Default coordinates for the map's initial view

  useEffect(() => {
    const map = L.map(mapRef.current).setView(defaultPosition, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    // Fetch locations from Firestore
    const fetchLocations = async () => {
      const querySnapshot = await getDocs(collection(db, "locations"));
      querySnapshot.forEach((doc) => {
        const locationData = doc.data().startLocation;
        const coordinates = [locationData.coordinates.latitude, locationData.coordinates.longitude];
        L.marker(coordinates)
          .addTo(map)
          .bindPopup(`Location: ${locationData.city}, ${locationData.state}<br>Visited on: ${new Date(doc.data().timestamp.seconds * 1000).toDateString()}`);
      });
    };

    fetchLocations();

    return () => {
      map.remove();
    };
  }, []);

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapScreen;
