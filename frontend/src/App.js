import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Clubs from "./pages/Clubs";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '10px', 
        background: '#eee' 
      }}>
        <div>
        <Link to="/">Home</Link> |{" "}
        <Link to="/clubs">Browse Clubs</Link> |{" "}
        </div>
        <div>
        <Link to="/register">Register</Link> {" "}
        <Link to="/login">Login</Link>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/clubs" element={<Clubs />} />
      </Routes>
    </Router>
  );
}

export default App;
