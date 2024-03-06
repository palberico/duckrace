import React, { useEffect, useState } from 'react';
import { Card, Table, Image } from 'semantic-ui-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase/Config';

const LeaderBoard = () => {
  const [ducks, setDucks] = useState([]);

  useEffect(() => {
    const fetchDucks = async () => {
      // Reference to the collection
      const ducksCol = collection(db, 'ducks');
      // Create a query against the collection, ordering by distance and limiting to top 10
      const q = query(ducksCol, orderBy('distance', 'desc'), limit(10));
      
      const querySnapshot = await getDocs(q);
      const ducksData = querySnapshot.docs.map((doc, index) => ({
        pos: index + 1,
        ...doc.data(),
      }));

      setDucks(ducksData);
    };

    fetchDucks();
  }, []);

  return (
    <Card fluid>
      <Card.Content>
        <Table celled unstackable>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Pos.</Table.HeaderCell>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Distance</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {ducks.map((duck) => (
              <Table.Row key={duck.pos}>
                <Table.Cell>{duck.pos}</Table.Cell>
                <Table.Cell>
                  <Image src={duck.image} avatar />
                  <span>{duck.name}</span>
                </Table.Cell>
                <Table.Cell>{duck.distance}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Card.Content>
    </Card>
  );
};

export default LeaderBoard;
