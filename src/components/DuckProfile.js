import React, { useEffect, useState } from 'react';
import { Card, Image, Button } from 'semantic-ui-react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase/Config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const DuckProfile = () => {
  const { duckName } = useParams();
  const [duckData, setDuckData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDuckData = async () => {
      try {
        // Create a query against the collection.
        const ducksCollectionRef = collection(db, 'ducks');
        const q = query(ducksCollectionRef, where("name", "==", duckName));
        const querySnapshot = await getDocs(q);

        // Assuming that duck names are unique, there should only be one document.
        if (!querySnapshot.empty) {
          // Get the first document in the results.
          const duckDocument = querySnapshot.docs[0];
          setDuckData(duckDocument.data());
        } else {
          console.log('No matching document.');
        }
      } catch (error) {
        console.error('Error fetching duck data:', error);
      }
      setLoading(false);
    };

    fetchDuckData();
  }, [duckName]); // Dependency array ensures this effect runs when duckName changes

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
        <Button primary>More Details</Button> {/* This button can be linked to more details in the future */}
      </Card.Content>
    </Card>
  );
};

export default DuckProfile;
