import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ setIsLoggedIn }) {  // Add setIsLoggedIn prop
  const navigate = useNavigate();  // Add navigate
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Registering...');

    try {
      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      // Check if response is JSON
      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Failed to parse JSON:', jsonErr);
        setMessage('❌ Server returned invalid JSON');
        return;
      }

      if (res.ok) {
        setMessage(`✅ Registered successfully! Logging you in...`);
        
        // Auto-login after registration
        try {
          const loginRes = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });

          const loginData = await loginRes.json();

          if (loginRes.ok && loginData.token) {
            // Save token
            localStorage.setItem('token', loginData.token);
            
            // Save user info
            localStorage.setItem('user', JSON.stringify({
              id: loginData.user.id,
              email: loginData.user.email,
              name: loginData.user.name
            }));

            setIsLoggedIn(true);  // Update login state
            navigate('/dashboard');  // Navigate to dashboard
          }
        } catch (loginErr) {
          console.error('Auto-login failed:', loginErr);
          setMessage('✅ Registered! Please log in.');
          setTimeout(() => navigate('/login'), 2000);
        }
        
      } else {
        console.error('Backend error:', data);
        setMessage(`❌ Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Network error or backend not reachable:', err);
      setMessage(
        '❌ Could not reach backend. Make sure the server is running on port 5000.'
      );
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: '0 auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 15 }}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 15 }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 15 }}
          required
        />
        <button 
          type="submit"
          style={{
            width: '100%',
            padding: 10,
            background: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer'
          }}
        >
          Register
        </button>
      </form>
      {message && <p style={{ marginTop: 15 }}>{message}</p>}
    </div>
  );
}

export default Register;