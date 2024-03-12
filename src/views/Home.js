import React, { useState } from 'react';
import { Input, Image, Button, Message, Popup } from 'semantic-ui-react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';
import logo from '../assets/images/Logo.png';
import LeaderBoardImage from '../assets/images/LeaderBoard.png';
import DuckCard from '../components/DuckCard';
import '../App.css';

const Home = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCode(e.target.value);
    setError(false); // Reset error state on input change
  };

  const handleSearch = async () => {
    if (code.length === 6) {
      setLoading(true); // Start loading
      const ducksRef = collection(db, 'ducks');
      const q = query(ducksRef, where("code", "==", code));
      try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
          setError(true); // Set error state if no document found
        } else {
          querySnapshot.forEach((doc) => {
            // Navigate to the route with the duck's document ID
            navigate(`/log-distance/${doc.id}`);
          });
        }
      } catch (error) {
        setError(true); // Handle potential errors from the database call
        console.error("Error searching for duck code:", error);
      }
      setLoading(false); // End loading
    } else {
      setError(true); // Set error state if code is not 6 digits
    }
  };

  const isButtonDisabled = loading || code.length !== 6;

  return (
    <div>
      <div className="header">
        <div className="headerLogo">
          <Link to="/">
           <Image src={logo} size='small' />
          </Link>
        </div>
        <div className="headerSearch">
          <Input
            icon={
              <Popup
                content="Please enter the 6-digit code found on your duck."
                on={['hover', 'focus']}
                disabled={!isButtonDisabled}
                trigger={
                  <div style={{ display: 'inline-block' }}>
                    <Button
                      icon='search'
                      onClick={handleSearch}
                      disabled={isButtonDisabled}
                    />
                  </div>
                }
              />
            }
            placeholder='Found a Duck? Enter Code Here...'
            fluid
            value={code}
            onChange={handleChange}
            error={error}
            loading={loading}
          />
          {error && <Message negative>Code Not Found</Message>}
        </div>
      </div>
      <div>
        <Image src={LeaderBoardImage} centered />
        <DuckCard />
      </div>
    </div>
  );
};

export default Home;
