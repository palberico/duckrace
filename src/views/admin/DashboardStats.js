import React from 'react';
import { Icon, Button } from 'semantic-ui-react';

const DashboardStats = ({
    totalDucks,
    totalDistance,
    mostActiveDuck,
    unapprovedPhotos,
    onTotalDucksClick,
    onRegisterClick,
    onApprovalsClick,
    onMostActiveDuckClick
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

            {/* Quick Actions Row */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                <Button
                    primary
                    size='large'
                    onClick={onRegisterClick}
                    style={{
                        background: 'var(--neon-blue)',
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 0 15px rgba(0, 240, 255, 0.3)',
                        flex: '1 1 200px',
                        maxWidth: '250px'
                    }}
                >
                    <Icon name='plus circle' /> Register New Duck
                </Button>
                <Button
                    size='large'
                    onClick={onApprovalsClick}
                    style={{
                        background: unapprovedPhotos.length > 0 ? 'var(--neon-yellow)' : 'rgba(255, 255, 255, 0.1)',
                        color: unapprovedPhotos.length > 0 ? '#000' : '#fff',
                        fontWeight: 'bold',
                        boxShadow: unapprovedPhotos.length > 0 ? '0 0 15px rgba(255, 255, 0, 0.3)' : 'none',
                        flex: '1 1 200px',
                        maxWidth: '250px',
                        position: 'relative'
                    }}
                >
                    <Icon name='camera' /> View Approvals
                    {unapprovedPhotos.length > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: '#ff0000',
                            color: 'white',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            {unapprovedPhotos.length}
                        </span>
                    )}
                </Button>
                <Button
                    size='large'
                    onClick={onTotalDucksClick}
                    style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        fontWeight: 'bold',
                        flex: '1 1 200px',
                        maxWidth: '250px'
                    }}
                >
                    <Icon name='list' /> Manage Ducks
                </Button>
            </div>

            {/* Stats Grid - 2 rows x 3 columns */}
            <div className="stats-grid">
                {/* Row 1 */}
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
                <div className="stat-card">
                    <Icon name='camera' className="stat-icon" />
                    <div className="stat-content">
                        <h3>Pending Photos</h3>
                        <div className="value" style={{ color: unapprovedPhotos.length > 0 ? 'var(--neon-yellow)' : 'white' }}>
                            {unapprovedPhotos.length}
                        </div>
                    </div>
                </div>
                <div className="stat-card" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Icon name='server' className="stat-icon" style={{ color: '#0f0', background: 'rgba(0, 255, 0, 0.1)' }} />
                    <div className="stat-content">
                        <h3>System Status</h3>
                        <div className="value" style={{ fontSize: '1.2rem', color: '#0f0' }}>● Online</div>
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
                    style={{ cursor: mostActiveDuck ? 'pointer' : 'default' }}
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
                <div className="stat-card" style={{ borderColor: 'rgba(255,255,255,0.1)', opacity: 0.5 }}>
                    <Icon name='chart line' className="stat-icon" style={{ color: '#888', background: 'rgba(255, 255, 255, 0.05)' }} />
                    <div className="stat-content">
                        <h3>Coming Soon</h3>
                        <div className="value" style={{ fontSize: '1rem', color: '#888' }}>-</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardStats;
