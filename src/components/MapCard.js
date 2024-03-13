import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline } from '@react-google-maps/api';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/Config';

const MapCard = ({ duckId }) => {
  const [startLocation, setStartLocation] = useState(null);
  const [lastLocation, setLastLocation] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      if (duckId) {
        const docRef = doc(db, 'ducks', duckId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const startLoc = data.startLocation.coordinates; // Assuming this is a Firestore GeoPoint
          const lastLoc = data.lastLocation.coordinates;   // Assuming this is a Firestore GeoPoint

          // Update state with the GeoPoint latitude and longitude
          setStartLocation({
            lat: startLoc.latitude,
            lng: startLoc.longitude
          });
          setLastLocation({
            lat: lastLoc.latitude,
            lng: lastLoc.longitude
          });
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchLocations();
  }, [duckId]);

  const containerStyle = {
    width: '300px',
    height: '300px'
  };

  // Set defaultCenter to one of your known locations to avoid displaying the wrong area
  const defaultCenter = startLocation || {
    lat: 0, // Use a sensible default
    lng: 0  // Use a sensible default
  };

  const renderMap = () => {
    // Adjust the center of the map dynamically based on the locations
    const center = startLocation || defaultCenter;

    return (
      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={center}
          zoom={10}
        >
          {startLocation && <Marker position={startLocation} />}
          {lastLocation && <Marker position={lastLocation} />}
          {startLocation && lastLocation && (
            <Polyline
              path={[startLocation, lastLocation]}
              options={{ strokeColor: "#FF0000" }}
            />
          )}
        </GoogleMap>
      </LoadScript>
    );
  };

  return renderMap();
};

export default MapCard;
