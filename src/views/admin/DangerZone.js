import React, { useState } from 'react';
import { Icon, Modal, Button } from 'semantic-ui-react';

const DangerZone = ({ handleDeleteDuck, deleteInput, handleDeleteInputChange }) => {
    const [confirmOpen, setConfirmOpen] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (deleteInput.trim()) {
            setConfirmOpen(true);
        }
    };

    const handleConfirmDelete = () => {
        handleDeleteDuck();
        setConfirmOpen(false);
    };

    return (
        <>
            <div className="glass-card danger" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <div className="glass-header">
                    <h2>Danger Zone</h2>
                </div>

                <form className="custom-form" onSubmit={handleSubmit}>
                    <label style={{ color: 'var(--neon-red)' }}>Delete Duck (Name or Code)</label>
                    <input
                        className="custom-input"
                        placeholder='Enter Name or Code to Delete'
                        value={deleteInput}
                        onChange={handleDeleteInputChange}
                    />
                    <button type="submit" className="custom-btn danger" style={{ width: '100%', marginTop: '1rem' }}>
                        <Icon name='trash' /> Gone Foreves
                    </button>
                    <p style={{ color: '#ffaaaa', marginTop: '1rem', fontSize: '0.9rem' }}>
                        <Icon name='warning sign' /> Warning: Deleting a duck is permanent and cannot be undone. All associated location history will be wiped.
                    </p>
                </form>
            </div>

            {/* Themed Confirmation Modal */}
            <Modal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                size='small'
                className='custom-modal'
            >
                <Modal.Header style={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    color: 'white',
                    border: 'none',
                    borderBottom: '1px solid rgba(255, 59, 59, 0.3)'
                }}>
                    <Icon name='warning sign' color='red' /> Confirm Deletion
                </Modal.Header>
                <Modal.Content style={{
                    background: '#1a1a1a',
                    color: 'white',
                    padding: '2rem'
                }}>
                    <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                        Are you sure you want to delete <span style={{ color: 'var(--neon-red)', fontWeight: 'bold' }}>"{deleteInput}"</span>?
                    </p>
                    <p style={{ color: '#ffaaaa', fontSize: '0.95rem' }}>
                        <Icon name='warning' /> This action cannot be undone. All location history will be permanently deleted.
                    </p>
                </Modal.Content>
                <Modal.Actions style={{
                    background: '#1a1a1a',
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '1rem'
                }}>
                    <Button
                        basic
                        inverted
                        onClick={() => setConfirmOpen(false)}
                    >
                        <Icon name='remove' /> No, Cancel
                    </Button>
                    <Button
                        color='red'
                        onClick={handleConfirmDelete}
                    >
                        <Icon name='checkmark' /> Yes, Delete Forever
                    </Button>
                </Modal.Actions>
            </Modal>
        </>
    );
};

export default DangerZone;
