import React from 'react';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const InactiveDucks = ({ inactiveDucks }) => {
    const formatDate = (date) => {
        if (!date) return 'Never';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="dashboard-view fade-in">
            <div className="glass-header">
                <h2>Inactive Ducks</h2>
                <p style={{ color: '#aaa', fontSize: '1rem', marginTop: '0.5rem' }}>
                    Ducks with no activity in the past 6 months
                </p>
            </div>

            {inactiveDucks.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '3rem',
                    color: '#0f0',
                    fontSize: '1.2rem'
                }}>
                    <Icon name='check circle' size='huge' style={{ color: '#0f0' }} />
                    <p style={{ marginTop: '1rem' }}>All ducks are active!</p>
                </div>
            ) : (
                <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginTop: '1.5rem'
                }}>
                    <table style={{
                        width: '100%',
                        borderCollapse: 'collapse',
                        color: '#fff'
                    }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.1)' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--neon-yellow)' }}>
                                    Duck Name
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--neon-yellow)' }}>
                                    Last Update
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--neon-yellow)' }}>
                                    Days Inactive
                                </th>
                                <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--neon-yellow)' }}>
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {inactiveDucks.map((duck) => (
                                <tr
                                    key={duck.id}
                                    style={{
                                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '1rem' }}>
                                        <Icon name='warning sign' style={{ color: '#ff6b6b', marginRight: '0.5rem' }} />
                                        {duck.name}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#aaa' }}>
                                        {formatDate(duck.lastUpdate)}
                                    </td>
                                    <td style={{ padding: '1rem', color: '#ff6b6b', fontWeight: 'bold' }}>
                                        {duck.daysInactive === 'Never' ? 'Never' : `${duck.daysInactive} days`}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                                        <Link
                                            to={`/duck/${duck.id}`}
                                            style={{
                                                color: 'var(--neon-blue)',
                                                textDecoration: 'none',
                                                padding: '0.5rem 1rem',
                                                border: '1px solid var(--neon-blue)',
                                                borderRadius: '6px',
                                                display: 'inline-block',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'var(--neon-blue)';
                                                e.currentTarget.style.color = '#000';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'var(--neon-blue)';
                                            }}
                                        >
                                            <Icon name='eye' /> View Duck
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InactiveDucks;
