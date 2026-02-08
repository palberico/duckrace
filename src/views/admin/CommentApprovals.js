import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/Config';
import { Icon, Button, Loader } from 'semantic-ui-react';

const CommentApprovals = () => {
    const [pendingComments, setPendingComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingComments();
    }, []);

    const fetchPendingComments = async () => {
        setLoading(true);
        try {
            // Simpler query to avoid needing composite index
            const q = query(
                collection(db, 'comments'),
                where('approved', '==', false),
                where('rejected', '==', false)
            );
            const snapshot = await getDocs(q);
            const comments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort client-side by timestamp descending
            comments.sort((a, b) => {
                const timeA = a.timestamp?.toDate() || new Date(0);
                const timeB = b.timestamp?.toDate() || new Date(0);
                return timeB - timeA;
            });
            setPendingComments(comments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (commentId) => {
        try {
            await updateDoc(doc(db, 'comments', commentId), {
                approved: true,
                approvedAt: Timestamp.now(),
                approvedBy: 'admin' // TODO: Use actual admin user ID when auth is implemented
            });
            fetchPendingComments();
        } catch (error) {
            console.error('Error approving comment:', error);
            alert('Error approving comment. Please try again.');
        }
    };

    const handleReject = async (commentId) => {
        if (!window.confirm('Are you sure you want to reject this comment?')) {
            return;
        }

        try {
            await updateDoc(doc(db, 'comments', commentId), {
                rejected: true,
                rejectedAt: Timestamp.now(),
                rejectedBy: 'admin' // TODO: Use actual admin user ID when auth is implemented
            });
            fetchPendingComments();
        } catch (error) {
            console.error('Error rejecting comment:', error);
            alert('Error rejecting comment. Please try again.');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div className="glass-header">
                <h2>Comment Approvals</h2>
            </div>

            {loading ? (
                <Loader active inline='centered' style={{ marginTop: '3rem' }}>Loading Comments...</Loader>
            ) : pendingComments.length === 0 ? (
                <div className="glass-card" style={{ marginTop: '2rem', padding: '3rem', textAlign: 'center' }}>
                    <Icon name="check circle" size="huge" style={{ color: 'var(--neon-blue)', marginBottom: '1rem' }} />
                    <p style={{ color: '#aaa', fontSize: '1.1rem' }}>
                        No pending comments to review
                    </p>
                </div>
            ) : (
                <div style={{ marginTop: '2rem' }}>
                    <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
                        {pendingComments.length} comment{pendingComments.length !== 1 ? 's' : ''} pending approval
                    </p>

                    {pendingComments.map(comment => (
                        <div key={comment.id} className="glass-card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                                <Icon
                                    name={comment.transportType === 'cruise' ? 'ship' : 'car'}
                                    size="big"
                                    style={{ color: 'var(--neon-blue)', marginTop: '0.25rem' }}
                                />

                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <strong style={{ color: 'white', fontSize: '1.1rem' }}>{comment.firstName}</strong>
                                        <span style={{ color: '#888', marginLeft: '0.5rem' }}>from {comment.hometown}</span>
                                    </div>

                                    <div style={{ marginBottom: '0.75rem', color: '#aaa', fontSize: '0.9rem' }}>
                                        Duck: <strong style={{ color: 'var(--neon-blue)' }}>{comment.duckName}</strong> ({comment.duckCode})
                                    </div>

                                    {comment.email && (
                                        <div style={{ marginBottom: '0.75rem', color: '#666', fontSize: '0.85rem' }}>
                                            <Icon name="mail" size="small" /> {comment.email}
                                        </div>
                                    )}

                                    <div style={{
                                        background: 'rgba(0, 240, 255, 0.05)',
                                        border: '1px solid rgba(0, 240, 255, 0.2)',
                                        borderRadius: '8px',
                                        padding: '1rem',
                                        marginBottom: '1rem'
                                    }}>
                                        <p style={{ color: '#ccc', fontStyle: 'italic', margin: 0 }}>
                                            "{comment.comment}"
                                        </p>
                                    </div>

                                    <div style={{ fontSize: '0.85rem', color: '#666' }}>
                                        <Icon name="clock" size="small" />
                                        {comment.timestamp?.toDate().toLocaleString()}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                <Button
                                    onClick={() => handleApprove(comment.id)}
                                    style={{
                                        background: 'var(--neon-blue)',
                                        color: 'black',
                                        flex: 1,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <Icon name="check" /> Approve
                                </Button>
                                <Button
                                    onClick={() => handleReject(comment.id)}
                                    style={{
                                        background: '#ff4444',
                                        color: 'white',
                                        flex: 1,
                                        fontWeight: 'bold'
                                    }}
                                >
                                    <Icon name="times" /> Reject
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CommentApprovals;
