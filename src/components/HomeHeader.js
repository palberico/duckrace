import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Button, Popup, Icon, Dropdown } from 'semantic-ui-react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import AdminModal from './AdminModal';
import '../App.css';

const Header = ({ code, setCode, error, setError, loading, handleSearch }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();

  const handleChange = (e) => {
    setCode(e.target.value);
    setError(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsModalOpen(false);
      navigate('/Admin');
    } catch (error) {
      setAuthError('Failed to log in. Please check your credentials.');
      console.error('Login error:', error);
    }
  };

  const isButtonDisabled = loading || code.length !== 6;

  return (
    <div className="header">
      <div className="headerLogo">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <span className="logo-text">Race<span className="logo-highlight">Ducks</span></span>
        </Link>
      </div>

      <div className="headerSearch">
        <Input
          icon={
            <Popup
              content="Please enter the 6-digit code found on your duck."
              on={['hover', 'focus']}
              disabled={!isButtonDisabled}
              trigger={
                <Button
                  icon='search'
                  onClick={handleSearch}
                  disabled={isButtonDisabled}
                  className="search-btn"
                />
              }
            />
          }
          placeholder='Enter Duck Code...'
          fluid
          value={code}
          onChange={handleChange}
          error={error}
          loading={loading}
          actionPosition='right'
          className="search-input"
          autoFocus={false}
        />
      </div>

      <div className="headerAdmin">
        <Dropdown
          icon={null}
          trigger={
            <Icon name='bars' size='large' style={{ cursor: 'pointer', color: 'white' }} />
          }
          pointing='top right'
          direction='left'
        >
          <Dropdown.Menu>
            <Dropdown.Item icon='user' text='Admin Login' onClick={() => setIsModalOpen(true)} />
            <Dropdown.Item icon='game' text='Secret Game' as={Link} to="/secret-game" />
          </Dropdown.Menu>
        </Dropdown>

        <AdminModal
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          onSubmit={handleLogin}
          authError={authError}
        />
      </div>
    </div>
  );
};

export default Header;
