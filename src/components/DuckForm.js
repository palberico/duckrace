import React, { useState, useEffect } from 'react';
import { Card, Image, Button, Form, ButtonOr, ButtonGroup, Segment, Dropdown, Loader } from 'semantic-ui-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/Config';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import axios from 'axios';
import logo from '../assets/images/Logo.png'

import countryOptions from '../components/data/Countries';
import stateOptions from '../components/data/States';
import { getDistanceFromLatLonInKm } from '../components/data/geoUtils';


const DuckForm = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState({});
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // const [error, setError] = useState('');
  const [file, setFile] = useState(null);


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
      console.log(process.env.REACT_APP_GOOGLE_MAPS_API_KEY);
      setIsLoading(false); // Stop loading
      
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        const result = { latitude: lat, longitude: lng };
        console.log(result); // Log the result to debug
        return result;
      } else {
        // setError(response.data.error_message || 'Failed to geocode address');
        return null; // Make sure to return null if geocoding fails
      }

    } catch (error) {
      // setError(error.message);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    const newLocationCoordinates = await getCoordinates(city, state, country);
  
    if (!newLocationCoordinates) {
      alert('Failed to get geolocation data. Please check the city, state, and country values and try again.');
      setIsLoading(false);
      return;
    }
  
    let uploadedImageUrl = null;
    if (file) {
      // Start of new code for file upload
      const storage = getStorage();
      const fileRef = ref(storage, `unapproved_photos/${file.name}-${Date.now()}`);
      try {
        const snapshot = await uploadBytes(fileRef, file);
        uploadedImageUrl = await getDownloadURL(snapshot.ref);
      } catch (error) {
        console.error("Error uploading file: ", error);
        alert("An error occurred while uploading the photo. Please try again.");
        setIsLoading(false);
        return;
      }
      await addDoc(collection(db, 'photos'), {
        duckId,
        photoURL: uploadedImageUrl,
        approved: false
      });
      // End of new code for file upload
    }
  
    try {
      const duckRef = doc(db, 'ducks', duckId);
      const duckSnap = await getDoc(duckRef);
  
      if (!duckSnap.exists()) {
        alert('Duck not found in the database.');
        setIsLoading(false);
        return;
      }
  
      const duckData = duckSnap.data();
    const startLocation = duckData.lastLocation ?? duckData.startLocation;

    let newDistance = duckData.distance || 0;
    if (startLocation && startLocation.coordinates) {
      const distanceToAdd = getDistanceFromLatLonInKm(
        startLocation.coordinates.latitude,
        startLocation.coordinates.longitude,
        newLocationCoordinates.latitude,
        newLocationCoordinates.longitude
      );
      newDistance += Math.round(distanceToAdd * 0.621371); // Convert km to miles and round the result
    }
  
      await updateDoc(duckRef, {
        lastLocation: {
          city,
          state,
          country,
          coordinates: newLocationCoordinates
        },
        distance: newDistance
      });
  
      if (startLocation && startLocation.coordinates) {
        const locationsRef = collection(db, 'locations');
        await addDoc(locationsRef, {
          duckId,
          startLocation: startLocation,
          newLocation: {
            city,
            state,
            country,
            coordinates: newLocationCoordinates,
            imageUrl: uploadedImageUrl // Add the uploaded image URL here
          },
          timestamp: new Date(),
        });
      }

      const addedMiles = Math.round(getDistanceFromLatLonInKm(
        startLocation.coordinates.latitude,
        startLocation.coordinates.longitude,
        newLocationCoordinates.latitude,
        newLocationCoordinates.longitude
      ) * 0.621371);
  
      alert(`Thanks for logging miles for ${duckData.name}! You added ${addedMiles} miles to my journey.`);
  
      navigate(`/duck/${duckId}`);
    } catch (error) {
      console.error("Error updating document: ", error);
      alert("An error occurred while updating the location. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="header">
        <div className="headerLogo">
          <Link to="/Home">
           <Image src={logo} size='small' />
          </Link>
        </div>
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
              <Form.Field>
        <label>Upload a photo (optional)</label>
        <input type='file' onChange={(e) => setFile(e.target.files[0])} />
      </Form.Field>
      {/* Submit button and other parts of the form... */}
    
              <ButtonGroup>
                <Button color='orange' type='submit'>Submit Location</Button>
                <ButtonOr />
                <Link to="/Home">
                  <Button color='grey'>Leaderboard</Button>
                </Link>
              </ButtonGroup>
            </Form>
          </Card.Content>
          <div style={styles.checkerboardFooter}></div>
        </Card>
      )}
    </div>
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
