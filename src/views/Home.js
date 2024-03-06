import React from 'react';
import DuckCard from '../components/DuckCard';

// import { Card, Image } from 'semantic-ui-react';
// import { Link } from 'react-router-dom';


const Home = () => {
  return (
    <div style={styles.homeContainer}>
      <DuckCard />
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
