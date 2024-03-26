import React, { useState, useEffect, useRef } from 'react';
import { Card, Loader, Button, Modal, Form, Input, Segment } from 'semantic-ui-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';
import LeaderBoardImage from '../assets/images/LeaderBoard.png';
import DuckCard from '../components/DuckCard';
import HomeHeader from '../components/HomeHeader';
import '../App.css';

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

  const location = useLocation();
  const leaderboardRef = useRef(null);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  useEffect(() => {
    if (location.state?.focusLeaderboard && isImageLoaded && leaderboardRef.current) {
      leaderboardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location, isImageLoaded]); // Added isImageLoaded as a dependency

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
      <div style={styles.loaderContainer}>
                <Loader active inline='centered' size='massive'>Box..Box...</Loader>
            </div>
    );
  }

  //This should be in the Header.js screen, verify then delete
  // const isButtonDisabled = loading || code.length !== 6;
  
  return (
    <div className="homeContainer">
  <HomeHeader code={code} setCode={setCode} error={error} setError={setError} loading={loading} handleSearch={handleSearch} />
  <div className="heroSection"></div>
        <div className="heroFilter"></div>
  <div className="scrollContent">

    <div className="heroText">You Found A Racing Duck!</div>

        <Card fluid>

            <Segment size='big'>
                        <p>Embark on a global adventure with our fleet of rubber ducks as they waddle their way around the world.</p>
                        <p>Here's how it works: a duck is hidden at a secret location, and it's up to you to find it! Once you've discovered our feathered friend, log the location to share your part of the journey. But the fun doesn't stop there - it's then your turn to re-hide the duck for the next intrepid explorer.</p>
                        <p>Join the race, track the ducks, and let's see how far they can go!</p>
                    </Segment>
                    </Card>


                    <img
  ref={leaderboardRef}
  src={LeaderBoardImage}
  alt="Leaderboard"
  onLoad={() => setIsImageLoaded(true)}
  style={{
    maxWidth: '70%', // Adjust the size as needed
    display: 'block', // Use block display to center the image
    marginLeft: 'auto',
    marginRight: 'auto'
  }}
/>



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
    <div style={styles.checkerboardFooter}></div>
    </div>
  );
};

export default Home;

const styles = {
  checkerboardFooter: {
      width: '100%',
      height: '50px',
      marginTop: '30px',
      backgroundSize: '20px 20px',
      backgroundImage: 
          `linear-gradient(45deg, #000 25%, transparent 25%), 
           linear-gradient(-45deg, #000 25%, transparent 25%), 
           linear-gradient(45deg, transparent 75%, #000 75%), 
           linear-gradient(-45deg, transparent 75%, #000 75%)`,
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
  },
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
},
};