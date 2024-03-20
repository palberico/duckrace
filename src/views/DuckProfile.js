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


const DuckProfile = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);
  const [duckLocations, setDuckLocations] = useState([]);
  // const [userImages, setUserImages] = useState([]);


  useEffect(() => {

    // const fetchUserImages = async () => {
    //   const imagesQuery = query(
    //     collection(db, 'photos'),
    //     where('duckId', '==', duckId),
    //     where('approved', '==', true),
    //     limit(5)
    //   );
    //   const querySnapshot = await getDocs(imagesQuery);
    //   setUserImages(querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    // };

    // fetchUserImages();
  


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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duckId]);

  const geocodeAndSaveLocation = async (city, state, country) => {
    const address = `${city}, ${state}, ${country}`;
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY; // Ensure you have defined this environment variable
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

  // const mapCards = duckLocations.map((location, index) => (
  //   <div className="map-card-wrapper" key={location.id || index}>
  //     <MapCard location={location} />
  //   </div>
  // ));

  

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
        {/* <Button className="orange-gray-gradient-button" onClick={handleOpen}>I Found {duckData.name}</Button> */}
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

        {/* Horizontal scroll for maps and images */}
        
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


        <div>
          {duckLocations.map((location, index) => (
            <MapCard key={location.id || index} location={location} />
          ))}
        </div>

        {/* User images container */}
       
{/* <Slider {...settings}>
  {userImages.map((image) => (
    <div key={image.id}>
      <img src={image.photoURL} alt="User uploaded" style={{ width: "100%", height: "auto" }} />
    </div>
  ))}
</Slider> */}



  
      </Grid>

      <Modal open={open} onClose={handleClose} size='small'>
        <Header>Enter {duckData.name}'s Six Digit Code.</Header> 
        <Modal.Content>
          <p>To log distances for this duck, please enter its unique code:</p>
          <Input value={code} onChange={(e) => setCode(e.target.value)} fluid />
          {isCodeIncorrect && (
            <Message negative>
              <Message.Header>Incorrect Code</Message.Header>
              <p>Please try again.</p>
            </Message>
          )}
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button positive onClick={handleCodeSubmit}>Submit</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default DuckProfile;
