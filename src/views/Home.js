import React from 'react';
import DuckCard from '../components/DuckCard';
import LeaderBoard from '../components/LeaderBoard';
import '../App.css'; 

const Home = () => {
  return (
    <div className="homeContainer">
      <LeaderBoard />
      <DuckCard />
    </div>
  );
};

export default Home;


