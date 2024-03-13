import React, { useState } from 'react';
import { Button, Form, Input, Message, Segment, Header } from 'semantic-ui-react';
import { addDoc, collection, GeoPoint } from 'firebase/firestore';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { db } from '../firebase/Config';

const DuckAdmin = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startLocation, setStartLocation] = useState({ city: '', state: '', country: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');

  const getCoordinates = async (address) => {
    try {
      const fullAddress = `${address.city}, ${address.state}, ${address.country}`;
      const encodedAddress = encodeURIComponent(fullAddress);

      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return new GeoPoint(lat, lng);
      } else {
        throw new Error(response.data.error_message || 'Failed to geocode address');
      }
    } catch (error) {
      setError(`Geocoding failed: ${error.message}`);
      console.error('Error getting coordinates:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const coordinates = await getCoordinates(startLocation);

    if (!coordinates) {
      setError('Failed to get coordinates for the location.');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'ducks'), {
        name,
        code,
        startLocation: {
          ...startLocation,
          coordinates
        },
        image, // Assuming you handle image uploads separately
      });

      console.log('Document written with ID: ', docRef.id);
      setName('');
      setCode('');
      setStartLocation({ city: '', state: '', country: '' });
      setImage(null);
    } catch (e) {
      setError(`Error adding document: ${e.message}`);
      console.error('Error adding document: ', e);
    }
  };

  return (
    <Segment padded="very" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '20px' }}>
      <Header as='h2' textAlign='center'>Duck Registration</Header>
      <Form error={!!error} onSubmit={handleSubmit}>
        <Form.Field>
          <label>Duck Name</label>
          <Input placeholder='Enter Duck Name' value={name} onChange={(e) => setName(e.target.value)} />
        </Form.Field>
        <Form.Field>
          <label>Code</label>
          <Input placeholder='Enter Duck Code' value={code} onChange={(e) => setCode(e.target.value)} />
        </Form.Field>
        <Form.Field>
          <label>Start Location</label>
          <Input
            placeholder='Enter City'
            value={startLocation.city}
            onChange={(e) => setStartLocation({ ...startLocation, city: e.target.value })}
          />
          <Input
            placeholder='Enter State'
            value={startLocation.state}
            onChange={(e) => setStartLocation({ ...startLocation, state: e.target.value })}
          />
          <Input
            placeholder='Enter Country'
            value={startLocation.country}
            onChange={(e) => setStartLocation({ ...startLocation, country: e.target.value })}
          />
        </Form.Field>
        <Form.Field>
          <label>Image</label>
          <Input type='file' onChange={(e) => setImage(e.target.files[0])} />
        </Form.Field>
        {error && <Message error header='Error' content={error} />}
        <Button type='submit' primary fluid>Submit</Button>
        <Link to="/Home">
          <Button color='grey' fluid style={{ marginTop: '10px' }}>Back to Leaderboard</Button>
        </Link>
      </Form>
    </Segment>
  );
};

export default DuckAdmin;