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
import HomeHeader from '../components/HomeHeader';
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
          distance: addedMiles,
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
    <div className="homeContainer">
      <HomeHeader
        code="" // No code input needed here usually
        setCode={() => { }}
        handleSearch={() => { }}
      />

      <div className="heroSection" style={{ height: '15vh', minHeight: '130px' }}>
        {/* Background handles the visual */}
      </div>

      <div className="profile-content" style={{ marginTop: '-80px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>
            <Loader active inline='centered' size='large'>Box...Box...</Loader>
          </div>
        ) : (
          <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', padding: '0' }}>
            {/* Duck Header Image - Blurred BG + Contain FG */}
            <div style={{ position: 'relative', height: '300px', overflow: 'hidden', borderRadius: '16px 16px 0 0', background: '#121212' }}>
              {/* Blurred Background for Ambiance */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: `url(${duckData.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(20px) brightness(0.7)',
                transform: 'scale(1.1)' // Prevent blur edges
              }} />

              {/* Actual Content Image */}
              <Image src={duckData.imageUrl} style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                zIndex: 1
              }} />

              {/* Title Overlay */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%',
                background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
                padding: '3rem 1.5rem 1rem',
                zIndex: 2
              }}>
                <h1 style={{ color: 'white', margin: 0, fontSize: '2.5rem', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{duckData.name}</h1>
              </div>
            </div>

            <div style={{ padding: '2rem' }}>
              <Segment textAlign='center' style={{ background: 'rgba(255,255,255,0.05)', color: '#ccc', border: 'none', marginBottom: '2rem' }}>
                Enter the country, then the city/port, and then the state of where you found {duckData.name}.
                If this duck was found on a cruise ship, please enter each port you visited.
              </Segment>

              <Form onSubmit={handleSubmit} className="custom-form">
                <Form.Field className="mobile-stack-container" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '2rem' }}>
                  <Checkbox
                    label={<label style={{ color: isOnCruise ? 'var(--neon-blue)' : 'white', fontWeight: 'bold' }}>Found on a Cruise Ship?</label>}
                    checked={isOnCruise}
                    onChange={(e, { checked }) => setIsOnCruise(checked)}
                    toggle
                  />
                  <Checkbox
                    label={<label style={{ color: isOnJeep ? 'var(--neon-blue)' : 'white', fontWeight: 'bold' }}>Found on a Jeep?</label>}
                    checked={isOnJeep}
                    onChange={(e, { checked }) => setIsOnJeep(checked)}
                    toggle
                  />
                </Form.Field>

                <Form.Field>
                  <label style={{ color: 'white' }}>Country</label>
                  <Dropdown
                    placeholder="Select Country"
                    fluid
                    search
                    selection
                    options={countryOptions}
                    value={country}
                    onChange={handleCountryChange}
                    className="custom-input-dropdown"
                  />
                </Form.Field>

                <Form.Field>
                  <label style={{ color: 'white' }}>City or Port</label>
                  <input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    disabled={!country}
                    className="custom-input"
                  />
                </Form.Field>

                {showStateDropdown && (
                  <Form.Field>
                    <label style={{ color: 'white' }}>State</label>
                    <Dropdown
                      placeholder="Select State"
                      fluid
                      search
                      selection
                      options={stateOptions}
                      value={state}
                      onChange={(e, { value }) => setState(value)}
                      className="custom-input-dropdown"
                    />
                  </Form.Field>
                )}

                <div className="mobile-buttons-container" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                  <Button
                    type="submit"
                    className="custom-btn"
                    style={{ flex: 1, background: 'var(--neon-blue)', color: 'black' }}
                  >
                    Submit Location
                  </Button>

                  <Link to={`/duck/${duckId}`} style={{ flex: 1 }}>
                    <Button
                      type="button"
                      className="custom-btn"
                      style={{ width: '100%', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </Form>
            </div>
            {/* Checkerboard footer removed for cleaner look, or can be kept if desired. I'll omit it for the "clean card" look. */}
          </div>
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
      <div className="footer">
        <p>© 2024 RaceDucks.com. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Keep on quackin'.</p>
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
