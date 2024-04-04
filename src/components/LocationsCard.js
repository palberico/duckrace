import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom'; // Import Link from React Router for navigation
import { Card, List, Icon, ListItem, ListContent, ListDescription } from 'semantic-ui-react';
import { collection, query, where, getDocs, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase/Config';
import countryOptions from '../components/data/Countries';

const LocationsCard = ({ duckId }) => {
  const [locations, setLocations] = useState([]);
  const [lastVisible, setLastVisible] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMoreLocations = useCallback(async () => {
    if (!duckId || !lastVisible) {
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

  const getCountryFullName = (countryCode) => {
    const country = countryOptions.find(option => option.key === countryCode.toLowerCase());
    return country ? country.text : countryCode;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp.seconds * 1000); // Convert Firestore timestamp to JS Date
    return date.toLocaleDateString("en-US"); // Format the date as you prefer
  };

  return (
    <Card centered>
      <Card.Content>
        <Card.Header>All Locations Found</Card.Header>
        <List relaxed divided>
          {locations.map((location) => (
            <ListItem key={location.id} as={Link} to={`/map/${location.id}`} style={{ cursor: 'pointer' }}> {/* Make list items clickable */}
              <Icon name='map marker alternate' size='large' color='red' />
              <ListContent>
                <ListDescription>
                  <strong>Date: </strong> {formatDate(location.timestamp)} {/* Display the formatted date */}
                </ListDescription>
                <ListDescription>
                  <strong>Start: </strong>
                  {location.startLocation.state
                    ? `${location.startLocation.city}, ${location.startLocation.state}`
                    : `${location.startLocation.city}, ${getCountryFullName(location.startLocation.country)}`}
                </ListDescription>
                <ListDescription>
                  <strong>End: </strong>
                  {location.newLocation.state
                    ? `${location.newLocation.city}, ${location.newLocation.state}`
                    : `${location.newLocation.city}, ${getCountryFullName(location.newLocation.country)}`}
                </ListDescription>
              </ListContent>
            </ListItem>
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
