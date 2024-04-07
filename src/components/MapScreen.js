import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';
import { 
  Icon, 
  Button, 
  Segment,
} from 'semantic-ui-react';

//Things to change. We need to group similar locations into the same marker. 
//Add multiple dates.

const MapScreen = () => {
  const mapRef = useRef(null);
  const locationState = useLocation().state;
  const { locationId } = useParams();
  const duckId = locationState?.duckId; // Get duckId from the state passed in the Link
  const navigate = useNavigate(); //This is for the back button. Add useNavigate to the react-router-dom if you want to add it back.
  const [showAllLocations, setShowAllLocations] = useState(false);
  const map = useRef(null); // Hold map instance in ref
  // const [mapHeight, setMapHeight] = useState(window.innerHeight - 65); // Set initial map height

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
    const fetchLocations = async () => {
      try {
        let querySnapshot;
        if (showAllLocations && duckId) {
          const locationsQuery = query(
            collection(db, 'locations'),
            where('duckId', '==', duckId),
            orderBy('timestamp', 'desc')
          );
          querySnapshot = await getDocs(locationsQuery);
        } else if (locationId) {
          const locationRef = doc(db, 'locations', locationId);
          const docSnap = await getDoc(locationRef);
          querySnapshot = docSnap.exists() ? { docs: [docSnap] } : { docs: [] };
        }
  
        querySnapshot.docs.forEach((doc) => {
          const locationData = doc.data().startLocation;
          if (locationData?.coordinates) {
            const { latitude, longitude } = locationData.coordinates;
            L.marker([latitude, longitude], { alt: "Duck Location" })
              .addTo(map.current)
              .bindPopup(
                `<b>Found Location</b><br>
                ${locationData.city}, 
                ${locationData.state}, 
                ${locationData.country}<br>
                Visited on: ${doc.data().timestamp.toDate().toLocaleDateString()}`
              );
          }
        });
  
        // After adding all markers, adjust the map view
        if (showAllLocations && querySnapshot.docs.length > 0) {
          const group = L.featureGroup(querySnapshot.docs.map((doc) => {
            const coords = doc.data().startLocation.coordinates;
            return L.marker([coords.latitude, coords.longitude]);
          }));
          map.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        } else if (!showAllLocations && querySnapshot.docs.length > 0) {
          const coords = querySnapshot.docs[0].data().startLocation.coordinates;
          map.current.setView([coords.latitude, coords.longitude], 5);
        }
  
      } catch (error) {
        console.error("Error fetching locations: ", error);
      }
    };
  
    fetchLocations();
  }, [locationId, showAllLocations, duckId]);

  const goBack = () => navigate(-1);
  const handleShowAllLocations = () => setShowAllLocations((prevState) => !prevState);

  return (
    <>
      <div ref={mapRef} style={{ height: 'calc(100vh - 65px)', width: '100%' }} />
      <Segment inverted style={{ position: 'absolute', bottom: 0, width: '100%', display: 'flex' }}>
      
          <Button icon labelPosition='left' onClick={goBack} fluid >
            <Icon name='arrow left' />
            Back
          </Button>
      
          <Button icon labelPosition='right' onClick={handleShowAllLocations} fluid >
            <Icon name='world' />
            All Locations
          </Button>
    
      </Segment>
    </>
  );
};

export default MapScreen;
