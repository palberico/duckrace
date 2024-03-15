import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Form, ButtonOr, ButtonGroup, Segment, Dropdown, Loader } from 'semantic-ui-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/Config';
import { doc, getDoc, updateDoc, GeoPoint } from 'firebase/firestore';
import axios from 'axios';

import countryOptions from '../components/data/Countries';
import stateOptions from '../components/data/States';

const DuckForm = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState({});
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [setError] = useState('');

  useEffect(() => {
    const fetchDuckData = async () => {
      const docRef = doc(db, 'ducks', duckId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDuckData(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchDuckData();
  }, [duckId]);

  const getCoordinates = async (city, state, country) => {
    const fullAddress = `${city}, ${state}, ${country}`;
    const encodedAddress = encodeURIComponent(fullAddress);

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      setIsLoading(false); // Stop loading
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return new GeoPoint(lat, lng);
      } else {
        setError(response.data.error_message || 'Failed to geocode address');
        return null;
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const newCoordinates = await getCoordinates(city, state, country);
    setIsLoading(false);

    if (!newCoordinates) {
      alert('Failed to get geolocation data. Please check the city, state, and country values and try again.');
      return;
    }

    try {
      const duckRef = doc(db, 'ducks', duckId);
      await updateDoc(duckRef, {
        lastLocation: {
          city,
          state,
          country,
          coordinates: newCoordinates
        },
      });

      navigate(`/duck/${duckId}`);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("An error occurred while updating the location. Please try again.");
    }
  };

  return (
    <div style={styles.homeContainer}>
      {isLoading ? <Loader active inline='centered' /> : (
        <Card>
          <Card.Header as='h2'>{duckData.name}</Card.Header>
          <Image src={duckData.imageUrl} wrapped ui={false} />
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
                <Dropdown
                  placeholder='Select State'
                  fluid
                  search
                  selection
                  options={stateOptions}
                  value={state}
                  onChange={(e, { value }) => setState(value)}
                />
              </Form.Field>
              <Form.Field>
                <label>Country</label>
                <Dropdown
                  placeholder='Select Country'
                  fluid
                  search
                  selection
                  options={countryOptions}
                  value={country}
                  onChange={(e, { value }) => setCountry(value)}
                />
              </Form.Field>
              <ButtonGroup>
                <Button color='orange' type='submit'>Submit</Button>
                <ButtonOr />
                <Link to="/Home">
                  <Button color='grey'>Back</Button>
                </Link>
              </ButtonGroup>
            </Form>
          </Card.Content>
          <div style={styles.checkerboardFooter}></div>
        </Card>
      )}
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
    marginTop: '50px',
    marginBottom: '50px',
  },
  lastLocation: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
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
