import React from 'react';
import { Button, Modal } from 'semantic-ui-react';

const CruiseModal = ({ open, onClose, onAddAnotherPort, onFinish, duckName, addedMiles }) => {
  console.log("CruiseModal rendering", { open, duckName, addedMiles }); // Logs when the component attempts to render and the current props

  return (
    <Modal open={open} onClose={onClose}>
      <Modal.Header>We love cruising!</Modal.Header>
      <Modal.Content>
        <p>Please enter each port we visited on this cruise and hide me again when you disembark.</p>
        <p>Thanks for logging miles for {duckName}! You added {addedMiles} miles this leg.</p>
        <p>Would you like to add another port?</p>
      </Modal.Content>
      <Modal.Actions>
        <Button onClick={() => {
          console.log("Adding another port"); // Logs when "Yes, add another port" is clicked
          onAddAnotherPort(); // This should likely just be closing the modal, unless additional logic is needed
        }}>Yes, add another port</Button>
        <Button onClick={() => {
          console.log("Finished adding ports"); // Logs when "No, I'm finished" is clicked
          onFinish(); // Here you can call the passed onFinish function, which should handle the modal closure and navigation
        }}>No, I'm finished</Button>
      </Modal.Actions>
    </Modal>
  );
};

export default CruiseModal;
