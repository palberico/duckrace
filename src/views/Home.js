import React, { useState, useEffect } from 'react';
import { Card, Image, Loader, Button, Modal, Form, Input,} from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';
import LeaderBoardImage from '../assets/images/LeaderBoard.png';
import DuckCard from '../components/DuckCard';
// import raceStartImage from '../assets/images/IMG_0598.WEBP';
import Header from '../components/Header';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth();

  useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 3000);
  }, []);

  //This will need to be added back in to create the admin button.

  // const handleAdminClick = () => {
  //   setIsModalOpen(true);
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/Admin');
      setIsModalOpen(false);
    } catch (error) {
      setAuthError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
    }
  };

  const handleSearch = async () => {
    if (code.length === 6) {
      setLoading(true); // Start loading
      const ducksRef = collection(db, 'ducks');
      const q = query(ducksRef, where("code", "==", code));
      try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setError(true); // Set error state if no document found
        } else {
          querySnapshot.forEach((doc) => {
            // Navigate to the route with the duck's document ID
            navigate(`/log-distance/${doc.id}`);
          });
        }
      } catch (error) {
        setError(true); // Handle potential errors from the database call
        console.error("Error searching for duck code:", error);
      }
      setLoading(false); // End loading
    } else {
      setError(true); // Set error state if code is not 6 digits
    }
  };

  if (isLoading) {
    return (
      <div className="loaderContainer">
        <Loader active inline='centered' size='massive'>Loading...</Loader>
      </div>
    );
  }

  //This should be in the Header.js screen, verify then delete
  // const isButtonDisabled = loading || code.length !== 6;
  
  return (
    <div className="homeContainer">
  <Header code={code} setCode={setCode} error={error} setError={setError} loading={loading} handleSearch={handleSearch} />
  <div className="heroSection"></div>
        <div className="heroFilter"></div>
  <div className="scrollContent">
    <div className="heroText">You Found A Racing Duck!</div>


        {/* <Image src={raceStartImage} centered size='huge' /> */}
        <Card fluid>
            <Card.Header textAlign='center'>Welcome to raceducks.com!</Card.Header>
            <Card.Content>
                        <p>You found a racing duck! Embark on a global adventure with our fleet of rubber ducks as they waddle their way around the world.</p>
                        <p>Here's how it works: a duck is hidden at a secret location, and it's up to you to find it! Once you've discovered our feathered friend, log the location to share your part of the journey. But the fun doesn't stop there - it's then your turn to re-hide the duck for the next intrepid explorer.</p>
                        <p>Join the race, track the ducks, and let's see how far they can go!</p>
                    </Card.Content>
                    </Card>
      <Image src={LeaderBoardImage} centered size='large' />
      <DuckCard />
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                <Modal.Header>Admin Login</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={handleLogin}>
                        <Form.Field>
                            <label>Email</label>
                            <Input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </Form.Field>
                        <Form.Field>
                            <label>Password</label>
                            <Input type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </Form.Field>
                        <Button type="submit">Login</Button>
                        {authError && <div style={{ color: 'red', marginTop: '10px' }}>{authError}</div>}
                    </Form>
                </Modal.Content>
            </Modal>
    </div>
    </div>
  );
};

export default Home;
