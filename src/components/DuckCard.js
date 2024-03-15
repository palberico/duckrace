import React, { useEffect, useState } from 'react';
import { Card, Image, Grid, Loader, Message, Header } from 'semantic-ui-react';
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
          position: `P${index + 1}` // Assign position based on order
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

  if (loading) return <Loader active inline='centered' size='massive'>Box...Box...</Loader>;
  if (error) return <Message error header="Error" content={error} />;

  // Function to determine card color based on position
  const getPositionColor = (position) => {
    switch (position) {
      case 'P1':
        return 'red';
      case 'P2':
        return 'blue';
      case 'P3':
        return 'green';
      default:
        return ''; // Default case doesn't add a color
    }
  };

  return (
    <Grid container stackable columns={4}>
      {ducks.map((duck) => {
        const positionColor = getPositionColor(duck.position);

        return (
          <Grid.Column key={duck.id}>
            <Link to={`/duck/${duck.id}`} className="duck-card-link">
              <Card className={`duck-card ${positionColor}`}>
                  <Card.Header className="duck-card-header">
                    <span className={`position ${positionColor}-text`}>{duck.position}</span>
                  </Card.Header>
                <Image src={duck.imageUrl} wrapped ui={false} alt={`Image of ${duck.name}`} />
                <Card.Content>
                    <Header as='h3'>{duck.name}</Header>
                  <Card.Meta>
                    <span className="duck-card-distance">{duck.distance} Miles</span>
                  </Card.Meta>
                </Card.Content>
              </Card>
            </Link>
          </Grid.Column>
        );
      })}
    </Grid>
  );
};

export default DuckCard;
