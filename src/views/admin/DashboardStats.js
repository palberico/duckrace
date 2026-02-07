import React from 'react';
import { Icon } from 'semantic-ui-react';

const DashboardStats = ({ totalDucks, unapprovedPhotos, onTotalDucksClick }) => {
    return (
        <div className="dashboard-view fade-in">
            {/* Welcome Card - Top & White */}
            <div className="glass-card light" style={{ textAlign: 'center', marginBottom: '3rem', maxWidth: '100%' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#333' }}>Welcome Administrator</h2>
                <p style={{ color: '#555', fontSize: '1.2rem' }}>
                    Manage your fleet, approve photos, and monitor system status below.
                </p>
            </div>

            {/* Stats Row - Bottom */}
            <div className="stats-grid">
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
            </div>
        </div>
    );
};

export default DashboardStats;
