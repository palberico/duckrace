import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/Config';
import { Icon, Button, Segment } from 'semantic-ui-react';

const MapScreen = () => {
  const mapRef = useRef(null);
  const { locationId } = useParams();
  const navigate = useNavigate();

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

              map.current.setView([latitude, longitude], 5); // Center map on the new marker
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
  const goBack = () => navigate(-1);

  return (
    <>
      <div ref={mapRef} style={{ height: 'calc(100vh - 65px)', width: '100%' }} />
      
      {/* Footer segment with buttons */}
      <Segment inverted style={{ position: 'absolute', bottom: 0, width: '100%', display: 'flex' }}>
        <Button icon labelPosition='left' onClick={goBack} fluid>
          <Icon name='arrow left' />
          Back
        </Button>
        <Button icon fluid>
          <Icon name='placeholder' />
          Next Feature
        </Button>
      </Segment>
    </>
  );
};

export default MapScreen;
