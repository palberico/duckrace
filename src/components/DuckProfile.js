import React, { useEffect, useState } from 'react';
import { Card, Image, Button, Modal, Input, Header, Message } from 'semantic-ui-react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase/Config';
import { doc, getDoc } from 'firebase/firestore';

const DuckProfile = () => {
  const { duckId } = useParams();
  const navigate = useNavigate(); // Use useNavigate instead of useHistory
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false); // For modal visibility
  const [code, setCode] = useState(''); // For storing user input code
  const [isCodeIncorrect, setIsCodeIncorrect] = useState(false); // To track code correctness

  useEffect(() => {
    const fetchDuckData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'ducks', duckId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDuckData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error getting document:', error);
      }
      setLoading(false);
    };

    fetchDuckData();
  }, [duckId]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setIsCodeIncorrect(false); // Reset code correctness state when modal closes
  };

  const handleCodeSubmit = () => {
    if (code === duckData.code) {
      navigate(`/log-distance/${duckId}`); // Use navigate to redirect
    } else {
      setIsCodeIncorrect(true); // Set code correctness state to true to show error message
      setCode(''); // Reset code input
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!duckData) {
    return <div>No Duck Data</div>;
  }

  return (
    <>
      <Card>
        <Image src={duckData.image} wrapped ui={false} />
        <Card.Content>
          <Card.Header>{duckData.name}</Card.Header>
        </Card.Content>
        <Card.Content extra>
          <Button primary onClick={handleOpen}>More Details</Button>
        </Card.Content>
      </Card>
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
