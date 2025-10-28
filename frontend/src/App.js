import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clubs from "./pages/Clubs";


function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', background: '#eee' }}>
        <Link to="/register" style={{ marginRight: '10px' }}>Register</Link>
        <Link to="/login">Login</Link>
        <Link to="/">Home</Link> |{" "}
        <Link to="/clubs">Clubs</Link>
      </nav>

      <Routes>
        <Route path="/" element={<h2>Welcome to GroupUp!</h2>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/clubs" element={<Clubs />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
