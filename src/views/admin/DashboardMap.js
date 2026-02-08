import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase/Config';
import { Icon } from 'semantic-ui-react';

const DashboardMap = () => {
    const [duckLocations, setDuckLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        console.log('🦆 DashboardMap: Component mounted, starting fetchDuckLocations');
        fetchDuckLocations();
    }, []);

    useEffect(() => {
        if (duckLocations.length > 0 && mapRef.current && !mapInstanceRef.current) {
            console.log('🦆 DashboardMap: Initializing map with', duckLocations.length, 'locations');
            initializeMap();
        }
    }, [duckLocations]);

    const fetchDuckLocations = async () => {
        try {
            console.log('🦆 DashboardMap: Fetching ducks from Firestore');
            const ducksSnapshot = await getDocs(collection(db, 'ducks'));
            console.log('🦆 DashboardMap: Found', ducksSnapshot.docs.length, 'ducks');
            const locations = [];

            for (const duckDoc of ducksSnapshot.docs) {
                const duckData = duckDoc.data();
                console.log('🦆 DashboardMap: Processing duck:', duckData.name, 'ID:', duckDoc.id);
                
                // Get all locations for this duck
                const locationsQuery = query(
                    collection(db, 'locations'),
                    where('duckId', '==', duckDoc.id)
                );
                const locationsSnapshot = await getDocs(locationsQuery);
                console.log('🦆 DashboardMap: Found', locationsSnapshot.docs.length, 'locations for', duckData.name);

                if (!locationsSnapshot.empty) {
                    // Sort locations by timestamp in JavaScript to get most recent
                    const allLocations = locationsSnapshot.docs.map(doc => doc.data());
                    allLocations.sort((a, b) => {
                        const timeA = a.timestamp?.toDate() || new Date(0);
                        const timeB = b.timestamp?.toDate() || new Date(0);
                        return timeB - timeA;
                    });
                    
                    const locationData = allLocations[0];
                    const coords = locationData.coordinates;
                    console.log('🦆 DashboardMap: Most recent coords for', duckData.name, ':', coords);
                    
                    if (coords && coords.latitude && coords.longitude) {
                        locations.push({
                            duckId: duckDoc.id,
                            duckName: duckData.name,
                            lat: coords.latitude,
                            lng: coords.longitude,
                            location: locationData.location || 'Unknown',
                            distance: duckData.distance || 0
                        });
                        console.log('🦆 DashboardMap: ✅ Added location for', duckData.name);
                    } else {
                        console.log('🦆 DashboardMap: ❌ Invalid coords for', duckData.name, coords);
                    }
                }
            }

            console.log('🦆 DashboardMap: FINAL - Total locations to display:', locations.length);
            setDuckLocations(locations);
            setLoading(false);
        } catch (error) {
            console.error('🦆 DashboardMap: ERROR fetching duck locations:', error);
            setLoading(false);
        }
    };

    const initializeMap = () => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
        });

        const duckIcon = L.divIcon({
            className: 'custom-duck-marker',
            html: '<div style="background: #00f0ff; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,240,255,0.5);"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8],
            popupAnchor: [0, -8]
        });

        const map = L.map(mapRef.current, {
            scrollWheelZoom: true,
            dragging: true,
            zoomControl: true,
        });

        mapInstanceRef.current = map;

        // Standard OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(map);

        const bounds = [];
        duckLocations.forEach((duck) => {
            const latLng = [duck.lat, duck.lng];
            bounds.push(latLng);

            const marker = L.marker(latLng, { icon: duckIcon }).addTo(map);
            
            marker.bindPopup(`
                <div style="color: #000; padding: 0.5rem;">
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">${duck.duckName}</h4>
                    <p style="margin: 0.25rem 0; font-size: 0.85rem;"><strong>Location:</strong> ${duck.location}</p>
                    <p style="margin: 0.25rem 0; font-size: 0.85rem;"><strong>Distance:</strong> ${duck.distance} miles</p>
                    <a href="/duck/${duck.duckId}" style="color: #00f0ff; text-decoration: none; font-weight: bold; font-size: 0.85rem;">
                        View Profile →
                    </a>
                </div>
            `);
        });

        if (bounds.length > 0) {
            const latLngBounds = L.latLngBounds(bounds);
            map.fitBounds(latLngBounds, { padding: [50, 50] });
        }

        setTimeout(() => {
            if (map) {
                map.invalidateSize();
            }
        }, 100);
    };

    useEffect(() => {
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

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

    if (duckLocations.length === 0) {
        return (
            <div style={{ 
                textAlign: 'center', 
                padding: '2rem',
                color: '#aaa',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                marginTop: '2rem'
            }}>
                <Icon name='map outline' size='huge' style={{ color: '#555' }} />
                <p style={{ marginTop: '1rem' }}>No duck locations to display</p>
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
            
            <div 
                ref={mapRef} 
                style={{ 
                    height: '500px', 
                    width: '100%',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }} 
            />
        </div>
    );
};

export default DashboardMap;
