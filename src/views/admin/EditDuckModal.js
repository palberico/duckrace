import React, { useState, useEffect, useCallback } from 'react';
import { Button, Icon, Form, Message, Dropdown, TextArea } from 'semantic-ui-react';
import { useDropzone } from 'react-dropzone';
import { doc, updateDoc, GeoPoint } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../firebase/Config';
import axios from 'axios';
import countryOptions from '../../components/data/Countries';
import stateOptions from '../../components/data/States';

const EditDuckModal = ({ isOpen, onClose, duck, onUpdate }) => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [bio, setBio] = useState('');
    const [hometown, setHometown] = useState('');
    const [startLocation, setStartLocation] = useState({ city: '', state: '', country: '' });
    const [distance, setDistance] = useState(''); // Allow editing starting distance if needed
    const [image, setImage] = useState(null); // New image file
    const [currentImageUrl, setCurrentImageUrl] = useState(''); // Existing image URL

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (duck) {
            setName(duck.name || '');
            setCode(duck.code || '');
            setBio(duck.bio || '');
            setHometown(duck.hometown || '');
            setDistance(duck.distance || 0);
            setCurrentImageUrl(duck.imageUrl || '');

            // Handle Start Location which might be an object
            if (duck.startLocation) {
                setStartLocation({
                    city: duck.startLocation.city || '',
                    state: duck.startLocation.state || '',
                    country: duck.startLocation.country || ''
                });
            }
        }
    }, [duck]);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setImage(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const getCoordinates = async (address) => {
        try {
            const fullAddress = `${address.city}, ${address.state}, ${address.country}`;
            const encodedAddress = encodeURIComponent(fullAddress);
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);

            if (response.data.status === 'OK' && response.data.results.length > 0) {
                const { lat, lng } = response.data.results[0].geometry.location;
                return new GeoPoint(lat, lng);
            }
            return null;
        } catch (error) {
            console.error('Geocoding error:', error);
            return null;
        }
    };

    const handleUpdate = async () => {
        setLoading(true);
        setError('');

        try {
            const duckRef = doc(db, 'ducks', duck.id);
            const updateData = {
                name,
                code,
                bio,
                hometown,
                distance: parseFloat(distance) || 0
            };

            // 1. Handle Image Upload if changed
            if (image) {
                const storage = getStorage();
                const storageRef = ref(storage, `ducks/${image.name}-${Date.now()}`);
                const uploadTaskSnapshot = await uploadBytes(storageRef, image);
                const newImageUrl = await getDownloadURL(uploadTaskSnapshot.ref);
                updateData.imageUrl = newImageUrl;
            }

            // 2. Handle Location Update
            // Check if location fields changed from original. 
            // Simple check: we just re-geocode if any field has text. 
            // Optimally, we compare with old values, but for now let's just re-save.
            // Wait, we need to preserve coordinates if they didn't change...
            // But if user edits "City", we MUST re-geocode.
            // Let's safe-check: always geocode startLocation on edit to be safe? 
            // Or only if it differs from `duck.startLocation`.

            const oldLoc = duck.startLocation || {};
            const locChanged = startLocation.city !== oldLoc.city ||
                startLocation.state !== oldLoc.state ||
                startLocation.country !== oldLoc.country;

            if (locChanged) {
                const coordinates = await getCoordinates(startLocation);
                if (!coordinates) {
                    throw new Error("Failed to geocode the new start address.");
                }
                updateData.startLocation = {
                    ...startLocation,
                    coordinates
                };
            }


            // 3. Update Doc
            await updateDoc(duckRef, updateData);

            onUpdate(updateData); // Callback to refresh parent with new data
            onClose();

        } catch (err) {
            console.error("Update failed:", err);
            setError(err.message || "Failed to update duck.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="glass-card" style={{ maxWidth: '600px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <h2 style={{ color: 'white', margin: 0 }}>Edit Duck</h2>
                    <Button icon="close" basic inverted onClick={onClose} />
                </div>

                <Form className="custom-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <Form.Field>
                            <label>Duck Name</label>
                            <input className="custom-input" value={name} onChange={(e) => setName(e.target.value)} />
                        </Form.Field>
                        <Form.Field>
                            <label>Code</label>
                            <input className="custom-input" value={code} onChange={(e) => setCode(e.target.value)} />
                        </Form.Field>
                    </div>

                    <Form.Field>
                        <label>Hometown</label>
                        <input className="custom-input" value={hometown} onChange={(e) => setHometown(e.target.value)} />
                    </Form.Field>

                    <Form.Field>
                        <label>Bio (Max 100 words)</label>
                        <TextArea className="custom-input" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
                    </Form.Field>

                    <label style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px', display: 'block', marginTop: '1rem' }}>Start Location</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <input className="custom-input" placeholder='City' value={startLocation.city} onChange={(e) => setStartLocation({ ...startLocation, city: e.target.value })} />
                        <Dropdown
                            placeholder="State"
                            fluid search selection
                            className='custom-input-dropdown'
                            options={stateOptions}
                            value={startLocation.state}
                            onChange={(e, { value }) => setStartLocation({ ...startLocation, state: value })}
                        />
                        <Dropdown
                            placeholder="Country"
                            fluid search selection
                            className='custom-input-dropdown'
                            options={countryOptions}
                            value={startLocation.country}
                            onChange={(e, { value }) => setStartLocation({ ...startLocation, country: value })}
                        />
                    </div>

                    <div style={{ marginTop: '1.5rem' }}>
                        <label style={{ color: 'white', marginBottom: '0.5rem', display: 'block' }}>Duck Image</label>

                        {/* Current Image Preview */}
                        {!image && currentImageUrl && (
                            <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
                                <img src={currentImageUrl} alt="Current" style={{ maxHeight: '100px', borderRadius: '8px', border: '1px solid var(--neon-blue)' }} />
                            </div>
                        )}

                        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={{
                            border: '2px dashed rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: isDragActive ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0,0,0,0.2)',
                            transition: 'all 0.2s',
                            color: isDragActive ? 'var(--neon-blue)' : '#aaa',
                            borderColor: isDragActive ? 'var(--neon-blue)' : 'rgba(255,255,255,0.2)'
                        }}>
                            <input {...getInputProps()} />
                            {image ? (
                                <div style={{ color: 'var(--neon-blue)', fontWeight: 'bold' }}>
                                    <Icon name='check circle' /> New Image: {image.name}
                                </div>
                            ) : (
                                <p>Drag & drop new image to replace, or click to select</p>
                            )}
                        </div>
                    </div>

                    {error && <Message error content={error} style={{ marginTop: '1rem' }} />}

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                        <Button
                            className="custom-btn"
                            style={{ flex: 1, background: 'var(--neon-blue)', color: 'black' }}
                            onClick={handleUpdate}
                            loading={loading}
                            disabled={loading}
                        >
                            Save Changes
                        </Button>
                        <Button
                            type="button"
                            className="custom-btn"
                            style={{ flex: 1, background: 'rgba(255,255,255,0.1)', color: 'white' }}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>
            </div>
        </div>
    );
};

export default EditDuckModal;
