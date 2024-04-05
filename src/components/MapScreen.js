import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/Config'; // Ensure this path is correct

const MapScreen = () => {
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      const locationsQuery = query(collection(db, "locations"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(locationsQuery);
      let locationsArray = [];

      querySnapshot.forEach((doc) => {
        const locationData = doc.data().startLocation;
        const coordinatesKey = `${locationData.city}-${locationData.state}`;
        const dateString = new Date(doc.data().timestamp.seconds * 1000).toLocaleDateString();
        
        if (!locationsArray.some(loc => loc.coordinatesKey === coordinatesKey)) {
          locationsArray.push({
            coordinatesKey,
            coordinates: [locationData.coordinates.latitude, locationData.coordinates.longitude],
            dates: [dateString],
            city: locationData.city,
            state: locationData.state,
          });
        } else {
          const loc = locationsArray.find(loc => loc.coordinatesKey === coordinatesKey);
          loc.dates.push(dateString);
        }
      });

      setLocations(locationsArray);
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (locations.length > 0 && mapRef.current) {
      // Default to the most recent location's coordinates
      const defaultCoordinates = locations[0].coordinates;
      
      const map = L.map(mapRef.current).setView(defaultCoordinates, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Create markers for each group
      locations.forEach(group => {
        L.marker(group.coordinates)
          .addTo(map)
          .bindPopup(`Location: ${group.city}, ${group.state}<br>Visited on: ${group.dates.join(', ')}`);
      });
    }
  }, [locations]); // This effect runs when the locations state updates

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapScreen;
