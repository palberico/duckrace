import React, { useState } from 'react';
import { Card, Segment } from 'semantic-ui-react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';
import DuckCard from '../components/DuckCard';
import HomeHeader from '../components/HomeHeader';
import RaceDucksVideo from '../assets/images/RaceDucks.mp4';
import '../App.css';

const Home = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false); // Used for search loading
  const navigate = useNavigate();

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

  return (
    <div className="homeContainer">
      <HomeHeader
        code={code}
        setCode={setCode}
        error={error}
        setError={setError}
        loading={loading}
        handleSearch={handleSearch}
      />

      {/* New Hero Section Structure */}
      <div className="heroSection">
        <video className="hero-video" autoPlay loop muted playsInline>
          <source src={RaceDucksVideo} type="video/mp4" />
          <source src={RaceDucksVideo} type="video/quicktime" />
          Your browser does not support the video tag.
        </video>
        <div className="heroContent">
          <h1 className="heroTitle">Join the Global Duck Race</h1>
          <p className="heroSubtitle">Track, Log, and Hide ducks around the world.</p>
        </div>
      </div>

      <div className="scrollContent">
        <Card fluid className="welcome-card" style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}>
          <Segment size='large' basic style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '1.2rem', padding: '0' }}>
            <p>A hidden duck is an invitation to adventure. Find it, log it, hide it.</p>
          </Segment>
        </Card>

        {/* Leaderboard Section */}
        <h2 className="section-title">Live Leaderboard</h2>

        <DuckCard />
      </div>

      <div className="footer">
        <p>© 2024 RaceDucks.com. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Keep on quackin'.</p>
      </div>
    </div>
  );
};

export default Home;