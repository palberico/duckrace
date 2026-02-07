import React from 'react';
import { Modal, Button, Header } from 'semantic-ui-react';
import MapCard from './MapCard';
import countryOptions from './data/Countries';
import { getDistanceFromLatLonInKm } from './data/geoUtils';

const LocationDetailsModal = ({ open, onClose, location }) => {
    if (!location) return null;

    const getCountryFullName = (countryCode) => {
        if (!countryCode) return '';
        const country = countryOptions.find(option => option.key === countryCode.toLowerCase());
        return country ? country.text : countryCode;
    };

    const formatLocation = (loc) => {
        if (!loc) return 'Unknown';
        const countryName = getCountryFullName(loc.country);
        return loc.state
            ? `${loc.city}, ${loc.state}`
            : `${loc.city}, ${countryName}`;
    };

    const getDistanceDisplay = () => {
        if (location.distance) return `${location.distance} Miles`;

        if (location.startLocation?.coordinates && location.newLocation?.coordinates) {
            const distKm = getDistanceFromLatLonInKm(
                location.startLocation.coordinates.latitude,
                location.startLocation.coordinates.longitude,
                location.newLocation.coordinates.latitude,
                location.newLocation.coordinates.longitude
            );
            const distMiles = Math.round(distKm * 0.621371);
            return `${distMiles} Miles`;
        }

        return 'N/A';
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            className="glass-modal"
            size="small"
        >
            <Header content="Location Details" />
            <Modal.Content>
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem' }}>
                    <div>
                        <strong style={{ color: 'var(--neon-blue)' }}>Start:</strong> <span style={{ color: '#ddd' }}>{formatLocation(location.startLocation)}</span>
                    </div>
                    <div>
                        <strong style={{ color: 'var(--neon-blue)' }}>End:</strong> <span style={{ color: '#ddd' }}>{formatLocation(location.newLocation)}</span>
                    </div>
                </div>

                {/* Map Container */}
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <MapCard location={location} />
                </div>

                <div style={{ marginTop: '1rem', color: '#aaa', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--neon-blue)' }}>Distance Traveled:</span>
                    <span style={{ color: 'white', fontWeight: 'bold' }}>{getDistanceDisplay()}</span>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button onClick={onClose} style={{ background: 'rgba(255, 255, 255, 0.1)', color: 'white', border: '1px solid rgba(255, 255, 255, 0.2)' }}>
                    Close
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default LocationDetailsModal;
