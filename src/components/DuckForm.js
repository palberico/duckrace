import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../views/firebase';




const DuckForm = () => {
  const { duckId } = useParams();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const updatedData = Object.fromEntries(formData.entries());

    const docRef = doc(db, "ducks", duckId);
    await updateDoc(docRef, updatedData);

    navigate('/home');
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" name="name" required />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea id="description" name="description" required></textarea>
      </div>
      <button type="submit">Submit</button>
    </form>
  );
};

export default DuckForm;
