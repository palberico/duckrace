import React, { useState } from 'react';
import { Button, Form, Input, Message } from 'semantic-ui-react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/Config';
// Add imports for geocoding and firebase storage if needed

const DuckAdmin = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [startLocation, setStartLocation] = useState('');
  const [image, setImage] = useState(null); // For now, it's null until we implement file upload
  const [error, setError] = useState('');

  // Function to handle geocoding (replace with your geocoding service)
  const getCoordinates = async (locationString) => {
    // Placeholder for geocoding API call to get coordinates
    // Replace with actual geocoding logic
    return { latitude: 0, longitude: 0 };
  };

  const handleSubmit = async () => {
    try {
      const coordinates = await getCoordinates(startLocation);

      // Add a new document in collection "ducks"
      const docRef = await addDoc(collection(db, 'ducks'), {
        name,
        code,
        startLocation: {
          city: startLocation, // Assuming city for simplicity, update with actual logic
          coordinates: new firebase.firestore.GeoPoint(coordinates.latitude, coordinates.longitude),
          // other fields like state, country if needed
        },
        image, // This will be the image URL after uploading to Firebase Storage
      });

      console.log('Document written with ID: ', docRef.id);
      // Reset form or show success message
    } catch (e) {
      console.error('Error adding document: ', e);
      setError('Error adding document: ' + e.message);
    }
  };

  return (
    <Form error={!!error}>
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
        {/* Placeholder for image upload, we'll need to implement the logic to handle file upload and storage */}
        <Input type='file' onChange={(e) => setImage(e.target.files[0])} />
      </Form.Field>
      {error && <Message error header='Error' content={error} />}
      <Button type='submit' onClick={handleSubmit}>Submit</Button>
    </Form>
  );
};

export default DuckAdmin;
