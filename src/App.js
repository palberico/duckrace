// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes,} from 'react-router-dom';
import TempHome from './views/TempHome'; 
import Home from './views/Home'; 
import DuckProfile from './components/DuckProfile'; 
import DuckForm from './components/DuckForm';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<TempHome />} />
          <Route path="/Home" element={<Home />} /> 
          <Route path="/duck/:duckId" element={<DuckProfile />} /> 
          <Route path="/log-distance/:duckId" element={<DuckForm />} /> 
        </Routes>
      </div>
    </Router>
  );
}

export default App;
