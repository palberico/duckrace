// src/components/DuckCard.js
import React, { useEffect, useState } from 'react';
import { Card, Image, Grid } from 'semantic-ui-react';
import { db } from '../firebase/Config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const DuckCard = () => {
  const [ducks, setDucks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch ducks and order them by distance in descending order
      const q = query(collection(db, 'ducks'), orderBy('distance', 'desc'));
      const querySnapshot = await getDocs(q);
      const sortedDucks = querySnapshot.docs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        position: `P${index + 1}` // Assign position based on order
      }));
      setDucks(sortedDucks);
    };

    fetchData();
  }, []);

  return (
    <Grid container stackable columns={4}>
      {ducks.map((duck, index) => (
        <Grid.Column key={duck.id}>
          <Link to={`/duck/${duck.id}`}>
            <Card>
              <Image src={duck.image} wrapped ui={false} />
              <Card.Content>
                <Card.Header>
                  {duck.position} - {duck.distance} miles
                </Card.Header>
                <Card.Header>
                  <span>{duck.name}</span>
                </Card.Header>
                <Card.Description>
                  {duck.shortBio}
                </Card.Description>
              </Card.Content>
            </Card>
          </Link>
        </Grid.Column>
      ))}
    </Grid>
  );
};

export default DuckCard;
