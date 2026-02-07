import React, { useEffect, useState } from 'react';
import {
  Button, Loader, Message,
  Header, Image, Icon
} from 'semantic-ui-react';
import {
  collection, getDocs, getDoc, query, orderBy, doc,
  limit, where
} from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import DuckCodeModal from '../components/DuckCodeModal';
import MapCard from '../components/MapCard';
import { db } from '../firebase/Config';
import HomeHeader from '../components/HomeHeader';
import '../Profile.css';
import '../App.css';
import PositionBadge from '../components/PositionBadge';
import LocationsCard from '../components/LocationsCard';
import LocationDetailsModal from '../components/LocationDetailsModal';
import countryOptions from '../components/data/Countries';


const DuckProfile = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [isCodeIncorrect, setIsCodeIncorrect] = useState(false);
  const [duckLocations, setDuckLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  // Removed duckPosition state as it will be part of duckData


  useEffect(() => {
    const fetchDuckData = async () => {
      const duckRef = doc(db, 'ducks', duckId);
      const docSnap = await getDoc(duckRef);

      if (docSnap.exists()) {
        return docSnap.data(); // Return data instead of setting state directly
      } else {
        console.error('No such duck!');
        return null;
      }
    };

    const fetchLocations = async () => {
      const locationsQuery = query(
        collection(db, 'locations'),
        where('duckId', '==', duckId),
        orderBy('timestamp', 'desc'),
        limit(5)
      );

      const querySnapshot = await getDocs(locationsQuery);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Return locations
    };

    const calculatePosition = async () => {
      try {
        const allDucksQuery = query(collection(db, 'ducks'), orderBy('distance', 'desc'));
        const allDucksSnapshot = await getDocs(allDucksQuery);
        const ducks = allDucksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const duckIndex = ducks.findIndex(duck => duck.id === duckId);
        return duckIndex !== -1 ? `P${duckIndex + 1}` : 'N/A'; // Return position
      } catch (err) {
        console.error("Error calculating position:", err);
        return 'N/A';
      }
    };

    setLoading(true);

    Promise.all([fetchDuckData(), fetchLocations()])
      .then(async ([data, locations]) => { // Use async here to await calculatePosition
        if (data) {
          const position = await calculatePosition(); // Calculate position after data is fetched
          setDuckData({ ...data, position }); // Update duckData with the position
          setDuckLocations(locations);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [duckId]);

  const handleCodeSubmit = async () => {
    if (code === duckData.code) {
      navigate(`/log-distance/${duckId}`);
    } else {
      setIsCodeIncorrect(true);
      setCode('');
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const getCountryFullName = (countryCode) => {
    if (!countryCode) return '';
    const country = countryOptions.find(option => option.key === countryCode.toLowerCase());
    return country ? country.text : countryCode;
  };

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader active inline='centered' size='large'>Box...Box...</Loader>
      </div>
    );
  }

  if (!duckData) {
    return <Message error header="Error" content="No Duck Found" />;
  }

  const handleLocationClick = (location) => {
    setSelectedLocation(location);
    setLocationModalOpen(true);
  };

  return (
    <div className="homeContainer">
      {/* Reusing HomeHeader for consistency */}
      <HomeHeader
        code={code}
        setCode={setCode}
        open={open}
        setOpen={setOpen}
        handleCodeSubmit={handleCodeSubmit}
        isCodeIncorrect={isCodeIncorrect}
        // If HomeHeader needs props for search, we can pass dummies or update HomeHeader to be more flexible
        // For now, assuming it's mostly for display and admin/search on Home.
        // We might want to hide the search bar on Profile or make it functional.
        // Let's keep it consistent:
        handleSearch={() => { }}
        loading={false}
        error={false}
        setError={() => { }}
      />

      <div className="heroSection" style={{ height: '15vh', minHeight: '130px' }}>
        {/* Background handles the visual */}
      </div>

      <div className="profile-content">
        {/* Main Profile Card */}
        <div className="profile-hero">
          {/* Dual-Image Hero Style */}
          <div className="profile-image-container" style={{ position: 'relative', height: '400px', overflow: 'hidden', borderRadius: '16px', background: '#121212' }}>
            {/* Blurred Background */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundImage: `url(${duckData.imageUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(20px) brightness(0.7)',
              transform: 'scale(1.1)'
            }} />

            {/* Foreground Image */}
            <Image src={duckData.imageUrl} alt={duckData.name} style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              zIndex: 1
            }} />
            {/* Title Overlay */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, width: '100%',
              background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)',
              padding: '3rem 2rem 1.5rem',
              zIndex: 2
            }}>
              <h1 style={{ color: 'white', margin: 0, fontSize: '3rem', textTransform: 'uppercase', textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}>{duckData.name}</h1>
            </div>
          </div>
          <div className="profile-stats-container">

            <div className="info-grid">
              <div className="stat-box">
                <div className="stat-label">Position</div>
                <div className="stat-value">
                  {/* Use duckData.position directly */}
                  {duckData.position ? <PositionBadge position={duckData.position} /> : <Loader active inline inverted size='mini' />}
                </div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Distance</div>
                <div className="stat-value neon">{duckData.distance} Miles</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">Hometown</div>
                <div className="stat-value" style={{ fontSize: '1.2rem' }}>{duckData.hometown}</div>
              </div>
            </div>

            <div className="action-buttons">
              <Button
                size='huge'
                className="profile-action-btn primary"
                onClick={handleOpen}
              >
                I Found This Duck!
              </Button>
              <Button
                size='huge'
                className="profile-action-btn secondary"
                onClick={() => navigate('/')}
              >
                <Icon name='trophy' />
                Leaderboard
              </Button>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bio-section">
          <h3>About {duckData.name}</h3>
          <div dangerouslySetInnerHTML={{ __html: duckData.bio }} />
        </div>

        {/* Map & Locations */}
        <div className="activity-section">
          <div className="dark-card" style={{ marginBottom: '3rem' }}>
            <Header as="h3">Recent Activity</Header>
            <div className="map-cards-container" style={{ display: 'flex', overflowX: 'auto', gap: '1.5rem', paddingBottom: '1rem' }}>
              {duckLocations.map((location, index) => {
                const isLocationAvailable = location.startLocation && location.newLocation;
                return (
                  <div key={location.id || index} className="map-card-wrapper" style={{ minWidth: '350px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '1rem' }}>
                    <div className="map-meta" style={{ marginBottom: '1rem', color: '#ccc' }}>
                      {isLocationAvailable ? (
                        <>
                          <div style={{ marginBottom: '0.5rem' }}><strong>Start:</strong> {location.startLocation.state
                            ? `${location.startLocation.city}, ${location.startLocation.state}`
                            : `${location.startLocation.city}, ${getCountryFullName(location.startLocation.country)}`}
                          </div>
                          <div><strong>End:</strong> {location.newLocation.state
                            ? `${location.newLocation.city}, ${location.newLocation.state}`
                            : `${location.newLocation.city}, ${getCountryFullName(location.newLocation.country)}`}
                          </div>
                        </>
                      ) : (
                        <div>Location Information Unavailable</div>
                      )}
                    </div>

                    {isLocationAvailable && (
                      <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => handleLocationClick(location)}>
                        <MapCard location={location} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dark-card">
            <LocationsCard duckId={duckId} />
          </div>
        </div>

      </div>

      <div className="footer">
        <p>© 2024 RaceDucks.com. All rights reserved.</p>
        <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Keep on quackin'.</p>
      </div>

      <DuckCodeModal
        open={open}
        handleClose={handleClose}
        code={code}
        setCode={setCode}
        isCodeIncorrect={isCodeIncorrect}
        handleCodeSubmit={handleCodeSubmit}
        duckName={duckData ? duckData.name : ''}
      />

      <LocationDetailsModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        location={selectedLocation}
      />
    </div>
  );
};

export default DuckProfile;



const styles = {
  loaderContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
};

