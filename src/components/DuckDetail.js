import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../views/firebase';

const DuckDetail = () => {
  const [duck, setDuck] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { duckId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDuck = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "ducks", duckId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setDuck(docSnap.data());
        } else {
          setError('Duck not found');
        }
      } catch (err) {
        setError('Error fetching duck');
      } finally {
        setLoading(false);
      }
    };

    fetchDuck();
  }, [duckId]);

  const handleCodeSubmit = async () => {
    if (duck && duck.code === code) {
      navigate(`/form/${duckId}`);
    } else {
      setError('Incorrect code');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>{duck.name}</h1>
      <img src={duck.image} alt={duck.name} />
      <div style={{ backgroundImage: duck.footerColor }}></div>

      <input type="text" value={code} onChange={(e) => setCode(e.target.value)} />
      <button onClick={handleCodeSubmit}>Submit Code</button>
    </div>
  );
};

export default DuckDetail;
