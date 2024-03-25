import React from 'react';
import { Button, Modal } from 'semantic-ui-react';

const StandardModal = ({ open, onClose, duckName, addedMiles }) => (
  <Modal open={open} onClose={onClose}>
    <Modal.Header>Thank You!</Modal.Header>
    <Modal.Content>
      <p>Thanks for logging miles for {duckName}! You added {addedMiles} miles to its journey.</p>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={onClose}>Close</Button>
    </Modal.Actions>
  </Modal>
);

export default StandardModal;
