import React from 'react';
import { Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Lion from '../assets/images/ducks/Lion.png';
import Elly from '../assets/images/ducks/Elly.png';
import Mine from '../assets/images/ducks/Mine.png';
import Monster from '../assets/images/ducks/Monster.png';
import Ninja from '../assets/images/ducks/Ninja.png';
import Rich from '../assets/images/ducks/Rich.png';
import Vacation from '../assets/images/ducks/Vacation.png';
import Zebra from '../assets/images/ducks/Zebra.png';

const TempHome = () => {
    return (
      <div style={styles.homeContainer}>
       <Link to="/">

        <Card>
          <Image src={Lion} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Lando</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
        <Card>
          <Image src={Elly} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Charles</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
        <Card>
          <Image src={Mine} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Carlos</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
        <Card>
          <Image src={Monster} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Max</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
        <Card>
          <Image src={Ninja} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Lewis</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
        <Card>
          <Image src={Rich} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Lance</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
        <Card>
          <Image src={Vacation} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Daniel</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
        <Card>
          <Image src={Zebra} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>Fernando</Card.Header> 
          </Card.Content>
          <div style={styles.redFooter}></div>
        </Card>
       </Link>
      </div>
    );
  };
  
  export default TempHome;
  

  const styles = {
    homeContainer: {
      display: 'grid',
      
      flexDirection: 'row',
      justifyContent: 'center',
    //   alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f0f0f0',
      color: '#333',
      fontFamily: 'Arial, sans-serif',
    },
    redFooter: {
      width: '100%', // Full width
      height: '50px', // Footer height
      backgroundSize: '20px 20px', // Size of each square
      color: 'red'
    },
    blueFooter: {
        width: '100%', // Full width
        height: '50px', // Footer height
        backgroundSize: '20px 20px', // Size of each square
        color: 'blue'
      },
  };
