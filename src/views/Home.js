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
  { name: "Lando", image: Lion, footerColor: 'linear-gradient(to right, #ff8000, #47C7FC, #000000)' },
  { name: "Oscar", image: Elly, footerColor: 'linear-gradient(to right, #ff8000, #47C7FC, #000000)' },
  { name: "Carlos", image: Rich, footerColor: 'linear-gradient(to right, #EF1A2D, #000000)' },
  { name: "Charles", image: Mine, footerColor: 'linear-gradient(to right, #EF1A2D, #000000)' },
  { name: "Max", image: Monster, footerColor: 'linear-gradient(to right, #E30118, #FDD900)' },
  { name: "Sergio", image: Zebra, footerColor: 'linear-gradient(to right, #E30118, #FDD900)' },
  { name: "Lewis", image: Ninja, footerColor: 'linear-gradient(to right, #000000, #00A19B, #565F64)' },
  { name: "George", image: Vacation, footerColor: 'linear-gradient(to right, #000000, #00A19B, #565F64)' },
];

const Home = () => {
  return (
    <div style={styles.homeContainer}>
      {ducks.map((duck, index) => (
        <Link to="/" key={index}>
          <Card>
            <Image src={duck.image} wrapped ui={false} />
            <Card.Content>
              <Card.Header style={{ textAlign: 'center' }}>{duck.name}</Card.Header>
            </Card.Content>
            <div style={{ ...styles.footer, backgroundImage: duck.footerColor }}></div>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export default Home;

const styles = {
  homeContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gridGap: '20px',
    justifyContent: 'center',
    alignItems: 'start',
    padding: '20px',
    backgroundColor: '#f0f0f0',
  },
  footer: {
    width: '100%',
    height: '50px',
  },
};
