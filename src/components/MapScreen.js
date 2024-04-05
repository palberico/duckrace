import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/Config'; // Ensure this path is correct

const MapScreen = () => {
  const mapRef = useRef(null);
  const [locations, setLocations] = useState([]);
  const navigate = useNavigate(); // Initialize the useNavigate hook

  // Function to handle the back button click
  const handleBack = () => {
    navigate(-1); // Use navigate to go back to the previous page
  };

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
      const defaultCoordinates = locations[0].coordinates;

      const map = L.map(mapRef.current, {
        zoomControl: false // Disable the default zoom control
      }).setView(defaultCoordinates, 6); // Change the zoom level here
      
      // Add a new zoom control in the top left corner
      L.control.zoom({
         position: 'topleft'
      }).addTo(map);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);

      // Create markers for each group
      locations.forEach(group => {
        L.marker(group.coordinates)
          .addTo(map)
          .bindPopup(`Location: ${group.city}, ${group.state}<br>Visited on: ${group.dates.join(', ')}`);
      });

      // Create a custom button below the zoom controls
      const customControl = L.control({ position: 'topleft' });
      customControl.onAdd = function (map) {
        const btn = L.DomUtil.create('button');
        btn.innerText = 'Back';
        btn.style.margin = '5px 10px 0 10px'; // Adjust margins as needed
        btn.style.padding = '0 10px';
        btn.onclick = handleBack;

        return btn;
      };
      customControl.addTo(map);
    }
  }, [locations, navigate]); // Include navigate in the dependencies array

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapScreen;

