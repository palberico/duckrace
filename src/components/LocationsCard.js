import React, { useState, useEffect, useCallback } from 'react';
import { Card, List, Icon } from 'semantic-ui-react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/Config';

const LocationsCard = ({ duckId }) => {
  const [locations, setLocations] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true); 

  const fetchMoreLocations = useCallback(async () => {
    if (!duckId || !lastVisible) {
      // No duckId or lastVisible means we cannot fetch more, return early.
      setHasMore(false);
      return;
    }

    setLoading(true);
    const locationsQuery = query(
      collection(db, 'locations'),
      where('duckId', '==', duckId),
      orderBy('timestamp', 'asc'),
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
        orderBy('timestamp', 'asc'),
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

  const formatLocation = ({ city, state, country }) => {
    return state ? `${city}, ${state}` : `${city}, ${country}`;
  };

  return (
    <Card centered>
      <Card.Content>
        <Card.Header>All Locations Found</Card.Header>
        <List divided size='large'>
          {locations.map((location) => (
            <List.Item key={location.id}>
              <Icon name='marker' />
              <List.Content>
                {formatLocation(location.startLocation)} - {formatLocation(location.newLocation)}
              </List.Content>
            </List.Item>
          ))}
        </List>
        {loading && <p>Loading more locations...</p>}
        {!loading && hasMore && (
          <button onClick={fetchMoreLocations}>Load More</button>
        )}
      </Card.Content>
    </Card>
  );
};

export default LocationsCard;
