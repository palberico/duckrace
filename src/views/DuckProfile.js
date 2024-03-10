import React, { useEffect, useState } from 'react';
import { 
  Button,
  ButtonOr,
  ButtonGroup, 
  Grid, 
  Image, 
  Loader, 
  Message, 
  Modal, 
  Header, 
  Input, 
  Segment, 
  CardGroup,
  Card,
 } from 'semantic-ui-react';
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
  const handleClose = () => setOpen(false);
  const handleCodeSubmit = () => {
    if (code === duckData.code) {
      navigate(`/log-distance/${duckId}`);
    } else {
      setIsCodeIncorrect(true);
      setCode('');
    }
  };

  const handleBack = () => navigate(-1);

  if (loading) {
    return <Loader active inline="centered">Loading Duck...</Loader>;
  }

  if (!duckData) {
    return <Message error header="Error" content="No Duck Data" />;
  }

return (
 <>
  <Grid container stackable>
   <CardGroup centered>
   <Card style={{ marginTop: '50px' }}>
    <Header textAlign='center' style={{ paddingTop: '20px' }}>{duckData.name}</Header>
      <Image src={duckData.image} size="large" />
   </Card>
    <Grid.Row>
     <Grid.Column width={16}>
      <p><strong>Position:</strong> {duckData.position}</p>
      <p><strong>Distance:</strong> {duckData.distance}</p>
      <p><strong>Last Place Found:</strong> {duckData.lastPlace}</p>
      <p><strong>Hometown:</strong> {duckData.hometown}</p>
       <ButtonGroup>
        <Button color='orange' onClick={handleOpen}>I Found {duckData.name}</Button>
          <ButtonOr />
        <Button color='grey' onClick={handleBack}>Leaderboard</Button>
       </ButtonGroup>
     </Grid.Column>
    </Grid.Row>

    <Card>
     <Grid.Row>
      <Grid.Column width={16}>
       <Segment>
        {duckData.shortBio}
       </Segment>
      </Grid.Column>
     </Grid.Row>
    </Card>
   </CardGroup>

{/* Horizontal scroll for maps and images */}

  <Grid.Row centered>
{/* Maps placeholder */}
   <Card style={{ marginTop: '20px' }}>
    <div className="map-cards-group">
      <Image src={Images} />
      <Image src={Images} />
      <Image src={Images} />
{/* ... other images or components */}
    </div>
   </Card>
   <Card>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button positive onClick={handleCodeSubmit}>Submit</Button>
        </Modal.Actions>
      </Modal>

      
    </>
  );
};

export default DuckProfile;
