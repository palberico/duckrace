import React, { useEffect, useState } from 'react';
import {
  Button, ButtonOr, ButtonGroup, Grid, Image, Loader, Message,
  Header, CardGroup, Card
} from 'semantic-ui-react';
import { 
  collection, getDocs, getDoc, query, orderBy, doc, 
  limit, where 
} from 'firebase/firestore';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DuckCodeModal from '../components/DuckCodeModal';
import MapCard from '../components/MapCard';
import { db } from '../firebase/Config';
import '../Profile.css';
import '../App.css';
import logo from '../assets/images/Logo.png';
import PositionBadge from '../components/PositionBadge';
import LocationsCard from '../components/LocationsCard';


import countryOptions from '../components/data/Countries';

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
      setDuckLocations(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    const calculatePosition = async () => {
      const allDucksQuery = query(collection(db, 'ducks'), orderBy('distance', 'desc'));
      const allDucksSnapshot = await getDocs(allDucksQuery);
      const ducks = allDucksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const duckIndex = ducks.findIndex(duck => duck.id === duckId);
      const position = duckIndex !== -1 ? `P${duckIndex + 1}` : 'N/A';
      return position;
    };

    setLoading(true);
    Promise.all([fetchDuckData(), fetchLocations()])
      .then(async () => {
        const position = await calculatePosition();
        setDuckData(prevData => ({ ...prevData, position }));
        setLoading(false);
      });
  }, [duckId]);

  const handleCodeSubmit = async () => {
    if (code === duckData.code) {
      navigate(`/log-distance/${duckId}`);
    } else {
      setIsCodeIncorrect(true);
      setCode('');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
                <Loader active inline='centered' size='massive'>Box..Box...</Loader>
            </div>
    );
  }

  if (!duckData) {
    return <Message error header="Error" content="No Duck Found" />;
  }

  const formatLastLocation = (lastLocation) => {
    if (!lastLocation || typeof lastLocation !== 'object') {
      return 'Not yet found';
    }
    return [lastLocation.city, lastLocation.state, lastLocation.country].filter(Boolean).join(', ');
  };

  const getCountryFullName = (countryCode) => {
    const country = countryOptions.find(option => option.key === countryCode.toLowerCase());
    return country ? country.text : countryCode;
  };

  const goToLeaderboard = () => {
    navigate('/Home', { state: { focusLeaderboard: true, timestamp: new Date() } });
  };

  return (
    <>
     <div className="header">
        <div className="headerLogo">
          <Link to="/Home">
           <Image src={logo} size='small' />
          </Link>
        </div>
      <Grid container stackable>
        <CardGroup centered>
          <Card className="main-duck-card" style={{ marginTop: '50px' }}>
            <Header as="h1" textAlign="center" style={{ paddingTop: '20px' }}>{duckData.name}</Header>
            <Image src={duckData.imageUrl} size="large" wrapped ui={false} />
            <Grid.Row>
              <Grid.Column style={{ padding: '10px' }}>
                <p className="large-text"><strong>Current Position:</strong><PositionBadge position={duckData.position} /></p>
                <p className="large-text"><strong>Distance Traveled:</strong> {duckData.distance} Miles</p>
                <p className="large-text"><strong>Last Place Found:</strong> {formatLastLocation(duckData.lastLocation)}</p>
                <p className="large-text"><strong>Hometown:</strong> {duckData.hometown}</p>
                <div className="button-group-container">
                  <ButtonGroup style={{ marginBottom: '10px' }}>
                    <Button color="orange" onClick={handleOpen}>I Found {duckData.name}</Button>
                    <ButtonOr />
                    
                    <Button color="grey" onClick={goToLeaderboard}>Leaderboard</Button>
                    
                  </ButtonGroup>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Card>
       
            <Card.Header 
              as="h3" 
              dangerouslySetInnerHTML={{ __html: duckData.bio }} 
              style={{ marginBottom: '10px' }}>
            </Card.Header>
            
         
        </CardGroup>

        <div className="map-cards-container">
          {duckLocations.map((location, index) => {
            const isLocationAvailable = location.startLocation && location.newLocation;

            return (
              <div key={location.id || index} className="map-card">
                <Card> 
                  <Card.Content>
                    {isLocationAvailable ? (
                <>
                  <Card.Meta>
                    <strong>Start:</strong> {location.startLocation.state 
                      ? `${location.startLocation.city}, ${location.startLocation.state}`
                      : `${location.startLocation.city}, ${getCountryFullName(location.startLocation.country)}`}
                  </Card.Meta>
                  <Card.Meta>
                    <strong>End:</strong> {location.newLocation.state 
                      ? `${location.newLocation.city}, ${location.newLocation.state}`
                      : `${location.newLocation.city}, ${getCountryFullName(location.newLocation.country)}`}
                  </Card.Meta>
                </>
              ) : (
                <Card.Description>
                  Location Information Unavailable
                </Card.Description>
              )}
            </Card.Content>
                  <MapCard location={location} />
                </Card>
              </div>
            );
          })}
        </div>
          <LocationsCard duckId={duckId} /> 
          <div style={styles.checkerboardFooter}></div>
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
      </div>
    </>
  );
};

export default DuckProfile;

const styles = {
  checkerboardFooter: {
      width: '100%',
      height: '50px',
      backgroundSize: '20px 20px',
      backgroundImage: 
          `linear-gradient(45deg, #000 25%, transparent 25%), 
           linear-gradient(-45deg, #000 25%, transparent 25%), 
           linear-gradient(45deg, transparent 75%, #000 75%), 
           linear-gradient(-45deg, transparent 75%, #000 75%)`,
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      marginTop: '20px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};

