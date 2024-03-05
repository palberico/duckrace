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
  { name: "Lando", image: Lion, footerColor: 'linear-gradient(to right, #ff8000, #47C7FC, #000000)' }, // Example gradient from orange to a lighter orange
  { name: "Oscar", image: Elly, footerColor: 'linear-gradient(to right, #ff8000, #47C7FC, #000000)' }, // Gradient from red to a slightly different shade of red
  { name: "Carlos", image: Rich, footerColor: 'linear-gradient(to right, #EF1A2D, #000000)' },
  { name: "Charles", image: Mine, footerColor: 'linear-gradient(to right, #EF1A2D, #000000)' },
  { name: "Max", image: Monster, footerColor: 'linear-gradient(to right, #E30118, #FDD900)' },
  { name: "Sergio", image: Zebra, footerColor: 'linear-gradient(to right, #E30118, #FDD900)' },
  { name: "Lewis", image: Ninja, footerColor: 'linear-gradient(to right, #000000, #00A19B, #565F64)' },
  { name: "George", image: Vacation, footerColor: 'linear-gradient(to right, #000000, #00A19B, #565F64)' },
];


const TempHome = () => {
  return (
    <div key={ducks.name} style={{ backgroundImage: ducks.footerColor }}>
      {ducks.map((ducks, index) => (
        <Link to="/">
        <Card key={index}>
          <Image src={ducks.image} wrapped ui={false} />
          <Card.Content>
            <Card.Header style={{ textAlign: 'center' }}>{ducks.name}</Card.Header>
          </Card.Content>
          <div style={{ ...styles.footer, backgroundImage: ducks.footerColor }}></div>
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
