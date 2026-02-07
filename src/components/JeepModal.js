import React from 'react';
import { Button } from 'semantic-ui-react';

const JeepModal = ({ open, onClose, duckName, addedMiles }) => {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', width: '90%', textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--neon-blue)', marginBottom: '1.5rem', textTransform: 'uppercase', fontSize: '1.8rem', lineHeight: '1.2' }}>
          Beep...Beep... <br /> Who's got the keys to my Jeep?
        </h2>

        <div style={{ color: '#ccc', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
          <p style={{ fontStyle: 'italic', fontSize: '1.5rem', color: 'white', marginBottom: '1rem' }}>VROOOOOM...!</p>
          <p style={{ color: 'white', fontWeight: 'bold' }}>Thanks for logging miles for {duckName}!</p>
          <p style={{ color: 'var(--neon-yellow)' }}>You added {addedMiles} miles to its journey.</p>
          <p style={{ marginTop: '1rem' }}>Keep {duckName} in your Jeep until you visit another town and then pass me on.</p>
        </div>

        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            onClick={onClose}
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
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JeepModal;
