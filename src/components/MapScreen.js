import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useParams } from 'react-router-dom';

const MapScreen = () => {
  const { locationId } = useParams(); // Extract locationId from the URL
  const [locations, setLocations] = useState([]); // State to hold locations data
  const defaultPosition = [51.505, -0.09]; // Default map center position (Latitude, Longitude)

  // Placeholder for your actual data fetching or filtering function
  const fetchLocations = async (id) => {
    // Simulate fetching data
    // Replace this with your actual data fetching or filtering logic
    setTimeout(() => {
      // Simulated location data - replace this with actual data retrieval
      setLocations([{
        id: id,
        coordinates: { latitude: 51.505, longitude: -0.09 },
        timestamp: { seconds: Date.now() / 1000 }
      }]);
    }, 1000);
  };

  useEffect(() => {
    if (locationId) {
      fetchLocations(locationId); // Fetch or filter locations when `locationId` changes
    }
  }, [locationId]);

  return (
    <MapContainer center={defaultPosition} zoom={13} style={{ height: '100vh', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {locations.length > 0 ? (
        locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates.latitude, location.coordinates.longitude]}
          >
            <Popup>
              A duck was spotted here on <br />
              {new Date(location.timestamp.seconds * 1000).toLocaleDateString("en-US")}
            </Popup>
          </Marker>
        ))
      ) : (
        <Popup position={defaultPosition}>
          Loading locations...
        </Popup>
      )}
    </MapContainer>
  );
};

export default MapScreen;
