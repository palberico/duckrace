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

  return (
    <Modal open={open} onClose={handleClose} size='small'>
      <Header>Enter {duckName}'s Six Digit Code.</Header>
      <Modal.Content>
        <p>To log distances for this duck, please enter its unique code:</p>
        <Input value={code} onChange={(e) => setCode(e.target.value)} fluid />
        {isCodeIncorrect && (
          <Message negative>
            <Message.Header>Incorrect Code - Please try again.</Message.Header>
          </Message>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button positive onClick={handleSubmit} loading={loading} disabled={loading}>Submit</Button>
      </Modal.Actions>
    </Modal>
  );
};

export default DuckCodeModal;
