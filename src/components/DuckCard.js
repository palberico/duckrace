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

  if (loading) return <Loader active inline="centered">Loading Ducks...</Loader>;
  if (error) return <Message error header="Error" content={error} />;

  return (
    <Grid container stackable columns={4}>
      {ducks.map((duck) => (
        <Grid.Column key={duck.id}>
          <Link to={`/duck/${duck.id}`} className="duck-card-link">
            <Card className="duck-card">
              <Image src={duck.image} wrapped ui={false} alt={`Image of ${duck.name}`} />
              <Card.Content>
                <Card.Header>
                  <div className="duck-card-header">
                    <span>{duck.position}</span>
                    <span className="duck-card-distance">{duck.distance} Miles</span>
                  </div>
                </Card.Header>
                <Card.Meta textAlign='center'>
                  <Header> {duck.name} </Header>
                </Card.Meta>
              </Card.Content>
            </Card>
          </Link>
        </Grid.Column>
      ))}
    </Grid>
  );
};

export default DuckCard;
