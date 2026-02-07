import React, { useEffect, useState } from 'react';
import { Card, Grid, Loader, Message } from 'semantic-ui-react';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';
import { Link } from 'react-router-dom';
import '../App.css';

const DuckCard = () => {
  const [ducks, setDucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const q = query(collection(db, 'ducks'), orderBy('distance', 'desc'));
        const querySnapshot = await getDocs(q);
        const sortedDucks = querySnapshot.docs.map((doc, index) => ({
          ...doc.data(),
          id: doc.id,
          position: `P${index + 1}`
        }));
        setDucks(sortedDucks);
      } catch (err) {
        setError('Failed to fetch ducks. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader active inline='centered' size='large'>Box...Box...</Loader>;
  if (error) return <Message error header="Error" content={error} />;

  return (
    <Grid container stackable columns={4} className="duck-grid">
      {ducks.map((duck) => {
        const positionClass = duck.position.toLowerCase();

        return (
          <Grid.Column key={duck.id}>
            <Link to={`/duck/${duck.id}`} className="duck-card-link">
              <Card className="duck-card">
                <div className={`position-badge ${positionClass}`}>
                  {duck.position}
                </div>

                {/* Image takes full height in the new CSS */}
                <div className="image">
                  <img src={duck.imageUrl} alt={duck.name} />
                </div>

                <div className="duck-info">
                  <div className="duck-name">{duck.name}</div>
                  <div className="duck-distance">{duck.distance} Miles</div>
                </div>
              </Card>
            </Link>
          </Grid.Column>
        );
      })}
    </Grid>
  );
};

export default DuckCard;
