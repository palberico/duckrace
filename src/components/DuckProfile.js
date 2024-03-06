import React, { useEffect, useState } from 'react';
import { Card, Image, Button } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/Config';
import { doc, getDoc } from 'firebase/firestore';

const DuckProfile = () => {
  const { duckId } = useParams();
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDuckData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'ducks', duckId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDuckData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error getting document:', error);
      }
      setLoading(false);
    };

    fetchDuckData();
  }, [duckId]); // Rerun effect if duckId changes

  if (loading) {
    return <div>Loading...</div>; // Or some other loading indicator
  }

  if (!duckData) {
    return <div>No Duck Data</div>; // Handle case where there is no duck data
  }

  return (
    <Card>
      <Image src={duckData.image} wrapped ui={false} />
      <Card.Content>
        <Card.Header>{duckData.name}</Card.Header>
      </Card.Content>
      <Card.Content extra>
        <Button primary>More Details</Button> 
      </Card.Content>
    </Card>
  );
};

export default DuckProfile;
