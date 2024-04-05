import React, { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/Config';

const MapScreen = () => {
  const mapRef = useRef(null);
  const { locationId } = useParams();
  const map = useRef(null); // Hold map instance in ref

  useEffect(() => {
    if (!mapRef.current) return; // Ensure the ref is linked to an element

    map.current = L.map(mapRef.current).setView([0, 0], 1); // Instantiate the map only once
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map.current);

    return () => {
      if (map.current) {
        map.current.remove(); // Clean up the map instance on unmount
        map.current = null; // Ensure to clear out the ref
      }
    };
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      if (locationId && map.current) {
        try {
          const locationRef = doc(db, 'locations', locationId);
          const docSnap = await getDoc(locationRef);

          if (docSnap.exists()) {
            const locationData = docSnap.data().startLocation;
            if (locationData?.coordinates) {
              const { latitude, longitude } = locationData.coordinates;

              L.marker([latitude, longitude], { alt: "Duck Location" })
                .addTo(map.current)
                .bindPopup(
                  `<b>Found Location</b><br>
                  ${locationData.city}, 
                  ${locationData.state}, 
                  ${locationData.country}<br>
                  Visited on: ${docSnap.data().timestamp.toDate().toLocaleDateString()}`
                );

              map.current.setView([latitude, longitude], 10); // Center map on the new marker
            }
          } else {
            console.log('No location found with the given ID.');
          }
        } catch (error) {
          console.error("Error fetching location: ", error);
        }
      }
    };

    fetchLocation();
  }, [locationId]); // Re-run when locationId changes

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapScreen;
