import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Form} from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/Config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const DuckForm = () => {
  const { duckId } = useParams();
  const [duckData, setDuckData] = useState({});
  const [placeFound, setPlaceFound] = useState('');
  const [lastPlace, setLastPlace] = useState('');

  useEffect(() => {
    const fetchDuckData = async () => {
      const docRef = doc(db, 'ducks', duckId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDuckData(docSnap.data());
        setLastPlace(docSnap.data().lastPlace || 'Not yet found');
      }
    };

    fetchDuckData();
  }, [duckId]);

  const handleSubmit = async () => {
    const duckRef = doc(db, 'ducks', duckId);
    await updateDoc(duckRef, {
      lastPlace: placeFound,
    });
    setLastPlace(placeFound); // Update last place found after successful submission
    setPlaceFound(''); // Clear input field after submission
  };

  return (
    <Card>
      <Image src={duckData.image} wrapped ui={false} />
      <Card.Content>
        <Card.Header>You found {duckData.name}.</Card.Header>
        <div>Last place found: {lastPlace}</div>
        <Form onSubmit={handleSubmit}>
          <Form.Field>
            <label>Place Found (city, state, country)</label>
            <input
              placeholder='City, State, Country'
              value={placeFound}
              onChange={(e) => setPlaceFound(e.target.value)}
            />
          </Form.Field>
          <Button type='submit'>Submit</Button>
        </Form>
      </Card.Content>
    </Card>
  );
};

export default DuckForm;

