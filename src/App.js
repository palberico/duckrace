import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ScreenSizeRedirect from './components/ScreenSizeRedirect'; 
import TempHome from './views/TempHome';
import Home from './views/Home';
import DuckProfile from './views/DuckProfile';
import DuckForm from './views/DuckForm';
import Admin from './views/DuckAdmin';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ScreenSizeRedirect />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/large-screen" element={<TempHome />} />
          <Route path="/Admin" element={<Admin />} />
          <Route path="/duck/:duckId" element={<DuckProfile />} />
          <Route path="/log-distance/:duckId" element={<DuckForm />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
