import React, { useState, useEffect } from 'react';
import { Input, Image, Button, Message } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/Config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import logo from '../assets/images/Logo.png';
import DuckCard from '../components/DuckCard';
import LeaderBoard from '../components/LeaderBoard';
import '../App.css';

const Home = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCode(e.target.value);
    setError(false); // Reset error state on input change
  };

  const handleSearch = async () => {
    if (code.length === 6) {
      const ducksRef = collection(db, 'ducks');
      const q = query(ducksRef, where("code", "==", code));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError(true); // Set error state if no document found
      } else {
        querySnapshot.forEach((doc) => {
          // Navigate to the route with the duck's document ID
          navigate(`/log-distance/${doc.id}`);
        });
      }
    } else {
      setError(true); // Set error state if code is not 6 digits
    }
  };

  return (
    <div>
      <div className="header">
        <div className="headerLogo">
          <Image src={logo} size='small' />
        </div>
        <div className="headerSearch">
          <Input
            icon={<Button icon='search' onClick={handleSearch} />}
            placeholder='Found a Duck? Enter Code Here...'
            fluid
            value={code}
            onChange={handleChange}
            error={error}
          />
          {error && <Message negative>Code Not Found</Message>}
        </div>
      </div>
      <div>
        <LeaderBoard />
        <DuckCard />
      </div>
    </div>
  );
};

export default Home;
