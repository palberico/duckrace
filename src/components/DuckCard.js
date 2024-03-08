// src/components/DuckCard.js
import React, { useEffect, useState } from 'react';
import { Card, 
  Image, 
  Grid, 
  Header, 
  Table, 
  TableRow, 
  TableHeader, 
  TableHeaderCell,
  TableBody,
  TableCell,
  Divider,
} from 'semantic-ui-react';
import { db } from '../firebase/Config';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../App.css';

const DuckCard = () => {
  const [ducks, setDucks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch ducks and order them by distance in descending order
      const q = query(collection(db, 'ducks'), orderBy('distance', 'desc'));
      const querySnapshot = await getDocs(q);
      const sortedDucks = querySnapshot.docs.map((doc, index) => ({
        ...doc.data(),
        id: doc.id,
        position: `P${index + 1}` // Assign position based on order
      }));
      setDucks(sortedDucks);
    };

    fetchData();
  }, []);

  return (
    <Grid container stackable columns={4}>
      {ducks.map((duck, index) => (
        <Grid.Column key={duck.id}>
          <Link to={`/duck/${duck.id}`}>
            <Card color='red'>
              <Image src={duck.image} wrapped ui={false} />
              <Card.Content>
                <Card.Content>
                 <Card.Header>
                    <Table basic='very' stackable >
                      <TableHeader>
                        <TableRow>
                         <TableHeaderCell>Position</TableHeaderCell>
                         <TableHeaderCell>Miles</TableHeaderCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>
                            <Header>{duck.position}</Header>
                          </TableCell>
                          <TableCell>
                            <Header>{duck.distance}</Header>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>

  </Card.Header>
</Card.Content>


 
                <Card.Header textAlign='center'>
               
                  
               {duck.name}
           
                </Card.Header>
                <Card.Description>
                  {duck.shortBio}
                </Card.Description>
              </Card.Content>
            </Card>
          </Link>
        </Grid.Column>
      ))}
    </Grid>

  );
};

export default DuckCard;
