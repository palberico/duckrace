import React, { useState, useEffect, useCallback } from 'react';
import { Button, Header, Icon } from 'semantic-ui-react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/Config';
import countryOptions from '../components/data/Countries';
import { getDistanceFromLatLonInKm } from './data/geoUtils';
import LocationsMapModal from './LocationsMapModal';

const LocationsCard = ({ duckId }) => {
  const [locations, setLocations] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const fetchMoreLocations = useCallback(async () => {
    if (!duckId || !lastVisible) {
      setHasMore(false);
      return;
    }

    setLoading(true);
    const locationsQuery = query(
      collection(db, 'locations'),
      where('duckId', '==', duckId),
      orderBy('timestamp', 'desc'),
      startAfter(lastVisible),
      limit(10)
    );

    try {
      const querySnapshot = await getDocs(locationsQuery);
      if (!querySnapshot.empty) {
        const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
        const newLocations = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));

        setLastVisible(newLastVisible);
        setLocations(prevLocations => [...prevLocations, ...newLocations]);
        setHasMore(querySnapshot.docs.length === 10);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more locations:", error);
    } finally {
      setLoading(false);
    }
  }, [duckId, lastVisible]);

  useEffect(() => {
    if (!duckId) {
      console.error("Duck ID is undefined.");
      return;
    }

    setLoading(true);
    const fetchInitialLocations = async () => {
      const locationsQuery = query(
        collection(db, 'locations'),
        where('duckId', '==', duckId),
        orderBy('timestamp', 'desc'),
        limit(10)
      );

      try {
        const querySnapshot = await getDocs(locationsQuery);
        if (!querySnapshot.empty) {
          const newLastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          const newLocations = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));

          setLastVisible(newLastVisible);
          setLocations(newLocations);
          setHasMore(querySnapshot.docs.length === 10);
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching initial locations:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialLocations();
  }, [duckId]); // Only runs once when the component mounts, as duckId should not change

  const getCountryFullName = (countryCode) => {
    const country = countryOptions.find(option => option.key === countryCode.toLowerCase());
    return country ? country.text : countryCode;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JS Date
    return date.toLocaleDateString("en-US"); // Format the date as you prefer
  };

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setMapModalOpen(true);
  };


  const getDistance = (location) => {
    if (location.distance) return location.distance;
    if (location.startLocation?.coordinates && location.newLocation?.coordinates) {
      const distKm = getDistanceFromLatLonInKm(
        location.startLocation.coordinates.latitude,
        location.startLocation.coordinates.longitude,
        location.newLocation.coordinates.latitude,
        location.newLocation.coordinates.longitude
      );
      return Math.round(distKm * 0.621371);
    }
    return 0;
  };

  return (
    <div style={{ marginTop: '30px' }}>
      <Header as='h3' inverted>All Locations Found</Header>

      <div className="timeline-container" style={{ position: 'relative', paddingLeft: '20px' }}>
        {/* Vertical Line */}
        <div style={{
          position: 'absolute',
          left: '29px', /* Center of marker */
          top: '20px',
          bottom: '20px',
          width: '2px',
          background: 'linear-gradient(to bottom, var(--neon-blue), transparent)',
          zIndex: 0
        }} />

        {locations.map((location, index) => (
          <div
            key={location.id}
            className="timeline-item"
            onClick={() => handleLocationClick(location)}
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '20px',
              position: 'relative',
              cursor: 'pointer'
            }}
          >
            {/* Marker */}
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'var(--neon-blue)',
              boxShadow: '0 0 10px var(--neon-blue)',
              zIndex: 1,
              marginTop: '20px', // Align with card top
              flexShrink: 0
            }} />

            {/* Content Card */}
            <div className="glass-card timeline-card" style={{
              flex: 1,
              padding: '0.6rem 1rem',
              marginBottom: '0',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'transform 0.2s, background 0.2s',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.3rem'
            }}>
              {/* Top row: Date and Miles */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '294px', height: '20px' }}>
                <span style={{ color: 'var(--neon-blue)', fontWeight: 'bold', fontSize: '0.85rem', lineHeight: '1', display: 'block' }}>{formatDate(location.timestamp)}</span>
                <span style={{ fontSize: '0.8rem', color: '#888', lineHeight: '1', display: 'block' }}>
                  {getDistance(location)} Miles
                </span>
              </div>

              {/* Bottom row: Location and View on Map */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '294px', height: '20px' }}>
                <span style={{ color: 'white', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1', display: 'block' }}>
                  {location.newLocation.city}, {location.newLocation.state || getCountryFullName(location.newLocation.country)}
                </span>
                <div style={{ fontSize: '0.8rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap', lineHeight: '1', height: 'auto' }}>
                  <Icon name='map marker alternate' style={{ margin: 0, fontSize: '0.8rem' }} />
                  <span style={{ display: 'block' }}>View on Map</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loading && <p style={{ color: '#aaa', textAlign: 'center' }}>Loading more locations...</p>}
      {!loading && hasMore && (
        <Button
          onClick={fetchMoreLocations}
          fluid
          className="profile-action-btn secondary"
          style={{ marginTop: '1rem' }}
        >
          Load More History
        </Button>
      )}

      <LocationsMapModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        locations={locations}
        selectedLocation={selectedLocation}
        duckId={duckId}
      />
    </div>
  );
};

export default LocationsCard;
