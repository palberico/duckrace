import React from 'react';
import DuckCard from '../components/DuckCard';
import LeaderBoard from '../components/LeaderBoard';
import { Input, Image } from 'semantic-ui-react';
import logo from '../assets/images/Logo.png'; // Adjust the path if necessary
import '../App.css'; // Ensure this import is present

const Home = () => {
  return (
    <div>
      <div className="header">
        <div className="headerLogo">
          <Image src={logo} size='small' />
        </div>
        <div className="headerSearch">
          <Input icon='search' placeholder='Search...' fluid />
        </div>
      </div>
      <div className="homeContainer">
        <LeaderBoard />
        <DuckCard />
      </div>
    </div>
  );
};

export default Home;
