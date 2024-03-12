import React, { useState, useEffect } from 'react';
import { Card, Image, Loader, Button, Modal, Form, Input } from 'semantic-ui-react';
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
            <Link to="/Home" style={{ textDecoration: 'none' }}>
                <Card>
                    <Image src={raceStartImage} wrapped ui={false} />
                    <Card.Content>
                        <Card.Header style={{ textAlign: 'center' }}>The Race Starts June 3, 2024</Card.Header>
                    </Card.Content>
                    <div style={styles.checkerboardFooter}></div>
                </Card>
            </Link>
            <Button onClick={handleAdminClick}>Admin</Button>

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
