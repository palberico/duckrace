import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Form } from 'semantic-ui-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/Config';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const DuckForm = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState({});
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [lastLocation, setLastLocation] = useState('Not yet found');

  useEffect(() => {
    const fetchDuckData = async () => {
      const docRef = doc(db, 'ducks', duckId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDuckData(docSnap.data());
        console.log("Fetched lastLocation:", docSnap.data().lastLocation); // Debug log
        const lastLoc = docSnap.data().lastLocation || 'Not yet found';
        if (lastLoc && typeof lastLoc === 'object') {
          setLastLocation(`${lastLoc.city || ''}, ${lastLoc.state || ''}, ${lastLoc.country || ''}`.trim());
        } else {
          setLastLocation(lastLoc);
        }
      }
    };
  
    fetchDuckData();
  }, [duckId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!city || !state || !country) {
      alert("Please fill in all fields: City, State, and Country.");
      return;
    }

    const locationString = `${city}, ${state}, ${country}`;

    try {
      const duckRef = doc(db, 'ducks', duckId);
      await updateDoc(duckRef, {
        lastLocation: { city, state, country }, // Object stored in Firestore
      });

      setLastLocation(locationString); // String for UI display
      setCity('');
      setState('');
      setCountry('');

      navigate(`/duck/${duckId}`);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("An error occurred while updating the location. Please try again.");
    }
  };

  return (
    <div style={styles.homeContainer}>
      <Card>
        <Card.Header>You found {duckData.name}.</Card.Header>
        <Image src={duckData.image} wrapped ui={false} />
        <Card.Content>
          <div>Last place found: {lastLocation}</div>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
              <label>City</label>
              <input
                placeholder='City'
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </Form.Field>
            <Form.Field>
              <label>State</label>
              <input
                placeholder='State'
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </Form.Field>
            <Form.Field>
              <label>Country</label>
              <input
                placeholder='Country'
                value={country}
                onChange={(e) => setCountry(e.target.value)}
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
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
    color: '#333',
    fontFamily: 'Arial, sans-serif',
  },
  checkerboardFooter: {
    width: '100%',
    height: '50px',
    backgroundSize: '20px 20px',
    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
};
