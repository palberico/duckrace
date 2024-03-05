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
  { name: "Lando", image: Lion, footerColor: 'linear-gradient(to right, #ff8000, #47C7FC, #ffffff, #000000)' }, // Example gradient from orange to a lighter orange
  { name: "Charles", image: Elly, footerColor: 'linear-gradient(to right, red, #ff0000)' }, // Gradient from red to a slightly different shade of red
  { name: "Carlos", image: Mine, footerColor: 'linear-gradient(to right, red, #ff3232)' },
  { name: "Max", image: Monster, footerColor: 'linear-gradient(to right, blue, #0066ff)' },
  { name: "Lewis", image: Ninja, footerColor: 'linear-gradient(to right, black, #333333)' },
  { name: "Esteban", image: Rich, footerColor: 'linear-gradient(to right, pink, #ff66b3)' },
  { name: "Daniel", image: Vacation, footerColor: 'linear-gradient(to right, #43a9d1, #75b2d3)' },
  { name: "Fernando", image: Zebra, footerColor: 'linear-gradient(to right, #00ACAB, #33bdbd)' },
];


const TempHome = () => {
  return (
    <div key={duck.name} style={{ backgroundImage: duck.footerColor }}>
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
