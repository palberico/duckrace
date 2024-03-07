import React, { useEffect, useState } from 'react';
import { Card, Table, Image, CardHeader } from 'semantic-ui-react';
import { Link } from 'react-router-dom'; // Import Link component
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';

const LeaderBoard = () => {
  const [ducks, setDucks] = useState([]);

  useEffect(() => {
    const fetchDucks = async () => {
      const ducksCol = collection(db, 'ducks');
      const q = query(ducksCol, orderBy('distance', 'desc'), limit(10));
      const querySnapshot = await getDocs(q);
      const ducksData = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Store the document ID for navigation
        ...doc.data(),
      }));

      setDucks(ducksData);
    };

    fetchDucks();
  }, []);

  return (
    <div className="leaderboardCard">
      <Card fluid style={{ marginBottom: '20px' }}>
        <div style={styles.checkerboardFooter}></div>
        <Card.Content>
        <CardHeader textAlign='left' >Leader Board</CardHeader>
          <Table singleLine unstackable>
            <Table.Header textAlign='center'>
              <Table.Row>
                <Table.HeaderCell textAlign='center'>Pos.</Table.HeaderCell>
                <Table.HeaderCell textAlign='center'>Name</Table.HeaderCell>
                <Table.HeaderCell textAlign='center'>Distance</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {ducks.map((duck, index) => (
                <Table.Row key={duck.id}>
                  <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                  <Table.Cell textAlign='left' style={{ cursor: 'pointer' }}>
                    <Link to={`/duck/${duck.id}`}>
                      <Image src={duck.image} avatar />
                      <span>{duck.name}</span>
                    </Link>
                  </Table.Cell>
                  <Table.Cell textAlign='center'>{duck.distance}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Card.Content>
        <div style={styles.checkerboardFooter}></div>
      </Card>
    </div>
  );
};

export default LeaderBoard;

const styles = {
  checkerboardFooter: {
    width: '100%', // Full width
    height: '50px', // Footer height
    backgroundSize: '20px 20px', // Size of each square
    backgroundImage: `linear-gradient(45deg, #000 25%, transparent 25%), linear-gradient(-45deg, #000 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #000 75%), linear-gradient(-45deg, transparent 75%, #000 75%)`,
    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px', // Positioning the gradients
  },
};