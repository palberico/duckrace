import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/Config';
import { Loader, Input, Icon } from 'semantic-ui-react';
import DuckLocationManager from './DuckLocationManager';

const DuckManager = () => {
    const [ducks, setDucks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDuck, setSelectedDuck] = useState(null);

    useEffect(() => {
        fetchDucks();
    }, []);

    const fetchDucks = async () => {
        setLoading(true);
        try {
            const ducksRef = collection(db, 'ducks');
            const q = query(ducksRef, orderBy('name'));
            const querySnapshot = await getDocs(q);
            const duckList = [];
            querySnapshot.forEach((doc) => {
                duckList.push({ id: doc.id, ...doc.data() });
            });
            setDucks(duckList);
        } catch (error) {
            console.error("Error fetching ducks:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDucks = ducks.filter(duck =>
        duck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        duck.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedDuck) {
        return (
            <DuckLocationManager
                duck={selectedDuck}
                onBack={() => {
                    setSelectedDuck(null);
                    fetchDucks(); // Refresh data when returning
                }}
                onDuckUpdate={(updatedDuck) => {
                    // Update the local selected duck state so the UI reflects changes immediately
                    setSelectedDuck(prev => ({ ...prev, ...updatedDuck }));
                    fetchDucks(); // Refresh the main list in background
                }}
            />
        );
    }

    return (
        <div style={{ padding: '2rem' }}>
            <h2 style={{ color: 'white', marginBottom: '2rem' }}>Manage Duck Locations</h2>

            <Input
                icon='search'
                placeholder='Search by Name or Code...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fluid
                className="search-input"
                style={{ marginBottom: '2rem' }}
            />

            {loading ? (
                <Loader active inline='centered'>Loading Ducks...</Loader>
            ) : (
                <div className="stats-grid" style={{ marginTop: '0' }}>
                    {filteredDucks.map(duck => (
                        <div
                            key={duck.id}
                            className="stat-card"
                            onClick={() => setSelectedDuck(duck)}
                            style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                <div className="stat-icon" style={{
                                    backgroundImage: `url(${duck.imageUrl})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    padding: 0,
                                    width: '60px !important',
                                    height: '60px !important',
                                    borderRadius: '50%',
                                    border: '2px solid var(--neon-blue)'
                                }} />
                                <div style={{ marginLeft: '1rem' }}>
                                    <h3 style={{ color: 'white', marginBottom: '0.2rem' }}>{duck.name}</h3>
                                    <span style={{ color: '#888', fontSize: '0.9rem' }}>Code: {duck.code}</span>
                                </div>
                            </div>
                            <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: '#aaa' }}>Total Distance:</span>
                                <span style={{ color: 'var(--neon-yellow)', fontWeight: 'bold' }}>{duck.distance} miles</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DuckManager;
