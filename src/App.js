import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MapScreen from './components/MapScreen';
import Home from './views/Home';
import DuckProfile from './views/DuckProfile';
import DuckForm from './views/DuckForm';
import Admin from './views/DuckAdmin';
import NotFoundPage from './views/NotFoundPage';
import 'semantic-ui-css/semantic.min.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/Admin" element={<Admin />} />

          <Route path="/log-distance/:duckId" element={<DuckForm />} />
          <Route path="/duck/:duckId" element={<DuckProfile />} />
          <Route path="/map/:locationId" element={<MapScreen />} />

          <Route
            path="/secret-game"
            element={
              <NotFoundPage
                header="You Found the Secret Duck Race!"
                message="Congratulations! You've discovered the hidden game. Good luck!"
              />
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
