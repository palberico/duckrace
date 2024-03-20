import React from 'react';
import { Modal, Header, Input, Message, Button } from 'semantic-ui-react';

const DuckCodeModal = ({ open, handleClose, code, setCode, isCodeIncorrect, handleCodeSubmit, duckName }) => {
  return (
    <Modal open={open} onClose={handleClose} size='small'>
      <Header>Enter {duckName}'s Six Digit Code.</Header>
      <Modal.Content>
        <p>To log distances for this duck, please enter its unique code:</p>
        <Input value={code} onChange={(e) => setCode(e.target.value)} fluid />
        {isCodeIncorrect && (
          <Message negative>
            <Message.Header>Incorrect Code</Message.Header>
            <p>Please try again.</p>
          </Message>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button positive onClick={handleCodeSubmit}>Submit</Button>
      </Modal.Actions>
    </Modal>
  );
};

export default DuckCodeModal;
