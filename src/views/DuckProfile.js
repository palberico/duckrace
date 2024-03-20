import React, { useEffect, useState } from 'react';
import {
  Button, ButtonOr, ButtonGroup, Grid, Image, Loader, Message, Modal,
  Header, Input, Segment, CardGroup, Card
} from 'semantic-ui-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, getDoc, query, orderBy, doc, updateDoc, GeoPoint, limit, where } from 'firebase/firestore';
import { db } from '../firebase/Config';
import '../Profile.css';
import MapCard from '../components/MapCard';
import DuckCodeModal from '../components/DuckCodeModal';


const DuckProfile = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);
  const [duckLocations, setDuckLocations] = useState([]);



  useEffect(() => {

    const fetchDuckData = async () => {
      const duckRef = doc(db, 'ducks', duckId);
      const docSnap = await getDoc(duckRef);

      if (docSnap.exists()) {
        setDuckData(docSnap.data());
      } else {
        console.error('No such duck!');
      }
    };

    const fetchLocations = async () => {
      const locationsQuery = query(
        collection(db, 'locations'),
        where('duckId', '==', duckId),
        orderBy('timestamp', 'desc'),
        limit(5)
      );
      const querySnapshot = await getDocs(locationsQuery);
      setDuckLocations(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };

    setLoading(true);
    Promise.all([fetchDuckData(), fetchLocations()]).then(() => {
      setLoading(false);
    });

  }, [duckId]);

  const geocodeAndSaveLocation = async (city, state, country) => {
    const address = `${city}, ${state}, ${country}`;
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; 
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      if (data.status === 'OK') {
        const { lat, lng } = data.results[0].geometry.location;
        const coordinates = new GeoPoint(lat, lng);
        await updateDuckLastLocation(coordinates);
      } else {
        console.error('Geocoding failed:', data.status);
      }
    } catch (error) {
      console.error('Error fetching geocode:', error);
    }
  };

  const updateDuckLastLocation = async (coordinates) => {
    const duckRef = doc(db, 'ducks', duckId);
    await updateDoc(duckRef, {
      'lastLocation.coordinates': coordinates
    });
  };

  const handleCodeSubmit = async () => {
    if (code === duckData.code) {
      if (duckData.lastLocation && duckData.lastLocation.city && duckData.lastLocation.state && duckData.lastLocation.country) {
        await geocodeAndSaveLocation(duckData.lastLocation.city, duckData.lastLocation.state, duckData.lastLocation.country);
      }
      navigate(`/log-distance/${duckId}`);
    } else {
      setIsCodeIncorrect(true);
      setCode('');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (loading) {
    return <Loader active inline='centered' size='massive'>Changing Tires</Loader>;
  }

  if (!duckData) {
    return <Message error header="Error" content="No Duck Found" />;
  }

  const formatLastLocation = (lastLocation) => {
    if (!lastLocation || typeof lastLocation !== 'object') {
      return 'Not yet found';
    }
    const { city, state, country } = lastLocation;
    return [city, state, country].filter(Boolean).join(', ');
  };

  console.log('Duck Locations:', duckLocations);

  

  return (
    <>
      <Grid container stackable>
        <CardGroup centered>
          <Card className="main-duck-card" style={{ marginTop: '50px' }}>
            <Header as='h1' textAlign='center' style={{ paddingTop: '20px' }}>{duckData.name}</Header>
            <Image src={duckData.imageUrl} size="large" />
          <Grid.Row>
            <Grid.Column style={{ padding: '10px'}}>
              <p className="large-text"><strong>Current Position:</strong> {duckData.position}</p>
              <p className="large-text"><strong>Distance:</strong> {duckData.distance} Miles</p>
              <p className="large-text"><strong>Last Place Found:</strong> {formatLastLocation(duckData.lastLocation)}</p>
              <p className="large-text"><strong>Hometown:</strong> {duckData.hometown}</p> 
              
              <div className={`button-group-container`}>
              <ButtonGroup style={{marginBottom: '10px'}}>
                <Button color='orange' onClick={handleOpen}>I Found {duckData.name}</Button>
                <ButtonOr />
                <Link to="/Home">
                <Button color='grey'>Leaderboard</Button>
                </Link>
              </ButtonGroup>
              </div>

            </Grid.Column>
          </Grid.Row>
          </Card>

          <Card>
            <Grid.Row>
              <Grid.Column width={16}>
                <Segment as='h3' dangerouslySetInnerHTML={{ __html: duckData.bio }}></Segment>
              </Grid.Column>
            </Grid.Row>
          </Card>
        </CardGroup>

        
        <div className="map-cards-container">
  {duckLocations.map((location, index) => (
    <div key={location.id || index} className="map-card">
      <Card>
        <Card.Content>
          <Card.Header>Maps</Card.Header>
        </Card.Content>
        <MapCard location={location} />
      </Card>
    </div>
  ))}
</div>

      </Grid>

      <DuckCodeModal
      open={open}
      handleClose={handleClose}
      code={code}
      setCode={setCode}
      isCodeIncorrect={isCodeIncorrect}
      handleCodeSubmit={handleCodeSubmit}
      duckName={duckData ? duckData.name : ''}
    />
    </>
  );
};

export default DuckProfile;
