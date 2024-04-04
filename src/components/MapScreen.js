import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';

const MapScreen = () => {
  const { duckId } = useParams();
  const [locations, setLocations] = useState([]);
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // This ref will hold the map instance

  const defaultPosition = [51.505, -0.09]; // Default coordinates

  // Initialize the map only once when the component mounts
  useEffect(() => {
    // Create the map instance if one does not already exist
    if (!mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(defaultPosition, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
      }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const fetchLocations = async (duckId) => {
    try {
      const locationsQuery = query(collection(db, 'locations'), where('duckId', '==', duckId));
      const querySnapshot = await getDocs(locationsQuery);
      const locationsData = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));

      const groupedLocations = locationsData.reduce((acc, location) => {
        const lat = location.startLocation.coordinates.latitude;
        const lng = location.startLocation.coordinates.longitude;
        const key = `${lat}-${lng}`;
        if (!acc[key]) {
          acc[key] = {
            city: location.startLocation.city,
            state: location.startLocation.state,
            country: location.startLocation.country,
            coordinates: location.startLocation.coordinates,
            dates: [location.timestamp], // Add the first timestamp
          };
        } else {
          acc[key].dates.push(location.timestamp); // Add subsequent timestamps
        }
        return acc;
      }, {});

      setLocations(Object.values(groupedLocations));
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const formatDate = (timestamp) => {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US");
  };

  useEffect(() => {
    if (duckId) {
      fetchLocations(duckId);
    }
  }, [duckId]);

  // Update markers when locations change
  useEffect(() => {
    if (locations.length === 0 || !mapInstance.current) return;

    let markers = [];
    locations.forEach(location => {
      const latLng = [location.coordinates.latitude, location.coordinates.longitude];
      const marker = L.marker(latLng).addTo(mapInstance.current);
      marker.bindPopup(
        `This duck was found in ${location.city} on ${location.dates.map(date => formatDate(date)).join(', ')}`
      );
      markers.push(marker);
    });

    // Adjust map to fit all markers
    const group = L.featureGroup(markers).addTo(mapInstance.current);
    mapInstance.current.fitBounds(group.getBounds());

    // Cleanup: remove markers when the component unmounts or locations update
    return () => {
      group.clearLayers();
    };
  }, [locations]);

  return <div ref={mapRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapScreen;
