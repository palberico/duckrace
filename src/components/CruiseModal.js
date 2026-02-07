import React from 'react';
import { Button } from 'semantic-ui-react';

const CruiseModal = ({ open, onClose, onAddAnotherPort, onFinish, duckName, addedMiles }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--neon-blue)', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '1.8rem' }}>
          We love cruising!
        </h2>

        <div style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          <p style={{ marginBottom: '1rem' }}>Please enter each port we visited on this cruise and hide me again when you disembark.</p>
          <p style={{ color: 'white', fontWeight: 'bold' }}>Thanks for logging miles for {duckName}!</p>
          <p style={{ color: 'var(--neon-yellow)' }}>You added {addedMiles} miles this leg.</p>
          <p style={{ marginTop: '1.5rem' }}>Would you like to add another port?</p>
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexDirection: 'column' }}>
          <Button
            onClick={() => {
              console.log("Adding another port");
              onAddAnotherPort();
            }}
            style={{
              background: 'var(--neon-blue)',
              color: 'black',
              fontWeight: 'bold',
              border: 'none',
              padding: '1rem',
              borderRadius: '8px',
              textTransform: 'uppercase',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)',
              width: '100%'
            }}>
            Yes, add another port
          </Button>

          <Button
            onClick={() => {
              console.log("Finished adding ports");
              onFinish();
            }}
            basic
            inverted
            style={{
              boxShadow: 'none',
              marginTop: '0.5rem',
              width: '100%'
            }}>
            No, I'm finished
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CruiseModal;
