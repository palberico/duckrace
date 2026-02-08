import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/Config';
import { Icon } from 'semantic-ui-react';

const DashboardMap = () => {
    const [duckLocations, setDuckLocations] = useState([]);
    const [selectedDuck, setSelectedDuck] = useState(null);
    const [mapCenter, setMapCenter] = useState({ lat: 39.8283, lng: -98.5795 }); // Center of USA
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDuckLocations();
    }, []);

    const fetchDuckLocations = async () => {
        try {
            const ducksSnapshot = await getDocs(collection(db, 'ducks'));
            const locations = [];

            for (const duckDoc of ducksSnapshot.docs) {
                const duckData = duckDoc.data();

                // Get most recent location for this duck
                const locationsQuery = query(
                    collection(db, 'locations'),
                    where('duckId', '==', duckDoc.id),
                    orderBy('createdAt', 'desc'),
                    limit(1)
                );
                const locationsSnapshot = await getDocs(locationsQuery);

                if (!locationsSnapshot.empty) {
                    const locationData = locationsSnapshot.docs[0].data();
                    const coords = locationData.coordinates;

                    if (coords && coords.latitude && coords.longitude) {
                        locations.push({
                            duckId: duckDoc.id,
                            duckName: duckData.name,
                            position: {
                                lat: coords.latitude,
                                lng: coords.longitude
                            },
                            location: locationData.location || 'Unknown',
                            distance: duckData.distance || 0
                        });
                    }
                }
            }

            setDuckLocations(locations);

            // Calculate center based on all locations
            if (locations.length > 0) {
                const avgLat = locations.reduce((sum, loc) => sum + loc.position.lat, 0) / locations.length;
                const avgLng = locations.reduce((sum, loc) => sum + loc.position.lng, 0) / locations.length;
                setMapCenter({ lat: avgLat, lng: avgLng });
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching duck locations:', error);
            setLoading(false);
        }
    };

    const mapContainerStyle = {
        width: '100%',
        height: '500px',
        borderRadius: '12px'
    };

    const mapOptions = {
        styles: [
            {
                "elementType": "geometry",
                "stylers": [{ "color": "#212121" }]
            },
            {
                "elementType": "labels.icon",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#757575" }]
            },
            {
                "elementType": "labels.text.stroke",
                "stylers": [{ "color": "#212121" }]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{ "color": "#000000" }]
            },
            {
                "featureType": "water",
                "elementType": "labels.text.fill",
                "stylers": [{ "color": "#3d3d3d" }]
            }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    };

    if (loading) {
        return (
            <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#aaa'
            }}>
                <Icon name='spinner' loading size='big' />
                <p style={{ marginTop: '1rem' }}>Loading map...</p>
            </div>
        );
    }

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{
                color: 'var(--neon-blue)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <Icon name='map' />
                Duck Locations Map
                <span style={{
                    fontSize: '0.9rem',
                    color: '#aaa',
                    fontWeight: 'normal'
                }}>
                    ({duckLocations.length} ducks)
                </span>
            </h3>

            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={4}
                    options={mapOptions}
                >
                    {duckLocations.map((duck) => (
                        <Marker
                            key={duck.duckId}
                            position={duck.position}
                            onClick={() => setSelectedDuck(duck)}
                            icon={{
                                path: window.google.maps.SymbolPath.CIRCLE,
                                fillColor: '#00f0ff',
                                fillOpacity: 0.8,
                                strokeColor: '#ffffff',
                                strokeWeight: 2,
                                scale: 8
                            }}
                        />
                    ))}

                    {selectedDuck && (
                        <InfoWindow
                            position={selectedDuck.position}
                            onCloseClick={() => setSelectedDuck(null)}
                        >
                            <div style={{
                                padding: '0.5rem',
                                color: '#000'
                            }}>
                                <h4 style={{ margin: '0 0 0.5rem 0' }}>
                                    {selectedDuck.duckName}
                                </h4>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                                    <strong>Location:</strong> {selectedDuck.location}
                                </p>
                                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem' }}>
                                    <strong>Distance:</strong> {selectedDuck.distance} miles
                                </p>
                                <a
                                    href={`/duck/${selectedDuck.duckId}`}
                                    style={{
                                        color: '#00f0ff',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    View Profile →
                                </a>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </LoadScript>
        </div>
    );
};

export default DashboardMap;
