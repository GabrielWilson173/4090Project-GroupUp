import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  const [message, setMessage] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Registering...');
    setIsGeocoding(true);

    try {
      // Geocode the address first
      const fullAddress = `${form.address}, ${form.city}, ${form.state} ${form.zip_code}`;
      const coordinates = await geocodeAddress(fullAddress);
      
      if (!coordinates) {
        setMessage('⚠️ Could not verify address location. Please check your address.');
        setIsGeocoding(false);
        return;
      }

      // Add coordinates to form data
      const registrationData = {
        ...form,
        latitude: coordinates.lat,
        longitude: coordinates.lng
      };

      const res = await fetch('http://localhost:5000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        console.error('Failed to parse JSON:', jsonErr);
        setMessage('❌ Server returned invalid JSON');
        setIsGeocoding(false);
        return;
      }

      if (res.ok) {
        setMessage('✅ Registered successfully! Logging you in...');
        
        // Auto-login after registration
        try {
          const loginRes = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });

          const loginData = await loginRes.json();

          if (loginRes.ok && loginData.token) {
            sessionStorage.setItem('token', loginData.token);
            sessionStorage.setItem('user', JSON.stringify({
              id: loginData.user.id,
              email: loginData.user.email,
              name: loginData.user.name,
              latitude: coordinates.lat,
              longitude: coordinates.lng
            }));

            setIsLoggedIn(true);
            navigate('/dashboard');
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
      setMessage('❌ Could not reach backend. Make sure the server is running on port 5000.');
    } finally {
      setIsGeocoding(false);
    }
  };

  // Fallback function using ZIP code ranges (approximate)
  const getApproximateCoordinates = (address) => {
    // Extract ZIP code from address
    const zipMatch = address.match(/\b\d{5}\b/);
    if (!zipMatch) {
      console.log('No ZIP found, using Rolla default');
      return { lat: 37.9513, lng: -91.7713 };
    }
    
    const zip = parseInt(zipMatch[0]);
    console.log('Using ZIP-based approximation for:', zip);
    
    // Missouri ZIP code ranges with approximate centers
    if (zip >= 63000 && zip <= 63999) {
      return { lat: 38.6270, lng: -90.1994 }; // St. Louis area
    } else if (zip >= 64000 && zip <= 64999) {
      return { lat: 39.0997, lng: -94.5786 }; // Kansas City area
    } else if (zip >= 65000 && zip <= 65899) {
      return { lat: 37.2090, lng: -93.2923 }; // Springfield area
    }
    
    // Default to Rolla, MO
    return { lat: 37.9513, lng: -91.7713 };
  };

  // Geocoding function using Nominatim (OpenStreetMap) with fallback
  const geocodeAddress = async (address) => {
    try {
      console.log('Attempting to geocode:', address);
      
      // Add delay to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GroupUp-ClubApp/1.0 (educational-project)',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.warn('Geocoding API returned error:', response.status);
        console.log('Falling back to ZIP-based approximation');
        return getApproximateCoordinates(address);
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data && data.length > 0) {
        console.log('✅ Geocoding successful:', data[0].lat, data[0].lon);
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      
      console.warn('No geocoding results found, using ZIP-based approximation');
      return getApproximateCoordinates(address);
      
    } catch (error) {
      console.error('Geocoding error:', error);
      console.log('Falling back to ZIP-based approximation');
      return getApproximateCoordinates(address);
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
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
        
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
        
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />

        <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #eee' }} />
        <p style={{ margin: '10px 0', fontSize: '14px', color: '#666' }}>
          <strong>Your Location</strong> (for finding nearby clubs)
        </p>

        <input
          placeholder="Street Address (e.g., 123 Main St)"
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
        
        <input
          placeholder="City"
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          style={{ width: '100%', padding: 10, marginBottom: 15, borderRadius: 4, border: '1px solid #ccc' }}
          required
        />
        
        <div style={{ display: 'flex', gap: '10px', marginBottom: 15 }}>
          <input
            placeholder="State (e.g., MO)"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
            style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
            maxLength={2}
            required
          />
          
          <input
            placeholder="ZIP Code"
            value={form.zip_code}
            onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
            style={{ flex: 1, padding: 10, borderRadius: 4, border: '1px solid #ccc' }}
            pattern="[0-9]{5}"
            maxLength={5}
            required
          />
        </div>

        <button 
          type="submit"
          disabled={isGeocoding}
          style={{
            width: '100%',
            padding: 10,
            background: isGeocoding ? '#ccc' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: isGeocoding ? 'not-allowed' : 'pointer',
            opacity: isGeocoding ? 0.6 : 1
          }}
        >
          {isGeocoding ? 'Verifying Location...' : 'Register'}
        </button>
      </form>
      
      {message && (
        <p style={{ 
          marginTop: 15, 
          padding: 10, 
          borderRadius: 4,
          background: message.includes('❌') ? '#fee' : message.includes('✅') ? '#efe' : '#fef3cd',
          color: message.includes('❌') ? '#c00' : message.includes('✅') ? '#0a0' : '#856404'
        }}>
          {message}
        </p>
      )}
      
      <p style={{ marginTop: 15, fontSize: '12px', color: '#999', textAlign: 'center' }}>
        We use your location to show nearby clubs. Your exact address is not shared with other users.
      </p>
    </div>
  );
}

export default Register;