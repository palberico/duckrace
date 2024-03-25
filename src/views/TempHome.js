import React, { useState, useEffect } from 'react';
import { Card, Image, Loader, Button, Modal, Form, Input, ButtonGroup, ButtonOr } from 'semantic-ui-react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import raceStartImage from '../assets/images/IMG_0598.WEBP';

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
           
                <Card>
                <Button inverted onClick={handleAdminClick} style={styles.checkerboardFooter}></Button>
                    <Image src={raceStartImage} wrapped ui={false} />
                   
                    <Card.Content>
                        <Card.Header style={{ textAlign: 'center' }}>Welcome to raceducks.com!</Card.Header>
                        <Card.Content>
                            <p>Embark on a global adventure with our fleet of rubber ducks as they waddle their way around the world.</p>
                            <p>Here's how it works: a duck is hidden at a secret location, and it's up to you to find it! Once you've discovered our feathered friend, log the location to share your part of the journey. But the fun doesn't stop there - it's then your turn to re-hide the duck for the next intrepid explorer.</p>
                            <p>Join the race, track the ducks, and let's see how far they can go!</p>
                        </Card.Content>
                        <ButtonGroup style={{ marginTop: '20px' }}>
                    <Link to="/Home">
                    <Button color="orange" >Log My Duck</Button>
                    </Link>
                    <ButtonOr />
                    <Link to="/Home">
                      <Button color="grey">Leaderboard</Button>
                    </Link>
                  </ButtonGroup>
                    </Card.Content>
                   

                    <div style={styles.checkerboardFooter}></div>

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

                   
                </Card>
        </div>
    );
};

export default TempHome;

const styles = {
    homeContainer: {
        display: 'flex',
        flexDirection: 'column', // Stack children vertically
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        color: '#333',
        fontFamily: 'Arial, sans-serif',
    },
    loaderContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Use full viewport height
    },
    checkerboardFooter: {
        width: '100%', // Full width
        height: '50px', // Footer height
        backgroundSize: '20px 20px', // Size of each square
        backgroundImage: 
            `linear-gradient(45deg, #000 25%, transparent 25%), 
            linear-gradient(-45deg, #000 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #000 75%), 
            linear-gradient(-45deg, transparent 75%, #000 75%)`,
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', // Positioning the gradients
    },
};
