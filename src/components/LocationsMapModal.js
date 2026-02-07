import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Icon, Loader } from 'semantic-ui-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/Config';

// Custom Icons
const greenIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const LocationsMapModal = ({ open, onClose, locations, selectedLocation, duckId }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const [showAll, setShowAll] = useState(false);
    const [allLocations, setAllLocations] = useState([]);
    const [loadingAll, setLoadingAll] = useState(false);

    // Initialize Map
    useEffect(() => {
        if (!open || !mapRef.current) return;

        // Cleanup existing map if present
        if (mapInstance.current) {
            mapInstance.current.remove();
        }

        mapInstance.current = L.map(mapRef.current).setView([0, 0], 2);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(mapInstance.current);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [open]);

    // Fetch All Locations when showAll is active
    useEffect(() => {
        const fetchAll = async () => {
            if (showAll && duckId && allLocations.length === 0) {
                setLoadingAll(true);
                try {
                    const q = query(
                        collection(db, 'locations'),
                        where('duckId', '==', duckId),
                        orderBy('timestamp', 'desc')
                    );
                    const snapshot = await getDocs(q);
                    const fetched = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                    setAllLocations(fetched);
                } catch (e) {
                    console.error("Error fetching all locations:", e);
                } finally {
                    setLoadingAll(false);
                }
            }
        };
        fetchAll();
    }, [showAll, duckId, allLocations.length]);

    // Update Markers
    useEffect(() => {
        if (!mapInstance.current || !open) return;

        // Clear existing layers (except tiles)
        mapInstance.current.eachLayer((layer) => {
            if (layer instanceof L.Marker || layer instanceof L.Polyline) {
                mapInstance.current.removeLayer(layer);
            }
        });

        const markers = [];
        const locationsToDisplay = showAll
            ? (allLocations.length > 0 ? allLocations : locations)
            : [];

        if (showAll && locationsToDisplay.length > 0) {
            locationsToDisplay.forEach((loc, index) => {
                // Plot Start Location
                if (loc.startLocation?.coordinates) {
                    const { latitude, longitude } = loc.startLocation.coordinates;
                    const marker = L.marker([latitude, longitude])
                        .addTo(mapInstance.current)
                        .bindPopup(`<b>${loc.startLocation.city}</b><br>${new Date(loc.timestamp.seconds * 1000).toLocaleDateString()}`);
                    markers.push(marker);
                }

                // Plot Final Destination (End Location of the newest/first entry)
                if (index === 0 && loc.newLocation?.coordinates) {
                    const { latitude, longitude } = loc.newLocation.coordinates;
                    // Optional: Different icon for current location? For now standard marker.
                    const marker = L.marker([latitude, longitude])
                        .addTo(mapInstance.current)
                        .bindPopup(`<b>${loc.newLocation.city} (Current)</b><br>${new Date(loc.timestamp.seconds * 1000).toLocaleDateString()}`);
                    markers.push(marker);
                }
            });
        } else if (!showAll && selectedLocation) {
            // Logic for single selected location: Show Start AND End?

            if (selectedLocation.startLocation?.coordinates) {
                const { latitude, longitude } = selectedLocation.startLocation.coordinates;
                const marker = L.marker([latitude, longitude], { icon: greenIcon })
                    .addTo(mapInstance.current)
                    .bindPopup(`<b>Start: ${selectedLocation.startLocation.city}</b>`);
                markers.push(marker);
            }
            if (selectedLocation.newLocation?.coordinates) {
                const { latitude, longitude } = selectedLocation.newLocation.coordinates;
                const marker = L.marker([latitude, longitude], { icon: redIcon })
                    .addTo(mapInstance.current)
                    .bindPopup(`<b>End: ${selectedLocation.newLocation.city}</b>`);
                markers.push(marker);
            }

            // Draw red line between Start and End
            if (selectedLocation.startLocation?.coordinates && selectedLocation.newLocation?.coordinates) {
                const start = [selectedLocation.startLocation.coordinates.latitude, selectedLocation.startLocation.coordinates.longitude];
                const end = [selectedLocation.newLocation.coordinates.latitude, selectedLocation.newLocation.coordinates.longitude];

                L.polyline([start, end], { color: 'red', weight: 4, opacity: 0.7 })
                    .addTo(mapInstance.current);
            }
        }

        // Fit Bounds
        if (markers.length > 0) {
            const group = L.featureGroup(markers);
            mapInstance.current.fitBounds(group.getBounds(), { padding: [50, 50] });
        }

    }, [open, showAll, selectedLocation, locations, allLocations]);

    // Handle initial state when selectedLocation changes
    useEffect(() => {
        if (selectedLocation) {
            setShowAll(false);
            // Optional: Don't reset allLocations here so we don't re-fetch unnecessarily if they toggle back
        }
    }, [selectedLocation]);


    if (!open) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="large"
            closeIcon
            className="glass-modal"
        >
            <Modal.Header>Location Map</Modal.Header>
            <Modal.Content scrolling={false}>
                <div style={{ height: '500px', width: '100%', borderRadius: '8px', overflow: 'hidden', position: 'relative' }}>
                    <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
                    {loadingAll && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.5)', zIndex: 1000,
                            display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white'
                        }}>
                            <Loader active inline inverted>Loading History...</Loader>
                        </div>
                    )}
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button
                    primary
                    onClick={() => setShowAll(!showAll)}
                    disabled={loadingAll}
                >
                    <Icon name={showAll ? 'map marker alternate' : 'world'} />
                    {showAll ? 'Focus Selected' : 'Show All Locations'}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};

export default LocationsMapModal;
