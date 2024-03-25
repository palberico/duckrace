// Header.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Image, Input, Button, Message, Popup } from 'semantic-ui-react';
import logo from '../assets/images/Logo.png';

const Header = ({ code, setCode, error, setError, loading, handleSearch }) => {
  const handleChange = (e) => {
    setCode(e.target.value);
    setError(false); // Reset error state on input change
  };

  const isButtonDisabled = loading || code.length !== 6;

  return (
    <div className="header">
      <div className="headerLogo">
        <Link to="/">
          <Image src={logo} size='small' />
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
                <div style={{ display: 'inline-block' }}>
                  <Button
                    icon='search'
                    onClick={handleSearch}
                    disabled={isButtonDisabled}
                  />
                </div>
              }
            />
          }
          placeholder='Found a Duck? Enter Code Here...'
          fluid
          value={code}
          onChange={handleChange}
          error={error}
          loading={loading}
        />
        {error && <Message negative>Code Not Found</Message>}
      </div>
    </div>
  );
};

export default Header;
