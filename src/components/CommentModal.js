import React, { useState } from 'react';
import { Button, Icon } from 'semantic-ui-react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase/Config';

const CommentModal = ({
    open,
    onClose,
    onSkip,
    duckId,
    duckCode,
    duckName,
    locationId,
    transportType // 'cruise' or 'jeep'
}) => {
    const [firstName, setFirstName] = useState('');
    const [hometown, setHometown] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName.trim() || !hometown.trim() || !comment.trim()) {
            alert('Please fill in your name, hometown, and comment');
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, 'comments'), {
                duckId,
                duckCode,
                duckName,
                firstName: firstName.trim(),
                hometown: hometown.trim(),
                email: email.trim() || null,
                comment: comment.trim(),
                transportType,
                locationId,
                timestamp: Timestamp.now(),
                approved: false,
                approvedBy: null,
                approvedAt: null,
                rejected: false,
                rejectedBy: null,
                rejectedAt: null
            });

            alert('Thank you! Your comment will appear after admin approval.');
            onClose();
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Error submitting comment. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onSkip}>
            <div className="glass-card modal-content" onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '600px', width: '90%', padding: '2rem' }}>

                <h2 style={{ color: 'var(--neon-blue)', marginBottom: '1rem', textAlign: 'center' }}>
                    Share Your Story!
                </h2>

                <p style={{ color: '#ccc', textAlign: 'center', marginBottom: '2rem' }}>
                    Leave a comment about finding {duckName}
                </p>

                <form className="custom-form" onSubmit={handleSubmit}>
                    <div>
                        <label>First Name *</label>
                        <input
                            className="custom-input"
                            type="text"
                            placeholder="Your first name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            maxLength={50}
                            required
                        />
                    </div>

                    <div>
                        <label>Hometown *</label>
                        <input
                            className="custom-input"
                            type="text"
                            placeholder="City, State/Country"
                            value={hometown}
                            onChange={(e) => setHometown(e.target.value)}
                            maxLength={100}
                            required
                        />
                    </div>

                    <div>
                        <label>Email (Optional)</label>
                        <input
                            className="custom-input"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                            We'll only use this to notify you when your comment is approved
                        </p>
                    </div>

                    <div>
                        <label>Comment *</label>
                        <textarea
                            className="custom-input"
                            rows={4}
                            placeholder="Tell us about finding this duck..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            maxLength={500}
                            required
                        />
                        <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.25rem' }}>
                            {comment.length}/500 characters
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexDirection: 'column' }}>
                        <Button
                            type="submit"
                            disabled={submitting}
                            style={{
                                background: 'var(--neon-blue)',
                                color: 'black',
                                fontWeight: 'bold',
                                width: '100%',
                                padding: '1rem'
                            }}
                        >
                            {submitting ? 'Submitting...' : 'Leave Comment'}
                        </Button>

                        <Button
                            type="button"
                            onClick={onSkip}
                            basic
                            inverted
                            style={{ width: '100%' }}
                        >
                            Skip to Duck Profile
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentModal;
