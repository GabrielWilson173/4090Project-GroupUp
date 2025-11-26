import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Clubs from "./pages/Clubs";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Organizer from "./pages/Organizer";


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!sessionStorage.getItem('token');
  });

  useEffect(() => {
    // Clear session only on initial mount (page load from server restart)
    // This checks if the page was loaded fresh vs refreshed
    const navigationEntries = performance.getEntriesByType('navigation');
    if (navigationEntries.length > 0 && navigationEntries[0].type === 'navigate') {
      // Only clear if it's a fresh navigation (not a reload)
      if (!sessionStorage.getItem('pageReloaded')) {
        sessionStorage.clear();
        setIsLoggedIn(false);
      }
    }
    // Set flag that page has been loaded
    sessionStorage.setItem('pageReloaded', 'true');
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
  };

  return (
    <Router>
      {/* Only show nav if logged in */}
      {isLoggedIn && (
        <nav style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          padding: '10px', 
          background: '#eee' 
        }}>
          <div>
            <Link to="/dashboard">Dashboard</Link> |{" "}
            <Link to="/clubs">Browse Clubs</Link> |{" "}
            <Link to="/organizer">Club Organizer</Link>
          </div>
          <div>
            <Link to="/profile">Profile</Link>
          </div>
        </nav>
      )}

      <Routes>
        {/* Public routes - redirect to dashboard if logged in */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/login" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Login setIsLoggedIn={setIsLoggedIn} />} />

        {/* Protected routes - redirect to home if not logged in */}
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/clubs" element={isLoggedIn ? <Clubs /> : <Navigate to="/" />} />
        <Route path="/organizer" element={isLoggedIn ? <Organizer /> : <Navigate to="/" />} />
        <Route path="/profile" element={isLoggedIn ? <Profile handleLogout={handleLogout} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;