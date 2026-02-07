import React from 'react';
import { Loader, Icon } from 'semantic-ui-react';

const ApprovalsTable = ({ unapprovedPhotos, photosLoading, handleApprovePhoto, handleDeletePhoto }) => {
    return (
        <div className="glass-card">
            <div className="glass-header">
                <h2>Photo Approvals</h2>
            </div>

            {photosLoading ? (
                <Loader active inline='centered'>Box...Box...</Loader>
            ) : (
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>User / Info</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {unapprovedPhotos.length === 0 ? (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '3rem', color: '#666', fontStyle: 'italic' }}>
                                    <Icon name='check circle' size='large' /> No photos pending approval.
                                </td>
                            </tr>
                        ) : (
                            unapprovedPhotos.map((photo) => (
                                <tr key={photo.id}>
                                    <td style={{ width: '150px' }}>
                                        <img src={photo.photoURL} alt="Approval" style={{ width: '100px', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }} />
                                    </td>
                                    <td>
                                        <div style={{ color: '#fff', fontWeight: 'bold' }}>ID: {photo.id.substring(0, 8)}...</div>
                                    </td>
                                    <td>
                                        <button className="btn-icon green" onClick={() => handleApprovePhoto(photo.id)} title="Approve">
                                            <Icon name='checkmark' /> Approve
                                        </button>
                                        <button className="btn-icon red" onClick={() => handleDeletePhoto(photo.id, photo.photoURL)} title="Delete">
                                            <Icon name='trash' /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default ApprovalsTable;
