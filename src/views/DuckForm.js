import React, { useState, useEffect } from 'react';
import {
  Card,
  Image,
  Button,
  Form,
  ButtonOr,
  ButtonGroup,
  Segment,
  Dropdown,
  Loader,
  Checkbox
} from 'semantic-ui-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase/Config';
// import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Commented out for photo upload
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import axios from 'axios';
import logo from '../assets/images/Logo.png';
import StandardModal from '../components/StandardModal';
import CruiseModal from '../components/CruiseModal';
import JeepModal from '../components/JeepModal';

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
  // const [file, setFile] = useState(null); // Commented out for photo upload
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [addedMiles, setAddedMiles] = useState(0);
  const [isOnCruise, setIsOnCruise] = useState(false);
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [showCruiseModal, setShowCruiseModal] = useState(false);
  const [isOnJeep, setIsOnJeep] = useState(false);
  const [showJeepModal, setShowJeepModal] = useState(false);

  useEffect(() => {
    const fetchDuckData = async () => {
      const docRef = doc(db, 'ducks', duckId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setDuckData(docSnap.data());
      }
    };

    fetchDuckData();
  }, [duckId]);

  const getCoordinates = async (city, state, country) => {
    const fullAddress = `${city}, ${state}, ${country}`;
    const encodedAddress = encodeURIComponent(fullAddress);

    try {
      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);
      setIsLoading(false);

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        return { latitude: lat, longitude: lng };
      } else {
        return null;
      }
    } catch (error) {
      return null;
    }
  };

  const resetFormFields = () => {
    setCity('');
    setState('');
    setCountry('');
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

    // let uploadedImageUrl = null;
    // if (file) {
    //   const storage = getStorage();
    //   const fileRef = ref(storage, `unapproved_photos/${file.name}-${Date.now()}`);
    //   try {
    //     const snapshot = await uploadBytes(fileRef, file);
    //     uploadedImageUrl = await getDownloadURL(snapshot.ref);
    //   } catch (error) {
    //     alert("An error occurred while uploading the photo. Please try again.");
    //     setIsLoading(false);
    //     return;
    //   }
    //   await addDoc(collection(db, 'photos'), {
    //     duckId,
    //     photoURL: uploadedImageUrl,
    //     approved: false
    //   });
    // }

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
        newDistance += Math.round(distanceToAdd * 0.621371);
        const addedMiles = Math.round(distanceToAdd * 0.621371);
        setAddedMiles(addedMiles);
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
            // imageUrl: uploadedImageUrl // Commented out for photo upload
          },
          timestamp: new Date(),
        });
      }

      // Check if the duck was found on a Jeep
      if (isOnJeep) {
        setShowJeepModal(true);
        setShowStandardModal(false);
        setShowCruiseModal(false);
      } else if (isOnCruise) {
        setShowCruiseModal(true);
        setShowStandardModal(false);
      } else {
        setShowStandardModal(true);
        setShowCruiseModal(false);
      }
      setIsLoading(false);
    } catch (error) {
      alert("An error occurred while updating the location. Please try again.");
      setIsLoading(false);
    }
  };


  const handleCountryChange = (e, { value }) => {
    setCountry(value);
    setShowStateDropdown(value === 'USA');
  };

  return (
    <div className="header">
      <div className="headerLogo">
        <Link to="/Home">
          <Image src={logo} size='small' />
        </Link>
      </div>
      <div style={styles.homeContainer}>
        {isLoading ? (
          <Loader active inline='centered' />
        ) : (
          <Card>
            <Card.Header as='h2'>{duckData.name}</Card.Header>
            <Image src={duckData.imageUrl} wrapped ui={false} />
            <Card.Content>
              <Segment textAlign='center'>
                Enter the country, then the city/port, and then the state of where you found {duckData.name}.
                If this duck was found on a cruise ship, please enter each port you visited.
              </Segment>
              <Form onSubmit={handleSubmit}>
                <Form.Field>
                  <Checkbox
                    label="Found on a cruise ship?"
                    checked={isOnCruise}
                    onChange={(e, { checked }) => setIsOnCruise(checked)}
                  />
                   <Checkbox
                    label="Found on a Jeep?"
                    checked={isOnJeep}
                    onChange={(e, { checked }) => setIsOnJeep(checked)}
                  />
                </Form.Field>
                <Form.Field>
                  <label>Country</label>
                  <Dropdown
                    placeholder="Select Country"
                    fluid
                    search
                    selection
                    options={countryOptions}
                    value={country}
                    onChange={handleCountryChange}
                  />
                </Form.Field>
                <Form.Field>
                  <label>City or Port</label>
                  <input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!country}
                  />
                </Form.Field>
                {showStateDropdown && (
                  <Form.Field>
                    <label>State</label>
                    <Dropdown
                      placeholder="Select State"
                      fluid
                      search
                      selection
                      options={stateOptions}
                      value={state}
                      onChange={(e, { value }) => setState(value)}
                    />
                  </Form.Field>
                )}
                {/* <Form.Field>
                  <label>Upload a photo (optional)</label>
                  <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                </Form.Field> */}
                <ButtonGroup>
                  <Button color="orange" type="submit">Submit Location</Button>
                  <ButtonOr />
                  <Link to="/Home">
                    <Button color="grey">Leaderboard</Button>
                  </Link>
                </ButtonGroup>
              </Form>
            </Card.Content>
            <div style={styles.checkerboardFooter}></div>
          </Card>
        )}
      </div>
      <StandardModal
        open={showStandardModal}
        onClose={() => {
          setShowStandardModal(false);
          navigate(`/duck/${duckId}`);
        }}
        duckName={duckData.name}
        addedMiles={addedMiles}
      />
      <JeepModal
        open={showJeepModal}
        onClose={() => {
          setShowJeepModal(false);
          navigate(`/duck/${duckId}`);
        }}
        duckName={duckData.name}
        addedMiles={addedMiles}
      />
      <CruiseModal
        open={showCruiseModal}
        onClose={() => setShowCruiseModal(false)}
        onAddAnotherPort={() => {
          resetFormFields();
          setShowCruiseModal(false);
        }}
        onFinish={() => {
          setShowCruiseModal(false);
          navigate(`/duck/${duckId}`);
        }}
        duckName={duckData.name}
        addedMiles={addedMiles}
      />
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
    maxWidth: '100vw', // Ensure the container does not exceed the viewport width
    padding: '0 20px', // Add some padding to prevent content from touching the screen edges
  },
  
  checkerboardFooter: {
    width: '100%',
    height: '50px',
    backgroundSize: '20px 20px',
    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
};
