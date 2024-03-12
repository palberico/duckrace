import React, { useEffect, useState } from 'react';
import { Button, ButtonOr, ButtonGroup, Grid, Image, Loader, Message, Modal, Header, Input, Segment, CardGroup, Card } from 'semantic-ui-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/Config';
import '../Profile.css';
import Images from '../assets/images/IMG_0598.WEBP';

const DuckProfile = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState(null);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);

  useEffect(() => {
    const fetchDuckData = async () => {
      try {
        const q = query(collection(db, 'ducks'), orderBy('distance', 'desc'));
        const querySnapshot = await getDocs(q);
        const ducks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const currentDuckIndex = ducks.findIndex(duck => duck.id === duckId);
        if (currentDuckIndex !== -1) {
          setDuckData(ducks[currentDuckIndex]);
          setPosition(`P${currentDuckIndex + 1}`);
        } else {
          console.error('No such document!');
        }
      } catch (error) {
        console.error('Error getting document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDuckData();
  }, [duckId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleCodeSubmit = () => {
    if (code === duckData.code) {
      navigate(`/log-distance/${duckId}`);
    } else {
      setIsCodeIncorrect(true);
      setCode('');
    }
  };

  // const handleBack = () => navigate(-1);

  if (loading) {
    return <Loader active inline='centered' size='massive'>Box...Box...</Loader>;
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

  return (
    <>
      <Grid container stackable>
        <CardGroup centered>
          <Card style={{ marginTop: '50px' }}>
            <Header as='h1' textAlign='center' style={{ paddingTop: '20px' }}>{duckData.name}</Header>
            <Image src={duckData.image} size="large" />
          <Grid.Row>
            <Grid.Column style={{ padding: '10px'}}>
              <p className="large-text"><strong>Current Position:</strong> {position}</p>
              <p className="large-text"><strong>Distance:</strong> {duckData.distance} Miles</p>
              <p className="large-text"><strong>Last Place Found:</strong> {formatLastLocation(duckData.lastLocation)}</p>
              <p className="large-text"><strong>Hometown:</strong> {duckData.hometown}</p> 
              <ButtonGroup style={{marginBottom: '10px'}}>
                <Button color='orange' onClick={handleOpen}>I Found {duckData.name}</Button>
        {/* <Button className="orange-gray-gradient-button" onClick={handleOpen}>I Found {duckData.name}</Button> */}
                <ButtonOr />
                <Link to="/Home">
                <Button color='grey'>Leaderboard</Button>
                </Link>
              </ButtonGroup>
            </Grid.Column>
          </Grid.Row>
          </Card>

          <Card>
            <Grid.Row>
              <Grid.Column width={16}>
                <Segment as='h3' dangerouslySetInnerHTML={{ __html: duckData.longBio }}></Segment>
              </Grid.Column>
            </Grid.Row>
          </Card>
        </CardGroup>

        {/* Horizontal scroll for maps and images */}
        <Grid.Row centered>
          {/* Maps placeholder */}
          <Card style={{ marginTop: '20px' }}>
            <Header textAlign='center' style={{ paddingTop: '20px' }}>Maps</Header>
            <div className="map-cards-group">
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              {/* ... other images or components */}
            </div>
          </Card>
          <Card style={{ marginBottom: '50px' }}>
            <Header textAlign='center' style={{ paddingTop: '20px' }}>User Images</Header>
            <div className="image-scroll-container">
              {/* Images placeholder */}
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              {/* ... other images */}
            </div>
          </Card>
        </Grid.Row>
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
