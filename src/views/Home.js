import React from 'react';
import DuckCard from '../components/DuckCard';
import LeaderBoard from '../components/LeaderBoard';

const Home = () => {
  return (
    <div style={homeContainerStyle}>
      <LeaderBoard />
      <DuckCard />
    </div>
  );
};

export default Home;

const homeContainerStyle = {
  display: 'flex',      // Use flexbox
  flexDirection: 'column', // Stack items vertically
  justifyContent: 'center', // Center horizontally, applies to the cross axis of column which is horizontal
  minHeight: '100vh',   // Minimum height to take full viewport height
  padding: '200px',      // Add padding to create space around the content
};
