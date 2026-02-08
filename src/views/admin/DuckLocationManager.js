import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/Config';
import { Loader, Button, Icon, Confirm } from 'semantic-ui-react';
import { getDistanceFromLatLonInKm } from '../../components/data/geoUtils';

import EditDuckModal from './EditDuckModal';

const DuckLocationManager = ({ duck, onBack, onDuckUpdate }) => {
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [locationToDelete, setLocationToDelete] = useState(null);
    const [recalculating, setRecalculating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchLocations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duck.id]);

    const fetchLocations = async () => {
        setLoading(true);
        try {
            const locRef = collection(db, 'locations');
            const q = query(
                locRef,
                where('duckId', '==', duck.id),
                orderBy('timestamp', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const locList = [];
            querySnapshot.forEach((doc) => {
                locList.push({ id: doc.id, ...doc.data() });
            });
            setLocations(locList);
        } catch (error) {
            console.error("Error fetching locations:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (location) => {
        setLocationToDelete(location);
        setDeleteConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!locationToDelete) return;
        setDeleteConfirmOpen(false);
        setRecalculating(true);

        try {
            // 1. Delete associated comments first
            const commentsQuery = query(
                collection(db, 'comments'),
                where('locationId', '==', locationToDelete.id)
            );
            const commentsSnapshot = await getDocs(commentsQuery);
            const deleteCommentPromises = commentsSnapshot.docs.map(commentDoc =>
                deleteDoc(doc(db, 'comments', commentDoc.id))
            );
            await Promise.all(deleteCommentPromises);

            // 2. Delete the location document
            await deleteDoc(doc(db, 'locations', locationToDelete.id));

            // 2. Fetch remaining locations (newest first)
            // We need to fetch fresh because we just deleted one
            const locRef = collection(db, 'locations');
            const q = query(
                locRef,
                where('duckId', '==', duck.id),
                orderBy('timestamp', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const remainingLocations = [];
            querySnapshot.forEach((doc) => {
                remainingLocations.push({ id: doc.id, ...doc.data() });
            }); // Newest is at index 0

            // 3. Recalculate Total Distance
            // We need to sort by timestamp ASCENDING to replay the path
            const locationsAsc = [...remainingLocations].sort((a, b) => a.timestamp.seconds - b.timestamp.seconds);

            let totalDist = 0;
            // First leg is from Start Location -> First Logged Location
            // The location docs store { startLocation, newLocation } for that specific leg.
            // So we can just sum up the distance of each leg doc!
            // Wait, does the doc store distance? No. We must recalc.

            for (const loc of locationsAsc) {
                const distToAdd = getDistanceFromLatLonInKm(
                    loc.startLocation.coordinates.latitude,
                    loc.startLocation.coordinates.longitude,
                    loc.newLocation.coordinates.latitude,
                    loc.newLocation.coordinates.longitude
                );
                totalDist += Math.round(distToAdd * 0.621371);
            }

            // 4. Update Duck Document
            const duckRef = doc(db, 'ducks', duck.id);

            // Determine new lastLocation
            let newLastLocation = duck.startLocation; // Fallback to start

            if (remainingLocations.length > 0) {
                // The newest location (index 0 in descending list) is the current last location
                const newestLoc = remainingLocations[0];
                newLastLocation = {
                    city: newestLoc.newLocation.city,
                    state: newestLoc.newLocation.state,
                    country: newestLoc.newLocation.country,
                    coordinates: newestLoc.newLocation.coordinates
                };
            } else {
                // If all locations deleted, distance is 0 and last location is start location
                // Just ensure startLocation format matches what we need
                // (Duck startLocation usually has city/state/country/coordinates)
            }

            const updateData = {
                distance: totalDist,
                lastLocation: newLastLocation
            };

            await updateDoc(duckRef, updateData);

            // 5. Refresh UI
            setLocations(remainingLocations);
            // Also notify parent to update the duck distance in the header/list
            if (onDuckUpdate) {
                onDuckUpdate({ distance: totalDist, lastLocation: newLastLocation });
            }

        } catch (error) {
            console.error("Error deleting location:", error);
            alert("Failed to delete location and recalculate.");
        } finally {
            setRecalculating(false);
            setLocationToDelete(null);
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <div className="glass-header">
                <h2>
                    <Icon name='arrow left' onClick={onBack} style={{ cursor: 'pointer', marginRight: '0.5rem' }} />
                    Editing: {duck.name}
                </h2>
            </div>

            {loading || recalculating ? (
                <Loader active inline='centered'>{recalculating ? 'Recalculating Route...' : 'Loading Locations...'}</Loader>
            ) : (
                <>
                    <div style={{ marginBottom: '2rem', background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <img
                                src={duck.imageUrl}
                                alt={duck.name}
                                style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--neon-blue)' }}
                            />
                            <div>
                                <h3 style={{ margin: 0, color: 'white' }}>{duck.name}</h3>
                                <p style={{ margin: 0, color: '#aaa' }}>{duck.hometown}</p>
                            </div>
                        </div>
                        <p style={{ color: '#aaa', margin: 0 }}>Current Total Distance (Database): <span style={{ color: 'var(--neon-yellow)', fontWeight: 'bold' }}>{duck.distance} miles</span></p>
                    </div>

                    <Button
                        icon labelPosition='left'
                        basic inverted
                        color="blue"
                        onClick={() => setIsEditModalOpen(true)}
                        fluid
                        style={{ marginBottom: '2rem' }}
                    >
                        <Icon name='pencil' />
                        Edit Duck
                    </Button>

                    {locations.length === 0 ? (
                        <p style={{ color: '#888', textAlign: 'center' }}>No locations traveled yet.</p>
                    ) : (
                        <div className="custom-table-container">
                            <table className="custom-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>From</th>
                                        <th>To</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {locations.map(loc => (
                                        <tr key={loc.id}>
                                            <td>{new Date(loc.timestamp.seconds * 1000).toLocaleDateString()}</td>
                                            <td>{loc.startLocation.city}, {loc.startLocation.state || loc.startLocation.country}</td>
                                            <td>{loc.newLocation.city}, {loc.newLocation.state || loc.newLocation.country}</td>
                                            <td>
                                                <Button
                                                    icon="trash"
                                                    size="small"
                                                    basic
                                                    color="red"
                                                    onClick={() => handleDeleteClick(loc)}
                                                    title="Delete this leg"
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            <Confirm
                open={deleteConfirmOpen}
                onCancel={() => setDeleteConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                content="Are you sure you want to delete this location? This will permanently remove the record and recalculate the duck's total distance."
                confirmButton="Usage Delete"
                cancelButton="Cancel"
                className="glass-card" // You might need custom styles for semantic modals if they don't inherit
            />

            <EditDuckModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                duck={duck}
                onUpdate={(updatedData) => {
                    if (onDuckUpdate) {
                        onDuckUpdate(updatedData);
                    }
                }}
            />
        </div>
    );
};

export default DuckLocationManager;
