import React, { useEffect, useState } from 'react';
import {
  Button, ButtonOr, ButtonGroup, Grid, Image, Loader, Message,
  Header, Segment, CardGroup, Card
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

    setLoading(true);
    Promise.all([fetchDuckData(), fetchLocations()]).then(() => setLoading(false));
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
    return <Loader active inline="centered" size="massive">Loading...</Loader>;
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

  return (
    <>
      <Grid container stackable>
        <CardGroup centered>
          <Card className="main-duck-card" style={{ marginTop: '50px' }}>
            <Header as="h1" textAlign="center" style={{ paddingTop: '20px' }}>{duckData.name}</Header>
            <Image src={duckData.imageUrl} size="large" wrapped ui={false} />
            <Grid.Row>
              <Grid.Column style={{ padding: '10px' }}>
                <p className="large-text"><strong>Current Position:</strong> {duckData.position}</p>
                <p className="large-text"><strong>Distance:</strong> {duckData.distance} Miles</p>
                <p className="large-text"><strong>Last Place Found:</strong> {formatLastLocation(duckData.lastLocation)}</p>
                <p className="large-text"><strong>Hometown:</strong> {duckData.hometown}</p>
                <div className="button-group-container">
                  <ButtonGroup style={{ marginBottom: '10px' }}>
                    <Button color="orange" onClick={handleOpen}>I Found {duckData.name}</Button>
                    <ButtonOr />
                    <Link to="/Home">
                      <Button color="grey">Leaderboard</Button>
                    </Link>
                  </ButtonGroup>
                </div>
              </Grid.Column>
            </Grid.Row>
          </Card>
          <Card>
            <Segment as="h3" dangerouslySetInnerHTML={{ __html: duckData.bio }}></Segment>
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
