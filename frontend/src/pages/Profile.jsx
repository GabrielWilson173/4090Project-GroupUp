import React, { useState } from 'react';

function Profile({ handleLogout }) {
  const [user, setUser] = useState(
    JSON.parse(sessionStorage.getItem('user') || '{}')
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name || '',
    email: user.email || '',
    location: user.location || ''
  });

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    const updatedUser = { ...user, ...editForm };

    // Save to sessionStorage
    sessionStorage.setItem('user', JSON.stringify(updatedUser));

    // Update state
    setUser(updatedUser);

    // Close modal
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Profile</h2>
      <p><strong>Name:</strong> {user.name || 'N/A'}</p>
      <p><strong>Email:</strong> {user.email || 'N/A'}</p>
      <p><strong>Location:</strong> {user.location || 'N/A'}</p>

      {/* Buttons spaced out */}
      <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
        <button 
          onClick={handleEditProfile}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Edit Profile
        </button>

        <button 
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      {/* ===================== EDIT PROFILE ===================== */}
      {isEditing && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={() => setIsEditing(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              width: '400px',
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Edit Profile</h3>

            <label><strong>Name:</strong></label>
            <input
              type="text"
              name="name"
              value={editForm.name}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />

            <label><strong>Email:</strong></label>
            <input
              type="email"
              name="email"
              value={editForm.email}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />

            <label><strong>Location:</strong></label>
            <input
              type="text"
              name="location"
              value={editForm.location}
              onChange={handleChange}
              style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
            />

            {/* Save + Cancel Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button
                onClick={handleSaveProfile}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Save
              </button>

              <button
                onClick={() => setIsEditing(false)}
                style={{
                  flex: 1,
                  padding: '10px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;