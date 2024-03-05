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
    <Card.Group>
      {ducks.map((duck) => (
        <Link to={`/duck/${duck.name}`} key={duck.id}>
        <Card key={duck.id} className="duck-card">
          <Image src={duck.image} wrapped ui={false} />
          <Card.Content>
            <Card.Header textAlign="center">{duck.name}</Card.Header>
          </Card.Content>
        </Card>
        </Link>
      ))}
    </Card.Group>
  );
};

export default DuckCard;

