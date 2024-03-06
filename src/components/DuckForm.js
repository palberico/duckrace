import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Form } from 'semantic-ui-react';
import { useParams, useNavigate } from 'react-router-dom'; // Import useNavigate
import { db } from '../firebase/Config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const DuckForm = () => {
  const { duckId } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
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

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const duckRef = doc(db, 'ducks', duckId);
    await updateDoc(duckRef, {
      lastPlace: placeFound,
    });
    setLastPlace(placeFound); // Update last place found after successful submission
    setPlaceFound(''); // Clear input field after submission

    // Redirect to the DuckProfile page of the duck
    navigate(`/duck/${duckId}`);
  };

  return (
    <div style={styles.homeContainer}>
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
      <div style={styles.checkerboardFooter}></div>
    </Card>
    </div>
  );
};

export default DuckForm;

const styles = {
  homeContainer: {
    display: 'flex',
    flexDirection: 'column', // Stack children vertically
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    color: '#333',
    fontFamily: 'Arial, sans-serif',
  },
  checkerboardFooter: {
    width: '100%', // Full width
    height: '50px', // Footer height
    backgroundSize: '20px 20px', // Size of each square
    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', // Positioning the gradients
  },
};
