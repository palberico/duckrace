import React from 'react';
import { Icon } from 'semantic-ui-react';

const DangerZone = ({ handleDeleteDuck, deleteInput, handleDeleteInputChange }) => {
    return (
        <div className="glass-card danger" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-header">
                <h2>Danger Zone</h2>
            </div>

            <form className="custom-form" onSubmit={(e) => { e.preventDefault(); handleDeleteDuck(); }}>
                <label style={{ color: 'var(--neon-red)' }}>Delete Duck (Name or Code)</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        className="custom-input"
                        placeholder='Enter Name or Code to Delete'
                        value={deleteInput}
                        onChange={handleDeleteInputChange}
                        style={{ marginBottom: 0 }}
                    />
                    <button type="submit" className="custom-btn danger" style={{ width: 'auto', whiteSpace: 'nowrap' }}>
                        Gone Foreves
                    </button>
                </div>
                <p style={{ color: '#ffaaaa', marginTop: '1rem', fontSize: '0.9rem' }}>
                    <Icon name='warning sign' /> Warning: Deleting a duck is permanent and cannot be undone. All associated location history will be wiped.
                </p>
            </form>
        </div>
    );
};

export default DangerZone;
