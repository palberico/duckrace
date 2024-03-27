import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ScreenSizeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.innerWidth > 768) {
      // Redirect to TempHome for screens larger than 649px
      navigate('/large-screen');
    } else {
      // Redirect to Home for smaller screens
      navigate('/Home');
    }
  }, [navigate]);

  return null; // This component does not render any UI elements
};

export default ScreenSizeRedirect;
