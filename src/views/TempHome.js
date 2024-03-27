import React, { useState, useEffect } from 'react';
import { Image, Loader, Button, Segment } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import raceStartImage from '../assets/images/HeroImage.jpg';
import QR from '../assets/images/RaceDucksQR.PNG';
import logo from '../assets/images/Logo.png';
import AdminModal from '../components/AdminModal';

const TempHome = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 3000); // Adjust time as needed for your actual loading process
    }, []);

    const handleAdminClick = () => {
        setIsModalOpen(true);
    };

    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent the form from submitting traditionally
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/Admin'); // Navigate to Admin page upon successful login
            setIsModalOpen(false); // Close the modal
        } catch (error) {
            setAuthError('Failed to log in. Please check your credentials.');
            console.error('Login error:', error);
        }
    };

    if (isLoading) {
        return (
            <div style={styles.loaderContainer}>
                <Loader active inline='centered' size='massive'>Box..Box...</Loader>
            </div>
        );
    }

    return (
        <div style={styles.homeContainer}>
          {isLoading ? (
            <Loader active inline='centered' size='massive'>Box..Box...</Loader>
          ) : (
            <>
              <div style={styles.whiteBox}>
              <div style={styles.checkerboardFooter}></div>
                <Image src={logo} style={styles.logo} />
                <Segment>
                  <p style={{ fontSize: '16px' }}>Welcome to RaceDucks.com!</p>
                  <p style={{ fontSize: '16px' }}>RaceDucks.com is optimized for mobile devices. To log mileage for a duck you found, or to view the leaderboard, please scan the QR code below from your phone.</p>
                  <Image src={QR} style={styles.qrCode} />
                </Segment>
              <Button inverted style={styles.checkerboardButton} onClick={handleAdminClick} />
              </div>
              <AdminModal
                isOpen={isModalOpen}
                setIsOpen={setIsModalOpen}
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                onSubmit={handleLogin}
                authError={authError}
              />
            </>
          )}
        </div>
      );
    };
    
    export default TempHome;

    const styles = {
        homeContainer: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between', // Space between the main content and footer
            alignItems: 'flex-start', // Aligns children to the left
            height: '100vh',
            backgroundImage: `url(${raceStartImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden', // Prevents scrolling
            padding: '20px', // Adds some space around the contents
          },
          whiteBox: {
            backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 1) 100%)',
            padding: '20px',
            maxWidth: '300px', // Controls the width of the white box
            borderRadius: '10px', // Optional: Adds rounded corners to the white box
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', // Optional: Adds a subtle shadow for depth
            zIndex: 2, // Ensures the white box is above the background image
            position: 'absolute', // Positions the white box absolutely within the homeContainer
            top: '50%', // Starts at 50% from the top
            left: '20px', // Distance from the left edge of the homeContainer
            transform: 'translateY(-50%)', // Adjusts the positioning to center it vertically
            display: 'flex',        // Enable Flexbox
            flexDirection: 'column', // Stack children vertically
            alignItems: 'center',    // Center children horizontally
            justifyContent: 'center', // Center children vertically
          },
        logo: {
          maxWidth: '100px', // Adjust the size as needed
          marginTop: '1em',
          marginBottom: '20px',
        },
        qrCode: {
          maxWidth: '100px', // Adjust the size as needed
          marginTop: '20px',
        },
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
    },
    checkerboardButton: {
        width: '100%',
        height: '50px',
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
