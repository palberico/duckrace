import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Form, ButtonOr, ButtonGroup, Segment } from 'semantic-ui-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  const handleBack = () => navigate(-1);

  return (
    <div style={styles.homeContainer}>
      <Card>
        <Card.Header as='h2'>{duckData.name}</Card.Header>
          <Card.Meta style={styles.lastLocation}>{lastLocation}</Card.Meta>
        <Image src={duckData.image} wrapped ui={false} />
        <Card.Content>
          <Segment textAlign='center'>Enter the city, state, and country of where you found {duckData.name}.</Segment>
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
            <ButtonGroup>
              <Button color='orange'>Submit</Button>
                 <ButtonOr />
            <Link to="/Home">
              <Button color='grey' onClick={handleBack}>Back</Button>
            </Link>
            </ButtonGroup>
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
    // backgroundColor: '#f0f0f0',
    color: '#333',
    fontFamily: 'Arial, sans-serif',
    marginTop: '50px',
    marginBottom: '50px',
  },
  lastLocation: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // color: '#333',
    // fontFamily: 'Arial, sans-serif',
    // marginTop: '10px',
    marginBottom: '10px',
  },
  checkerboardFooter: {
    width: '100%',
    height: '50px',
    backgroundSize: '20px 20px',
    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
};
