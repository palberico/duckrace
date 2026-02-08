import React, { useCallback } from 'react';
import { Message, Loader, Icon, Dropdown } from 'semantic-ui-react';
import { useDropzone } from 'react-dropzone';
import countryOptions from '../../components/data/Countries';
import stateOptions from '../../components/data/States';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/Config';
import { generateDuckName } from '../../components/data/DuckNames';

const RegisterForm = ({
    handleSubmit,
    isLoading,
    error,
    name, setName,
    code, setCode,
    distance, setDistance,
    hometown, setHometown,
    bio, setBio,
    startLocation, setStartLocation,
    setImage,
    image
}) => {
    const [generatingCode, setGeneratingCode] = React.useState(false);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles && acceptedFiles.length > 0) {
            setImage(acceptedFiles[0]);
        }
    }, [setImage]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1
    });

    const generateUniqueCode = async () => {
        setGeneratingCode(true);
        let unique = false;
        let newCode = '';

        while (!unique) {
            // Generate 6 digit number
            newCode = Math.floor(100000 + Math.random() * 900000).toString();

            // Check if exists
            const ducksRef = collection(db, 'ducks');
            const q = query(ducksRef, where('code', '==', newCode));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                unique = true;
            }
        }

        setCode(newCode);
        setGeneratingCode(false);
    };

    return (
        <div className="register-form-container">
            <div className="glass-header">
                <h2>Register New Duck</h2>
            </div>

            {isLoading && <Loader active inline='centered'>Box...Box...</Loader>}

            <form className="custom-form register-form" onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label>Duck Name</label>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <input
                                className="custom-input no-bottom-margin"
                                placeholder='Enter Duck Name'
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                style={{ paddingRight: '50px' }}
                            />
                            <button
                                type="button"
                                className="generate-code-btn"
                                onClick={() => setName(generateDuckName())}
                                title="Generate Random Name"
                            >
                                <Icon name='random' />
                            </button>
                        </div>
                    </div>
                    <div>
                        <label>Code</label>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <input
                                className="custom-input no-bottom-margin"
                                placeholder='Enter Duck Code'
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                style={{ paddingRight: '50px' }}
                            />
                            <button
                                type="button"
                                className="generate-code-btn"
                                onClick={generateUniqueCode}
                                disabled={generatingCode}
                                title="Generate Random Code"
                            >
                                {generatingCode ? (
                                    <Icon loading name='spinner' />
                                ) : (
                                    <Icon name='random' />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                        <label>Distance (Miles)</label>
                        <input className="custom-input" type='number' placeholder='0' value={distance} onChange={(e) => setDistance(e.target.value)} />
                    </div>
                    <div>
                        <label>Hometown</label>
                        <input className="custom-input" placeholder='City, Country' value={hometown} onChange={(e) => setHometown(e.target.value)} />
                    </div>
                </div>

                <div>
                    <label>Bio (Max 100 words)</label>
                    <textarea className="custom-input" rows="3" placeholder='Tell us about this duck...' value={bio} onChange={(e) => setBio(e.target.value)} />
                </div>

                <label style={{ color: '#fff', borderBottom: '1px solid #333', paddingBottom: '5px', marginBottom: '15px' }}>Start Location</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    <input className="custom-input" placeholder='City' value={startLocation.city} onChange={(e) => setStartLocation({ ...startLocation, city: e.target.value })} />

                    <Dropdown
                        placeholder="State"
                        fluid
                        search
                        selection
                        className='custom-input-dropdown'
                        options={stateOptions}
                        value={startLocation.state}
                        onChange={(e, { value }) => setStartLocation({ ...startLocation, state: value })}
                        selectOnBlur={false}
                        onFocus={(e) => e.target.blur()}
                        upward={false}
                        closeOnChange
                    />

                    <Dropdown
                        placeholder="Country"
                        fluid
                        search
                        selection
                        className='custom-input-dropdown'
                        options={countryOptions}
                        value={startLocation.country}
                        onChange={(e, { value }) => setStartLocation({ ...startLocation, country: value })}
                        selectOnBlur={false}
                        onFocus={(e) => e.target.blur()}
                        upward={false}
                        closeOnChange
                    />
                </div>

                <div>
                    <label>Duck Image</label>
                    {image ? (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{
                                position: 'relative',
                                width: '150px',
                                height: '150px',
                                margin: '0 auto 1rem',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                border: '2px solid var(--neon-blue)',
                                boxShadow: '0 0 20px rgba(0, 240, 255, 0.3)'
                            }}>
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt="Preview"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </div>
                            <div style={{ textAlign: 'center', color: 'var(--neon-blue)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                                <Icon name='check circle' /> {image.name}
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => setImage(null)}
                                    style={{
                                        background: 'rgba(255, 59, 59, 0.1)',
                                        border: '1px solid var(--neon-red)',
                                        color: 'var(--neon-red)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        fontSize: '14px'
                                    }}
                                >
                                    <Icon name='trash' /> Remove Image
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`} style={{
                            border: '2px dashed rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '2rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: isDragActive ? 'rgba(0, 240, 255, 0.1)' : 'rgba(0,0,0,0.2)',
                            transition: 'all 0.2s',
                            marginBottom: '1.5rem',
                            color: isDragActive ? 'var(--neon-blue)' : '#aaa',
                            borderColor: isDragActive ? 'var(--neon-blue)' : 'rgba(255,255,255,0.2)'
                        }}>
                            <input {...getInputProps()} />
                            {isDragActive ? (
                                <p>Drop the file here ...</p>
                            ) : (
                                <p><Icon name='cloud upload' size='large' style={{ marginBottom: '0.5rem' }} /><br />Drag & drop an image here, or click to select one</p>
                            )}
                        </div>
                    )}
                </div>

                {error && <Message error header='Error' content={error} />}

                <button type='submit' className="custom-btn">Register Duck</button>
            </form>
        </div>
    );
};

export default RegisterForm;
