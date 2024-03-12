import React, { useState } from 'react';
import { Button, Form, Input, Message, Segment, Header } from 'semantic-ui-react';
import { addDoc, collection, GeoPoint } from 'firebase/firestore';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { db } from '../firebase/Config';

const DuckAdmin = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [image, setImage] = useState(null); // For future image handling
  const [error, setError] = useState('');

  const getCoordinates = async (address) => {
    try {
      const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          address: address,
          key: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        },
      });
  
      console.log(response.data); // Additional log for debugging
  
      if (response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return new GeoPoint(lat, lng); // Use the GeoPoint constructor for Firestore
      } else {
        console.log('Location not found in the results.'); // Additional log for debugging
        throw new Error("Location not found.");
      }
    } catch (error) {
      console.error('Error getting coordinates:', error);
      setError(error.message);
      return null;
    }
  };
  
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    const coordinates = await getCoordinates(startLocation);
  
    if (!coordinates) {
      // Log and set an error message if coordinates are not found
      console.error('No coordinates found for the location.');
      setError('Failed to get coordinates for the location.');
      return;
    }
  
    // Log the data about to be submitted to Firestore
    console.log('Submitting to Firestore:', { name, code, startLocation, coordinates, image });
  
    try {
      // Attempt to add a new document to the Firestore collection
      const docRef = await addDoc(collection(db, 'ducks'), {
        name,
        code,
        startLocation: {
          city: startLocation, // This should be updated with more specific fields
          coordinates: coordinates,
        },
        image, // Placeholder URL for the image
      });
  
      // Log the Firestore response
      console.log('Document written with ID: ', docRef.id);
  
      // Reset form fields after successful submission
      setName('');
      setCode('');
      setStartLocation('');
      setImage(null);
      setError(''); // Clear any errors
    } catch (e) {
      // Catch and log any errors during submission
      console.error('Error adding document: ', e);
      setError('Error adding document: ' + e.message);
    }
  };

  return (
    <Segment padded="very" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '20px' }}>
      <Header as='h2' textAlign='center'>
        Duck Registration
      </Header>
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
          <Input placeholder='Enter Start Location' value={startLocation} onChange={(e) => setStartLocation(e.target.value)} />
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