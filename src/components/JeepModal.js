import React from 'react';
import { Button, Modal } from 'semantic-ui-react';

const JeepModal = ({ open, onClose, duckName, addedMiles }) => (
  <Modal open={open} onClose={onClose}>
    <Modal.Header>Beep...Beep...Who's got the keys to my Jeep?</Modal.Header>
    
    <Modal.Content>
      <p>VROOOOOM...!</p>
      <p>Thanks for logging miles for {duckName}! You added {addedMiles} miles to its journey.</p>
      <p>Keep {duckName} in your Jeep until you visit another town and then pass me on.</p>
    </Modal.Content>
    <Modal.Actions>
      <Button onClick={onClose}>Close</Button>
    </Modal.Actions>
  </Modal>
);

export default JeepModal;
