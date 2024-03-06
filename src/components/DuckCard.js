import React, { useEffect, useState } from 'react';
import { Card, Image } from 'semantic-ui-react';
import { db } from '../firebase/Config';
import { collection, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const DuckCard = () => {
  const [ducks, setDucks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, 'ducks'));
      setDucks(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    fetchData();
  }, []);

  return (
    <div className="duckCardGroup">
    <Card.Group itemsPerRow={5} stackable>
      {ducks.map((duck) => (
        <Link to={`/duck/${duck.id}`} key={duck.id}>
          <Card style={cardStyle}>
            <Image src={duck.image} wrapped ui={false} />
            <Card.Content>
              <Card.Header textAlign="center">{duck.name}</Card.Header>
            </Card.Content>
          </Card>
        </Link>
      ))}
    </Card.Group>
    </div>
  );
};

export default DuckCard;

const cardStyle = {
  margin: '10px', // This will add space around each card
  // Other styles if needed
};
