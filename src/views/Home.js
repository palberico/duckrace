import React from 'react';
import { Card, Image } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
// Import your duck images
import Lion from '../assets/images/ducks/Lion.png';
import Elly from '../assets/images/ducks/Elly.png';
import Mine from '../assets/images/ducks/Mine.png';
import Monster from '../assets/images/ducks/Monster.png';
import Ninja from '../assets/images/ducks/Ninja.png';
import Rich from '../assets/images/ducks/Rich.png';
import Vacation from '../assets/images/ducks/Vacation.png';
import Zebra from '../assets/images/ducks/Zebra.png';

const ducks = [
  { name: "Lando", image: Lion, footerColor: 'orange' },
  { name: "Charles", image: Elly, footerColor: 'red' },
  { name: "Carlos", image: Mine, footerColor: 'red' },
  { name: "Max", image: Monster, footerColor: 'blue' },
  { name: "Lewis", image: Ninja, footerColor: 'black' },
  { name: "Esteban", image: Rich, footerColor: 'pink' },
  { name: "Daniel", image: Vacation, footerColor: '#43a9d1' },
  { name: "Fernando", image: Zebra, footerColor: '#00ACAB' },
];

const TempHome = () => {
  return (
    <div style={styles.homeContainer}>
      {ducks.map((duck, index) => (
        <Link to="/">
        <Card key={index}>
          <Image src={duck.image} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>{duck.name}</Card.Header>
          </Card.Content>
          <div style={{ ...styles.footer, backgroundColor: duck.footerColor }}></div>
        </Card>
        </Link>
      ))}
   
    </div>
  );
};

export default TempHome;

const styles = {
  homeContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', // Adjust based on your card size
    gridGap: '20px', // Spacing between cards
    justifyContent: 'center',
    alignItems: 'start', // Align items to the start of each row
    padding: '20px', // Padding around the entire grid
    backgroundColor: '#f0f0f0',
  },
  footer: {
    width: '100%', // Full width of the card
    height: '50px', // Footer height
  },
};
