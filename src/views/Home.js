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
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  minHeight: '100vh',
  paddingLeft: '100px', // Adjusted to apply padding only horizontally
  paddingRight: '200px', // Adjusted to apply padding only horizontally
};
