// DuckProfile.js
import React, { useEffect, useState } from 'react';
import { Button, Grid, Image, Loader, Message, Modal, Header, Input, Segment } from 'semantic-ui-react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/Config';
import '../Profile.css';
import Images from '../assets/images/IMG_0598.WEBP';

const DuckProfile = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);

  useEffect(() => {
    const fetchDuckData = async () => {
      try {
        const docRef = doc(db, 'ducks', duckId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDuckData(docSnap.data());
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
  const handleCodeSubmit = () => {
    if (code === duckData.code) {
      navigate(`/log-distance/${duckId}`);
    } else {
      setIsCodeIncorrect(true);
      setCode('');
    }
  };

  if (loading) {
    return <Loader active inline="centered">Box..Box...Box...</Loader>;
  }

  if (!duckData) {
    return <Message error header="Error" content="No Duck Data" />;
  }

  const handleBack = () => navigate(-1);

  return (
    <>
      <Grid container stackable>
  <Grid.Row>
    <Grid.Column width={16}>
      <Image src={duckData.image} size="large" />
      <Header textAlign='center'>{duckData.name}</Header>
    </Grid.Column>
  </Grid.Row>
  <Grid.Row>
    <Grid.Column width={16}>
      <Segment>
        <p><strong>Position:</strong> {duckData.position}</p>
        <p><strong>Distance:</strong> {duckData.distance}</p>
        <p><strong>Last Place Found:</strong> {duckData.lastPlace}</p>
        <p><strong>Hometown:</strong> {duckData.hometown}</p>
        <Button color='orange' onClick={handleOpen}>More Details</Button>
        <Button color='grey' onClick={handleBack}>Back</Button>
      </Segment>
    </Grid.Column>
  </Grid.Row>
  <Grid.Row>
    <Grid.Column width={16}>
      <Segment>
        {duckData.shortBio}
      </Segment>
    </Grid.Column>
  </Grid.Row>

        {/* Horizontal scroll for maps and images */}
        <Grid.Row>
          <Grid.Column width={16}>
            <div className="map-cards-group">
              {/* Maps placeholder */}
              {/* Replace <Image /> with actual map cards when available */}
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              {/* ... other images or components */}
            </div>
            <div className="image-scroll-container">
              {/* Images placeholder */}
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              <Image src={Images} />
              {/* ... other images */}
            </div>
          </Grid.Column>
        </Grid.Row>
      </Grid>

      <Modal open={open} onClose={() => setOpen(false)} size='small'>
        <Header content='Enter Duck Code' />
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
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button positive onClick={handleCodeSubmit}>Submit</Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default DuckProfile;
