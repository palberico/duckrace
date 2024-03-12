import React, { useState, useEffect } from 'react';
import { Card, Image, Loader, Button } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import raceStartImage from '../assets/images/IMG_0598.WEBP';

const TempHome = () => {
    const [isLoading, setIsLoading] = useState(true);

    // Simulate loading process, you can replace this with your actual loading logic
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 3000); // Adjust time as needed for your actual loading process
    }, []);

    if (isLoading) {
        return (
            <div style={styles.loaderContainer}>
                <Loader active inline='centered' size='massive'>Box...Box...</Loader>
            </div>
        );
    }

    return (
        <div style={styles.homeContainer}>
            <Link to="/Home">
                <Card>
                    <Image src={raceStartImage} wrapped ui={false} />
                    <Card.Content>
                        <Card.Header style={{ textAlign: 'center' }}>The Race Starts June 3, 2024</Card.Header>
                    </Card.Content>
                    <div style={styles.checkerboardFooter}></div>
                </Card>
                <Link to="/Admin">
                  <Button>Admin</Button>
                </Link>
            </Link>
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
