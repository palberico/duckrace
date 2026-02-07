import React, { useState } from 'react';
import { Modal, Header, Input, Message, Button } from 'semantic-ui-react';

const DuckCodeModal = ({ open, handleClose, code, setCode, isCodeIncorrect, handleCodeSubmit, duckName }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true); // Start loading
    try {
      await handleCodeSubmit(); // Execute the passed submit function
    } finally {
      setLoading(false); // Stop loading regardless of the result
    }
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ color: 'var(--neon-blue)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Found {duckName}?</h2>
          <p style={{ color: '#aaa' }}>Enter the 6-digit code found on the duck to log its journey.</p>
        </div>

        <Input
          placeholder='ENTER CODE'
          value={code}
          onChange={(e) => setCode(e.target.value)}
          fluid
          className="custom-input-modal"
          style={{ marginBottom: '1.5rem', fontSize: '1.5rem', textAlign: 'center' }}
          maxLength={6}
        />

        {isCodeIncorrect && (
          <div style={{ color: 'var(--neon-red)', marginBottom: '1rem', fontWeight: 'bold' }}>
            Incorrect Code - Try Again
          </div>
        )}

        <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Button basic inverted onClick={handleClose} style={{ flex: 1 }}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading || code.length !== 6}
            style={{
              flex: 1,
              background: 'var(--neon-blue)',
              color: 'black',
              fontWeight: 'bold',
              border: 'none',
              boxShadow: '0 0 10px rgba(0, 240, 255, 0.3)'
            }}>
            Verify Code
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DuckCodeModal;
