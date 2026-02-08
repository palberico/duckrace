import React, { useState, useEffect } from 'react';
import {
  Icon
} from 'semantic-ui-react';
import {
  addDoc,
  collection,
  GeoPoint,
  query,
  where,
  getDocs,
  writeBatch,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { db } from '../firebase/Config';
import countryOptions from '../components/data/Countries';
import stateOptions from '../components/data/States';

// Import New Sub-Components
import DashboardStats from './admin/DashboardStats';
import RegisterForm from './admin/RegisterForm';
import ApprovalsTable from './admin/ApprovalsTable';
import DangerZone from './admin/DangerZone';
import DuckManager from './admin/DuckManager';
import InactiveDucks from './admin/InactiveDucks';

const DuckAdmin = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [bio, setBio] = useState('');
  const [hometown, setHometown] = useState('');
  const [startLocation, setStartLocation] = useState({ city: '', state: '', country: '' });
  const [distance, setDistance] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [unapprovedPhotos, setUnapprovedPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [totalDucks, setTotalDucks] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [mostActiveDuck, setMostActiveDuck] = useState(null);
  const [inactiveDucks, setInactiveDucks] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState('');


  useEffect(() => {
    fetchUnapprovedPhotos();
    fetchStats();
    fetchInactiveDucks();
    // Force body background to be dark
    document.body.style.backgroundColor = '#121212';
    return () => {
      document.body.style.backgroundColor = ''; // Cleanup
    };
  }, []);

  const fetchStats = async () => {
    const ducksSnapshot = await getDocs(collection(db, 'ducks'));
    setTotalDucks(ducksSnapshot.size);

    // Calculate total distance
    let totalDist = 0;
    ducksSnapshot.docs.forEach(doc => {
      totalDist += doc.data().distance || 0;
    });
    setTotalDistance(totalDist);

    // Find most active duck (duck with most locations)
    let maxLocations = 0;
    let activeDuck = null;

    for (const duckDoc of ducksSnapshot.docs) {
      const locationsQuery = query(
        collection(db, 'locations'),
        where('duckId', '==', duckDoc.id)
      );
      const locationsSnapshot = await getDocs(locationsQuery);
      const locationCount = locationsSnapshot.size;

      if (locationCount > maxLocations) {
        maxLocations = locationCount;
        activeDuck = {
          id: duckDoc.id,
          name: duckDoc.data().name,
          locationCount: locationCount
        };
      }
    }

    setMostActiveDuck(activeDuck);
  };

  const fetchUnapprovedPhotos = async () => {
    setPhotosLoading(true);
    const photosRef = collection(db, 'photos');
    const q = query(photosRef, where('approved', '==', false));
    const querySnapshot = await getDocs(q);
    const photos = [];
    querySnapshot.forEach((doc) => {
      photos.push({ id: doc.id, ...doc.data() });
    });
    setUnapprovedPhotos(photos);
    setPhotosLoading(false);
  };

  const fetchInactiveDucks = async () => {
    try {
      const ducksSnapshot = await getDocs(collection(db, 'ducks'));
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const inactive = [];

      for (const duckDoc of ducksSnapshot.docs) {
        const locationsQuery = query(
          collection(db, 'locations'),
          where('duckId', '==', duckDoc.id),
          orderBy('createdAt', 'desc')
        );
        const locationsSnapshot = await getDocs(locationsQuery);

        if (locationsSnapshot.empty) {
          // No locations at all - inactive
          inactive.push({
            id: duckDoc.id,
            name: duckDoc.data().name,
            lastUpdate: null,
            daysInactive: 'Never'
          });
        } else {
          const lastLocation = locationsSnapshot.docs[0];
          const lastUpdate = lastLocation.data().createdAt?.toDate();

          if (lastUpdate && lastUpdate < sixMonthsAgo) {
            const daysInactive = Math.floor((new Date() - lastUpdate) / (1000 * 60 * 60 * 24));
            inactive.push({
              id: duckDoc.id,
              name: duckDoc.data().name,
              lastUpdate: lastUpdate,
              daysInactive: daysInactive
            });
          }
        }
      }

      setInactiveDucks(inactive);
    } catch (error) {
      console.error('Error fetching inactive ducks:', error);
    }
  };

  const handleApprovePhoto = async (photoId) => {
    const photoRef = doc(db, 'photos', photoId);
    await updateDoc(photoRef, { approved: true });
    fetchUnapprovedPhotos(); // Refresh the list
  };

  const handleDeletePhoto = async (photoId, photoURL) => {
    const photoRef = doc(db, 'photos', photoId);
    await deleteDoc(photoRef);

    // Delete the file from storage
    const storage = getStorage();
    const fileRef = ref(storage, photoURL);
    await deleteObject(fileRef);

    fetchUnapprovedPhotos(); // Refresh the list
  };

  const handleDeleteInputChange = (e) => {
    setDeleteInput(e.target.value);
  };

  const getCoordinates = async (address) => {
    setIsLoading(true); // Start loading
    try {
      const fullAddress = `${address.city}, ${address.state}, ${address.country}`;
      const encodedAddress = encodeURIComponent(fullAddress);

      const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}`);

      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const { lat, lng } = response.data.results[0].geometry.location;
        setIsLoading(false); // Stop loading
        return new GeoPoint(lat, lng);
      } else {
        throw new Error(response.data.error_message || 'Failed to geocode address');
      }
    } catch (error) {
      setError(`Geocoding failed: ${error.message}`);
      console.error('Error getting coordinates:', error);
      setIsLoading(false); // Stop loading
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError('');

    // Optional: Validate the bio word count
    if (!validateBioWordCount(bio)) {
      setError('Bio must be 100 words or less.');
      setIsLoading(false); // Stop loading
      return;
    }

    // Continue with image upload if an image is selected
    if (image) {
      const storage = getStorage();
      const storageRef = ref(storage, `ducks/${image.name}-${Date.now()}`); // Unique path for each image

      try {
        const uploadTaskSnapshot = await uploadBytes(storageRef, image);
        const imageUrl = await getDownloadURL(uploadTaskSnapshot.ref);

        // Proceed with the rest of the form submission once you have the image URL
        const coordinates = await getCoordinates(startLocation);

        if (!coordinates) {
          setError('Failed to get coordinates for the location.');
          setIsLoading(false); // Stop loading
          return;
        }

        // Add the bio and hometown fields to the document being added to Firestore
        const docRef = await addDoc(collection(db, 'ducks'), {
          name,
          code,
          bio,
          hometown,
          imageUrl,
          startLocation: {
            ...startLocation,
            coordinates,
          },
          distance: parseFloat(distance) || 0,
        });

        console.log('Document written with ID: ', docRef.id);
        fetchStats(); // Update stats
        setSuccessMessage(`🎉 Duck "${name}" successfully registered!`);
        setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
        // Reset form fields after successful submission
      } catch (error) {
        console.error('Error during the image upload or document creation:', error);
        setError(`Error during the image upload or document creation: ${error.message}`);
      } finally {
        setIsLoading(false); // Stop loading
      }
    } else {
      setError('No image selected for upload.');
      setIsLoading(false); // Stop loading
    }

    // Reset form states and bio after processing
    setName('');
    setCode('');
    setBio('');
    setHometown('');
    setImage(null);
    setDistance(''); // Reset the distance field
    setStartLocation({ city: '', state: '', country: '' });
  };

  const deleteDuckAndLocations = async (duckId) => {
    const batch = writeBatch(db);

    // Delete related locations
    const locationsQuery = query(collection(db, 'locations'), where('duckId', '==', duckId));
    const locationsSnapshot = await getDocs(locationsQuery);
    locationsSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the duck
    const duckRef = doc(db, 'ducks', duckId);
    batch.delete(duckRef);

    // Commit the batch
    await batch.commit();
    console.log(`Deleted duck and ${locationsSnapshot.size} location(s).`);
  };


  //Delete Logic below:

  const handleDeleteDuck = async () => {
    if (!deleteInput.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const ducksRef = collection(db, 'ducks');
      const nameQuery = query(ducksRef, where("name", "==", deleteInput.trim()));
      const codeQuery = query(ducksRef, where("code", "==", deleteInput.trim()));

      const [nameSnapshot, codeSnapshot] = await Promise.all([
        getDocs(nameQuery),
        getDocs(codeQuery)
      ]);

      const docsToDelete = [...nameSnapshot.docs, ...codeSnapshot.docs];

      for (const docToDelete of docsToDelete) {
        await deleteDuckAndLocations(docToDelete.id);
      }

      console.log(`${docsToDelete.length} duck(s) and their locations deleted.`);
      fetchStats(); // Update stats

      // Show success message
      setDeleteSuccessMessage(`🦆 "${deleteInput}" is gone foreves!`);
      setTimeout(() => setDeleteSuccessMessage(''), 5000);
      setDeleteInput(''); // Clear the delete input field
    } catch (error) {
      console.error("Error deleting ducks and locations:", error);
      setError(`Error deleting ducks and locations: ${error.message}`);
    }

    setIsLoading(false);
  };
  const validateBioWordCount = (text) => {
    const words = text.trim().split(/\s+/); // Split based on one or more whitespace characters
    return words.length <= 100;
  };


  // TABS STATE
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when a tab is selected
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-layout">
      {/* Mobile Menu Toggle */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Icon name="bars" />
      </button>

      {/* Mobile Overlay */}
      <div
        className={`admin-sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* SIDEBAR */}
      <div className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="sidebar-title" style={{ margin: 0 }}>Duck Admin</h2>
          <button
            className="mobile-close-btn"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>

        <button
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabClick('dashboard')}
        >
          <Icon name='dashboard' /> Dashboard
        </button>
        <button
          className={`nav-item ${activeTab === 'register' ? 'active' : ''}`}
          onClick={() => handleTabClick('register')}
        >
          <Icon name='plus circle' /> Register Duck
        </button>
        <button
          className={`nav-item ${activeTab === 'manage_ducks' ? 'active' : ''}`}
          onClick={() => handleTabClick('manage_ducks')}
        >
          <Icon name='list' /> Manage Ducks
        </button>
        <button
          className={`nav-item ${activeTab === 'approvals' ? 'active' : ''}`}
          onClick={() => handleTabClick('approvals')}
        >
          <Icon name='camera' /> Approvals
          {unapprovedPhotos.length > 0 &&
            <span style={{
              marginLeft: 'auto',
              background: 'var(--neon-yellow)',
              color: 'black',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 'bold'
            }}>
              {unapprovedPhotos.length}
            </span>
          }
        </button>

        {/* Danger Zone */}
        <button
          className={`nav-item danger-tab ${activeTab === 'danger' ? 'active' : ''}`}
          onClick={() => handleTabClick('danger')}
        >
          <Icon name='warning sign' /> Danger Zone
        </button>

        {/* Mobile Logout / Close spacer if needed */}
        <div style={{ flexGrow: 1 }}></div>

        <Link to="/Home" style={{ textDecoration: 'none' }}>
          <button className="nav-item">
            <Icon name='arrow left' /> Back to Home
          </button>
        </Link>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="admin-content">

        {/* Success Toast Notification */}
        {successMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)',
            color: 'black',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 240, 255, 0.4)',
            zIndex: 9999,
            fontWeight: 'bold',
            fontSize: '1rem',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '400px'
          }}>
            {successMessage}
          </div>
        )}

        {/* Delete Success Toast Notification */}
        {deleteSuccessMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #ff3b3b 0%, #ff6b6b 100%)',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(255, 59, 59, 0.4)',
            zIndex: 9999,
            fontWeight: 'bold',
            fontSize: '1rem',
            animation: 'slideInRight 0.3s ease',
            maxWidth: '400px'
          }}>
            {deleteSuccessMessage}
          </div>
        )}

        {activeTab === 'dashboard' &&
          <DashboardStats
            totalDucks={totalDucks}
            totalDistance={totalDistance}
            mostActiveDuck={mostActiveDuck}
            inactiveDucks={inactiveDucks}
            unapprovedPhotos={unapprovedPhotos}
            onTotalDucksClick={() => setActiveTab('manage_ducks')}
            onRegisterClick={() => setActiveTab('register')}
            onApprovalsClick={() => setActiveTab('approvals')}
            onMostActiveDuckClick={(duckId) => window.location.href = `/duck/${duckId}`}
            onInactiveDucksClick={() => setActiveTab('inactive_ducks')}
          />
        }

        {activeTab === 'manage_ducks' &&
          <DuckManager />
        }

        {activeTab === 'register' &&
          <RegisterForm
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            name={name} setName={setName}
            code={code} setCode={setCode}
            distance={distance} setDistance={setDistance}
            hometown={hometown} setHometown={setHometown}
            bio={bio} setBio={setBio}
            startLocation={startLocation} setStartLocation={setStartLocation}
            image={image}
            setImage={setImage}
            countryOptions={countryOptions}
            stateOptions={stateOptions}
          />
        }

        {activeTab === 'approvals' &&
          <ApprovalsTable
            unapprovedPhotos={unapprovedPhotos}
            photosLoading={photosLoading}
            handleApprovePhoto={handleApprovePhoto}
            handleDeletePhoto={handleDeletePhoto}
          />
        }

        {activeTab === 'inactive_ducks' &&
          <InactiveDucks inactiveDucks={inactiveDucks} />
        }

        {activeTab === 'danger' &&
          <DangerZone
            handleDeleteDuck={handleDeleteDuck}
            deleteInput={deleteInput}
            handleDeleteInputChange={handleDeleteInputChange}
          />
        }

      </div>
    </div>
  );
};

export default DuckAdmin;
