import React, { useState } from 'react';
import { Button, Form, Input, Message, Segment, Header, Dropdown, Loader } from 'semantic-ui-react';
import { addDoc, collection, GeoPoint, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { db } from '../firebase/Config';
import countryOptions from '../components/data/Countries';
import stateOptions from '../components/data/States';

const DuckAdmin = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [bio, setBio] = useState('');
  const [hometown, setHometown] = useState('');
  const [startLocation, setStartLocation] = useState({ city: '', state: '', country: '' });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [deleteInput, setDeleteInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteInputChange = (e) => {
    setDeleteInput(e.target.value);
  };

  const getCoordinates = async (address) => {
    setIsLoading(true); // Start loading
    try {
      const fullAddress = `${address.city}, ${address.state}, ${address.country}`;
      const encodedAddress = encodeURIComponent(fullAddress);

      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setIsLoading(false); // Stop loading
        return new GeoPoint(lat, lng);
      } else {
        throw new Error(response.data.error_message || 'Failed to geocode address');
      }
    } catch (error) {
      setError(`Geocoding failed: ${error.message}`);
      console.error('Error getting coordinates:', error);
      setIsLoading(false); // Stop loading
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError('');
  
    // Optional: Validate the bio word count
    if (!validateBioWordCount(bio)) {
      setError('Bio must be 100 words or less.');
      setIsLoading(false); // Stop loading
      return;
    }
  
    // Continue with image upload if an image is selected
    if (image) {
      const storage = getStorage();
      const storageRef = ref(storage, `ducks/${image.name}-${Date.now()}`); // Unique path for each image
  
      try {
        const uploadTaskSnapshot = await uploadBytes(storageRef, image);
        const imageUrl = await getDownloadURL(uploadTaskSnapshot.ref);
  
        // Proceed with the rest of the form submission once you have the image URL
        const coordinates = await getCoordinates(startLocation);
  
        if (!coordinates) {
          setError('Failed to get coordinates for the location.');
          setIsLoading(false); // Stop loading
          return;
        }
  
        // Add the bio and hometown fields to the document being added to Firestore
        const docRef = await addDoc(collection(db, 'ducks'), {
          name,
          code,
          startLocation: {
            ...startLocation,
            coordinates,
          },
          imageUrl, 
          bio,
          hometown, 
        });
  
        console.log('Document written with ID: ', docRef.id);
        // Reset form fields after successful submission
      } catch (error) {
        console.error('Error during the image upload or document creation:', error);
        setError(`Error during the image upload or document creation: ${error.message}`);
      } finally {
        setIsLoading(false); // Stop loading
      }
    } else {
      setError('No image selected for upload.');
      setIsLoading(false); // Stop loading
    }
  
    // Reset form states and bio after processing
    setName('');
    setCode('');
    setStartLocation({ city: '', state: '', country: '' });
    setImage(null);
    setBio('');
    setHometown(''); 
  };

  

//Delete Logic below:

const handleDeleteDuck = async () => {
  if (!deleteInput.trim()) return;

  const storage = getStorage();

  try {
    const ducksRef = collection(db, 'ducks');
    const nameQuery = query(ducksRef, where("name", "==", deleteInput.trim()));
    const codeQuery = query(ducksRef, where("code", "==", deleteInput.trim()));

    const [nameSnapshot, codeSnapshot] = await Promise.all([
      getDocs(nameQuery),
      getDocs(codeQuery)
    ]);

    const docsToDelete = [...nameSnapshot.docs, ...codeSnapshot.docs];

    for (const doc of docsToDelete) {
      const duckData = doc.data();

      if (duckData.imageUrl) {
        // Decode the entire URL
        const decodedUrl = decodeURIComponent(duckData.imageUrl);

        // Extract the path part of the URL
        const parts = decodedUrl.split('/o/');
        const pathAndToken = parts[1].split('?');
        const imagePath = pathAndToken[0]; // This is the path Firebase Storage needs

        // Create a reference to the file to delete
        const imageRef = ref(storage, imagePath);

        // Delete the file
        await deleteObject(imageRef);
      }

      // Delete the Firestore document
      await deleteDoc(doc.ref);
    }

    console.log(`${docsToDelete.length} duck(s) deleted.`);
  } catch (error) {
    console.error("Error deleting duck:", error);
    setError(`Error deleting duck: ${error.message}`);
  }

  setDeleteInput(''); // Clear the delete input field
};

const validateBioWordCount = (text) => {
  const words = text.trim().split(/\s+/); // Split based on one or more whitespace characters
  return words.length <= 100;
};
  

  return (
    <>
    {isLoading && <Loader active inline='centered'>Processing...</Loader>}
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
          <label>Bio (up to 100 words)</label>
            <textarea
              placeholder='Enter Bio Here...'
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
        </Form.Field>
        <Form.Field>
          <label>Hometown</label>
            <Input
              placeholder='Enter Hometown'
              value={hometown}
              onChange={(e) => setHometown(e.target.value)}
            />
        </Form.Field>
        <Form.Field>
          <label>Start Location</label>
          <Input
            placeholder='Enter City'
            value={startLocation.city}
            onChange={(e) => setStartLocation({ ...startLocation, city: e.target.value })}
          />
          <Dropdown
            placeholder="Select State"
            fluid
            search
            selection
            options={stateOptions}
            value={startLocation.state}
            onChange={(e, { value }) => setStartLocation({ ...startLocation, state: value })}
          />
          <Dropdown
            placeholder="Select Country"
            fluid
            search
            selection
            options={countryOptions}
            value={startLocation.country}
            onChange={(e, { value }) => setStartLocation({ ...startLocation, country: value })}
            
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
      <Segment padded="very" style={{ maxWidth: '600px', margin: '0 auto', marginTop: '20px' }}>
  <Header as='h2' textAlign='center'>Delete Duck</Header>
  <Form onSubmit={handleDeleteDuck}>
    <Form.Field>
      <Input
        placeholder='Enter Duck Name or Code'
        value={deleteInput}
        onChange={handleDeleteInputChange}
      />
    </Form.Field>
    <Button type='submit' color='red'>Gone Foreves</Button>
  </Form>
</Segment>

    </Segment>
    </>
  );
};

export default DuckAdmin;