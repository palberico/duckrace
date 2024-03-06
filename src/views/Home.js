import React from 'react';
import DuckCard from '../components/DuckCard';

const Home = () => {

  return (
    <div style={homeContainerStyle}>
      <DuckCard />
    </div>
  );
};

export default Home;

const homeContainerStyle = {
  display: 'flex',      // Use flexbox to center the card group
  justifyContent: 'center', // Center horizontally
  alignItems: 'center',     // Center vertically (if needed)
  minHeight: '100vh',   // Minimum height to take full viewport height
  padding: '30px',      // Add padding to create space around the card group
};
