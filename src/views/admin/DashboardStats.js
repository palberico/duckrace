import React from 'react';
import { Icon } from 'semantic-ui-react';
import DashboardMap from './DashboardMap';

const DashboardStats = ({
    totalDucks,
    totalDistance,
    mostActiveDuck,
    inactiveDucks,
    unapprovedPhotos,
    onTotalDucksClick,
    onRegisterClick,
    onApprovalsClick,
    onMostActiveDuckClick,
    onInactiveDucksClick
}) => {
    // Format number with commas
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };

    return (
        <div className="dashboard-view fade-in">
            {/* Header with glass-header class */}
            <div className="glass-header">
                <h2>Welcome Administrator</h2>
            </div>

            {/* Subtitle below divider */}
            <p style={{ color: '#aaa', fontSize: '1.1rem', textAlign: 'center', marginBottom: '2rem' }}>
                Manage your fleet, approve photos, and monitor system status below.
            </p>

            {/* Stats Grid - 2 rows x 3 columns */}
            <div className="stats-grid">
                {/* Row 1 - Reordered: Register, Total Ducks, Pending Photos */}
                <div
                    className="stat-card"
                    onClick={onRegisterClick}
                    style={{
                        cursor: 'pointer',
                        borderColor: 'var(--neon-blue)',
                        background: 'rgba(0, 240, 255, 0.05)'
                    }}
                >
                    <Icon name='plus circle' className="stat-icon" style={{ color: 'var(--neon-blue)', background: 'rgba(0, 240, 255, 0.1)' }} />
                    <div className="stat-content">
                        <h3>Register New Duck</h3>
                        <div className="value" style={{ fontSize: '1.2rem', color: 'var(--neon-blue)' }}>+ Add</div>
                    </div>
                </div>
                <div
                    className="stat-card"
                    onClick={onTotalDucksClick}
                    style={{ cursor: 'pointer' }}
                >
                    <Icon name='users' className="stat-icon" />
                    <div className="stat-content">
                        <h3>Total Ducks</h3>
                        <div className="value">{totalDucks}</div>
                    </div>
                </div>
                <div
                    className="stat-card"
                    onClick={onApprovalsClick}
                    style={{ cursor: 'pointer' }}
                >
                    <Icon name='camera' className="stat-icon" />
                    <div className="stat-content">
                        <h3>Pending Photos</h3>
                        <div className="value" style={{ color: unapprovedPhotos.length > 0 ? 'var(--neon-yellow)' : 'white' }}>
                            {unapprovedPhotos.length}
                        </div>
                    </div>
                </div>

                {/* Row 2 */}
                <div className="stat-card">
                    <Icon name='world' className="stat-icon" style={{ color: 'var(--neon-blue)', background: 'rgba(0, 240, 255, 0.1)' }} />
                    <div className="stat-content">
                        <h3>Total Distance</h3>
                        <div className="value" style={{ color: 'var(--neon-blue)' }}>
                            {formatNumber(totalDistance)} <span style={{ fontSize: '0.8rem' }}>Miles</span>
                        </div>
                    </div>
                </div>
                <div
                    className="stat-card"
                    onClick={() => mostActiveDuck && onMostActiveDuckClick(mostActiveDuck.id)}
                    style={{
                        cursor: mostActiveDuck ? 'pointer' : 'default',
                        border: '2px solid #ffd700'
                    }}
                >
                    <Icon name='trophy' className="stat-icon" style={{ color: 'var(--neon-yellow)', background: 'rgba(255, 255, 0, 0.1)' }} />
                    <div className="stat-content">
                        <h3>Most Active Duck</h3>
                        {mostActiveDuck ? (
                            <>
                                <div className="value" style={{ fontSize: '1rem', color: 'var(--neon-yellow)' }}>
                                    {mostActiveDuck.name}
                                </div>
                                <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '0.25rem' }}>
                                    {mostActiveDuck.locationCount} locations
                                </div>
                            </>
                        ) : (
                            <div className="value" style={{ fontSize: '1rem' }}>-</div>
                        )}
                    </div>
                </div>
                <div
                    className="stat-card"
                    onClick={onInactiveDucksClick}
                    style={{
                        cursor: 'pointer',
                        borderColor: inactiveDucks.length > 0 ? '#ff6b6b' : 'rgba(255,255,255,0.1)'
                    }}
                >
                    <Icon name='warning sign' className="stat-icon" style={{
                        color: inactiveDucks.length > 0 ? '#ff6b6b' : '#888',
                        background: inactiveDucks.length > 0 ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 255, 255, 0.05)'
                    }} />
                    <div className="stat-content">
                        <h3>Inactive Ducks</h3>
                        <div className="value" style={{
                            fontSize: '1.2rem',
                            color: inactiveDucks.length > 0 ? '#ff6b6b' : '#888'
                        }}>
                            {inactiveDucks.length}
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive Map Preview */}
            <DashboardMap />
        </div>
    );
};

export default DashboardStats;
