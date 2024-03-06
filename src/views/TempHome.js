import React from 'react';
import { Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import raceStartImage from '../assets/images/IMG_0598.WEBP';

const TempHome = () => {
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
    checkerboardFooter: {
      width: '100%', // Full width
      height: '50px', // Footer height
      backgroundSize: '20px 20px', // Size of each square
      backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', // Positioning the gradients
    },
  };
