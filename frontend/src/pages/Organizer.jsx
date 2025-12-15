import React, { useState, useEffect } from 'react';
import Toast from '../components/toast';

function Organizer() {
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClub, setSelectedClub] = useState(null);
  const [toast, setToast] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [clubMembers, setClubMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // One-time meetup state
const [oneTimeMeetup, setOneTimeMeetup] = useState({
  date: '',
  startTime: '',
  endTime: ''
});

  // Form state for creating a club
  const [clubForm, setClubForm] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    type: 'Biking',
    description: '',
    meetup_times: '',
    image: null
  });

  // Form state for editing a club
  const [editForm, setEditForm] = useState({
    name: '',
    address: '',
    type: 'Biking',
    description: '',
    meetup_times: '',
    image: null
  });

  // Meetup times builder state
  const [meetupDays, setMeetupDays] = useState([]);
  const [editMeetupDays, setEditMeetupDays] = useState([]);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchMyClubs();
  }, []);

  const fetchClubMembers = async (clubId) => {
    setLoadingMembers(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/organizer/club-members/${clubId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setClubMembers(data.members || []);
      setShowMembersModal(true);
    } catch (error) {
      console.error('Failed to fetch club members:', error);
      setToast({ message: 'Failed to load members', type: 'error' });
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchMyClubs = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/organizer/my-clubs', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      setMyClubs(data.clubs || []);
    } catch (error) {
      console.error('Failed to fetch my clubs:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMeetupDay = () => {
    setMeetupDays([...meetupDays, { day: 'Monday', startTime: '06:00', endTime: '07:00' }]);
  };

  const updateMeetupDay = (index, field, value) => {
    const updated = [...meetupDays];
    updated[index][field] = value;
    setMeetupDays(updated);
  };

  const removeMeetupDay = (index) => {
    setMeetupDays(meetupDays.filter((_, i) => i !== index));
  };

  const addEditMeetupDay = () => {
    setEditMeetupDays([...editMeetupDays, { day: 'Monday', startTime: '06:00', endTime: '07:00' }]);
  };

  const updateEditMeetupDay = (index, field, value) => {
    const updated = [...editMeetupDays];
    updated[index][field] = value;
    setEditMeetupDays(updated);
  };

  const removeEditMeetupDay = (index) => {
    setEditMeetupDays(editMeetupDays.filter((_, i) => i !== index));
  };

  const formatTime12Hour = (timeStr) => {
    if (!timeStr) return '';
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    const ampm = hour >= 12 ? 'pm' : 'am';
    hour = hour % 12 || 12; // convert 0 → 12, 13 → 1, etc.
    return `${hour}${minute !== 0 ? `:${minuteStr}` : ''}${ampm}`;
  };

  const formatMeetupTimes = () => {
    return meetupDays
      .map(m => `${m.day}s ${formatTime12Hour(m.startTime)}-${formatTime12Hour(m.endTime)}`)
      .join(', ');
  };

  const formatEditMeetupTimes = () => {
    return editMeetupDays
      .map(m => `${m.day}s ${formatTime12Hour(m.startTime)}-${formatTime12Hour(m.endTime)}`)
      .join(', ');
  };

const parseMeetupTimes = (meetupTimesStr) => {
  if (!meetupTimesStr) return [];

  const recurringDays = [
    'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  return meetupTimesStr
    .split(',')
    .map(s => s.trim())
    //ONLY keep recurring entries
    .filter(entry =>
      recurringDays.some(day => entry.startsWith(day))
    )
    .map(dayStr => {
      const parts = dayStr.split(' ');
      if (parts.length < 2) return null;

      const day = parts[0].replace('s', '');
      const times = parts[1].split('-');
      if (times.length !== 2) return null;

      const convert12to24 = (time12) => {
        const isPM = time12.toLowerCase().includes('pm');
        const isAM = time12.toLowerCase().includes('am');
        let timeNum = time12.replace(/am|pm/gi, '');

        let hour, minute;
        if (timeNum.includes(':')) {
          [hour, minute] = timeNum.split(':').map(n => parseInt(n, 10));
        } else {
          hour = parseInt(timeNum, 10);
          minute = 0;
        }

        if (isPM && hour !== 12) hour += 12;
        if (isAM && hour === 12) hour = 0;

        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      };

      return {
        day,
        startTime: convert12to24(times[0]),
        endTime: convert12to24(times[1])
      };
    })
    .filter(Boolean); // remove nulls
};

  const openEditModal = (club) => {
    setEditForm({
      name: club.name,
      address: `${club.address}, ${club.city}, ${club.state} ${club.zip_code}`,
      type: club.type,
      description: club.description,
      meetup_times: club.meetup_times,
      image: null
    });
    setEditMeetupDays(parseMeetupTimes(club.meetup_times));
    setShowEditModal(true);
  };

const handleCreateClub = async (e) => {
  e.preventDefault();

  // Parse address: "Street, City, State ZIP"
  const addressParts = clubForm.address.split(',').map(s => s.trim());
  if (addressParts.length !== 3) {
    setToast({
      message: 'Please enter address in format: Street Address, City, State ZIP',
      type: 'error'
    });
    return;
  }

  const street = addressParts[0];
  const city = addressParts[1];

  const stateZipParts = addressParts[2].split(/\s+/);
  if (stateZipParts.length !== 2) {
    setToast({
      message: 'State and ZIP must be in format: "ST 12345"',
      type: 'error'
    });
    return;
  }

  const [state, zip] = stateZipParts;

const formattedMeetupTimes =
  meetupDays.length > 0
    ? formatMeetupTimes()
    : clubForm.meetup_times;

  const fullAddress = `${street}, ${city}, ${state} ${zip}`;

  let coordinates;
  try {
    coordinates = await geocodeAddress(fullAddress);
  } catch {
    setToast({
      message: 'Could not verify club location',
      type: 'error'
    });
    return;
  }

  const formData = new FormData();
  formData.append('name', clubForm.name);
  formData.append('address', street);
  formData.append('city', city);
  formData.append('state', state);
  formData.append('zip_code', zip);
  formData.append('latitude', coordinates.lat);
  formData.append('longitude', coordinates.lng);
  formData.append('type', clubForm.type);
  formData.append('description', clubForm.description);
  formData.append('meetup_times', formattedMeetupTimes);
  

  if (clubForm.image) {
    formData.append('image', clubForm.image);
  }

  try {
    const token = sessionStorage.getItem('token');
    const response = await fetch(
      'http://localhost:5000/api/organizer/create-club',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setToast({
        message: data.message || 'Failed to create club',
        type: 'error'
      });
      return;
    }

    setToast({ message: 'Club created successfully!', type: 'success' });
    setShowCreateModal(false);

    setClubForm({
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      type: 'Biking',
      description: '',
      meetup_times: '',
      image: null
    });

    setMeetupDays([]);
    fetchMyClubs();
  } catch (error) {
    console.error('Failed to create club:', error);
    setToast({
      message: 'Failed to create club. See console for details.',
      type: 'error'
    });
  }
};

const getApproximateCoordinates = (address) => {
  const zipMatch = address.match(/\b\d{5}\b/);
  if (!zipMatch) {
    return { lat: 37.9513, lng: -91.7713 };
  }

  const zip = parseInt(zipMatch[0]);

  if (zip >= 63000 && zip <= 63999) {
    return { lat: 38.6270, lng: -90.1994 };
  } else if (zip >= 64000 && zip <= 64999) {
    return { lat: 39.0997, lng: -94.5786 };
  } else if (zip >= 65000 && zip <= 65899) {
    return { lat: 37.2090, lng: -93.2923 };
  }

  return { lat: 37.9513, lng: -91.7713 };
};

const geocodeAddress = async (address) => {
  try {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=us&limit=1`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'GroupUp-ClubApp/1.0 (educational-project)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return getApproximateCoordinates(address);
    }

    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }

    return getApproximateCoordinates(address);
  } catch {
    return getApproximateCoordinates(address);
  }
};

const handleEditClub = async (e) => {
  e.preventDefault();

  const addressParts = editForm.address.split(',').map(s => s.trim());
  if (addressParts.length !== 3) {
    setToast({
      message: 'Please enter address in format: Street Address, City, State ZIP',
      type: 'error'
    });
    return;
  }

  const street = addressParts[0];
  const city = addressParts[1];

  const stateZipParts = addressParts[2].split(/\s+/);
  if (stateZipParts.length !== 2) {
    setToast({
      message: 'State and ZIP must be in format: "ST 12345"',
      type: 'error'
    });
    return;
  }

  const [state, zip] = stateZipParts;
  const fullAddress = `${street}, ${city}, ${state} ${zip}`;

  // 🔹 GEOCODE UPDATED ADDRESS
  const coords = await geocodeAddress(fullAddress);
  if (!coords) {
    setToast({
      message: 'Could not determine location for this address',
      type: 'error'
    });
    return;
  }

  const formattedMeetupTimes = formatEditMeetupTimes();

  const formData = new FormData();
  formData.append('name', editForm.name);
  formData.append('address', street);
  formData.append('city', city);
  formData.append('state', state);
  formData.append('zip_code', zip);
  formData.append('latitude', coords.lat);
  formData.append('longitude', coords.lng);
  formData.append('type', editForm.type);
  formData.append('description', editForm.description);
  formData.append('meetup_times', formattedMeetupTimes);

  if (editForm.image) {
    formData.append('image', editForm.image);
  }

  try {
    const token = sessionStorage.getItem('token');
    const response = await fetch(
      `http://localhost:5000/api/organizer/edit-club/${selectedClub.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setToast({
        message: data.message || 'Failed to update club',
        type: 'error'
      });
      return;
    }

    setToast({ message: 'Club updated successfully!', type: 'success' });
    setShowEditModal(false);

    setEditForm({
      name: '',
      address: '',
      type: 'Biking',
      description: '',
      meetup_times: '',
      image: null
    });

    setEditMeetupDays([]);
    setSelectedClub(null);
    fetchMyClubs();

  } catch (error) {
    console.error('Failed to update club:', error);
    setToast({
      message: 'Failed to update club. See console for details.',
      type: 'error'
    });
  }
};


    const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Are you sure you want to delete this club? This action cannot be undone.')) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/organizer/delete-club/${clubId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Club deleted successfully!', type: 'success' });

        setSelectedClub(null);
        fetchMyClubs(); // Refresh the list
      } else {
        setToast({ message: 'Failed to delete club', type: 'error' });

      }
    } catch (error) {
      console.error('Failed to delete club:', error);
      setToast({ message: 'Failed to delete club. See consol for details', type: 'error' });

    }
  };

const formatOneTimeMeetup = () => {
  if (!oneTimeMeetup.date || !oneTimeMeetup.startTime || !oneTimeMeetup.endTime) {
    return '';
  }

  const dateObj = new Date(oneTimeMeetup.date);
  const readableDate = dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return `${readableDate} ${formatTime12Hour(oneTimeMeetup.startTime)}-${formatTime12Hour(oneTimeMeetup.endTime)}`;
};

const saveOneTimeMeetup = async () => {
  if (!selectedClub) return;

  const formatted = formatOneTimeMeetup();
  if (!formatted) {
    setToast({ message: 'Please complete date and time', type: 'error' });
    return;
  }

  try {
    const token = sessionStorage.getItem('token');

    const formData = new FormData();

    // 🔹 REQUIRED FIELDS (reuse existing values)
    formData.append('name', selectedClub.name);
    formData.append('address', selectedClub.address);
    formData.append('city', selectedClub.city);
    formData.append('state', selectedClub.state);
    formData.append('zip_code', selectedClub.zip_code);
    formData.append('type', selectedClub.type);
    formData.append('description', selectedClub.description);

    // 🔹 ONLY THING WE ARE ACTUALLY CHANGING
    const combinedMeetupTimes = selectedClub.meetup_times
  ? `${selectedClub.meetup_times}, ${formatted}`
  : formatted;

formData.append('meetup_times', combinedMeetupTimes);;

    const response = await fetch(
      `http://localhost:5000/api/organizer/edit-club/${selectedClub.id}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save meetup');
    }

    setToast({ message: 'One-time meetup saved!', type: 'success' });

    // Update UI immediately
    setSelectedClub({
      ...selectedClub,
      meetup_times: formatted
    });

    fetchMyClubs();

  } catch (err) {
    console.error('Save one-time meetup error:', err);
    setToast({ message: 'Failed to save one-time meetup', type: 'error' });
  }
};

  if (loading) return <p>Loading your clubs...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Club Organizer</h2>
      
      {myClubs.length === 0 ? (
        <p>
          You currently have not created any clubs. Create a club{' '}
          <span
            style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setShowCreateModal(true)}
          >
            here
          </span>
          !
        </p>
      ) : (
        <>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: '10px 20px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            Create New Club
          </button>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {myClubs.map((club) => (
              <div
                key={club.id}
                style={{
                  width: '250px',
                  border: '1px solid #ccc',
                  padding: '15px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <img
                src={club.image_url ? `http://localhost:5000${club.image_url}` : 'https://via.placeholder.com/250x150'}
                alt={club.name}
                style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '10px',
                }}
                />
                <h3
                  style={{
                    color: 'blue',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    margin: '10px 0',
                  }}
                  onClick={() => setSelectedClub(club)}
                >
                  {club.name}
                </h3>
                <p style={{ margin: '8px 0' }}>
                  <strong>Location:</strong>{' '}
                  {club.city && club.state
                    ? `${club.city}, ${club.state}`
                    : 'Not listed'}
                </p>
                <p style={{ margin: '8px 0' }}>
                  <strong>Members:</strong>{' '}
                  <span
                    style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      fetchClubMembers(club.id);
                    }}
                  >
                    {club.member_count || 0}
                  </span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* CREATE CLUB MODAL */}
      {showCreateModal && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              width: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Create a New Club</h2>
            <form onSubmit={handleCreateClub}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Club Name:</strong>
                </label>
                <input
                  type="text"
                  value={clubForm.name}
                  onChange={(e) => setClubForm({ ...clubForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Address:</strong>
                </label>
                <input
                  type="text"
                  placeholder="789 Pine Avenue, University City, MO 63130"
                  value={clubForm.address}
                  onChange={(e) => setClubForm({ ...clubForm, address: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
                <small style={{ color: '#666' }}>Format: Street Address, City, State ZIP</small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Type:</strong>
                </label>
                <select
                  value={clubForm.type}
                  onChange={(e) => setClubForm({ ...clubForm, type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="Biking">Biking</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Games">Games</option>
                  <option value="Walking">Walking</option>
                  <option value="Arts">Arts</option>
                  <option value="Hobbies">Hobbies</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Description:</strong>
                </label>
                <textarea
                  value={clubForm.description}
                  onChange={(e) => setClubForm({ ...clubForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Meetup Times:</strong>
                </label>
                {meetupDays.map((meetup, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <select
                      value={meetup.day}
                      onChange={(e) => updateMeetupDay(index, 'day', e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={meetup.startTime}
                      onChange={(e) => updateMeetupDay(index, 'startTime', e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={meetup.endTime}
                      onChange={(e) => updateMeetupDay(index, 'endTime', e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeMeetupDay(index)}
                      style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addMeetupDay}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Meetup Time
                </button>
                {meetupDays.length > 0 && (
                  <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                    Preview: {formatMeetupTimes()}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Club Image:</strong>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setClubForm({ ...clubForm, image: e.target.files[0] })}
                  style={{ width: '100%', padding: '8px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Create Club
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT CLUB MODAL */}
      {showEditModal && selectedClub && (
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
            zIndex: 1000,
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              width: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Edit Club Info</h2>
            <form onSubmit={handleEditClub}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Club Name:</strong>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Address:</strong>
                </label>
                <input
                  type="text"
                  placeholder="789 Pine Avenue, University City, MO 63130"
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                />
                <small style={{ color: '#666' }}>Format: Street Address, City, State ZIP</small>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Type:</strong>
                </label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  required
                >
                  <option value="Biking">Biking</option>
                  <option value="Wellness">Wellness</option>
                  <option value="Games">Games</option>
                  <option value="Walking">Walking</option>
                  <option value="Arts">Arts</option>
                  <option value="Hobbies">Hobbies</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Description:</strong>
                </label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '80px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Meetup Times:</strong>
                </label>
                {editMeetupDays.map((meetup, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
                    <select
                      value={meetup.day}
                      onChange={(e) => updateEditMeetupDay(index, 'day', e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    >
                      {daysOfWeek.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={meetup.startTime}
                      onChange={(e) => updateEditMeetupDay(index, 'startTime', e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <span>to</span>
                    <input
                      type="time"
                      value={meetup.endTime}
                      onChange={(e) => updateEditMeetupDay(index, 'endTime', e.target.value)}
                      style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeEditMeetupDay(index)}
                      style={{
                        padding: '5px 10px',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addEditMeetupDay}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Add Meetup Time
                </button>
                {editMeetupDays.length > 0 && (
                  <p style={{ marginTop: '10px', color: '#666', fontSize: '14px' }}>
                    Preview: {formatEditMeetupTimes()}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  <strong>Club Image (leave empty to keep current):</strong>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] })}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Update Club
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    flex: 1,
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{/* MEMBERS MODAL */}
{showMembersModal && (
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
      zIndex: 1000,
    }}
    onClick={() => setShowMembersModal(false)}
  >
    <div
      style={{
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        width: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h2>Club Members</h2>
      {loadingMembers ? (
        <p>Loading members...</p>
      ) : clubMembers.length === 0 ? (
        <p>No members yet.</p>
      ) : (
        <div style={{ marginTop: '20px' }}>
          {clubMembers.map((member, index) => (
            <div
              key={member.user_id || index}
              style={{
                padding: '15px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                  {member.name}
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  {member.email}
                </p>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#999' }}>
                  Joined: {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => setShowMembersModal(false)}
        style={{
          padding: '10px 20px',
          background: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          width: '100%',
          marginTop: '20px',
        }}
      >
        Close
      </button>
    </div>
  </div>
)}

{/* CLUB DETAILS MODAL */}
      {selectedClub && !showEditModal && (
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
            zIndex: 1000,
          }}
          onClick={() => setSelectedClub(null)}
        >
          <div
            style={{
              background: 'white',
              padding: '25px',
              borderRadius: '12px',
              width: '500px',
              maxHeight: '80vh',
              overflowY: 'auto',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Edit button in top right */}
            <button
              onClick={() => openEditModal(selectedClub)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                padding: '8px 16px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Edit Info
            </button>

            {/* Delete button - ADD THIS RIGHT HERE */}
            <button
              onClick={() => handleDeleteClub(selectedClub.id)}
              style={{
                position: 'absolute',
                top: '55px',
                right: '15px',
                padding: '8px 16px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              Delete Club
            </button>

            <h2>{selectedClub.name}</h2>
            <img
            src={selectedClub.image_url ? `http://localhost:5000${selectedClub.image_url}` : 'https://via.placeholder.com/450x250'}
            alt={selectedClub.name}
            style={{
                width: '100%',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '8px',
                marginBottom: '15px',
            }}
            />
            <p style={{ marginBottom: '10px' }}>
              <strong>Type:</strong> {selectedClub.type || 'Not specified'}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Description:</strong> {selectedClub.description}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Address:</strong>{' '}
              {selectedClub.address && selectedClub.city && selectedClub.state
                ? `${selectedClub.address}, ${selectedClub.city}, ${selectedClub.state} ${selectedClub.zip_code}`
                : 'Not listed'}
            </p>
            <p style={{ marginBottom: '10px' }}>
              <strong>Meetup Times:</strong> {selectedClub.meetup_times || 'None listed'}
            </p>
            <p style={{ marginBottom: '15px' }}>
              <strong>Members:</strong> {selectedClub.member_count || 0}
            </p>
            <hr style={{ margin: '25px 0' }} />

<h4>One-Time Meetup</h4>

<div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
  <input
    type="date"
    value={oneTimeMeetup.date}
    onChange={(e) =>
      setOneTimeMeetup({ ...oneTimeMeetup, date: e.target.value })
    }
  />

  <input
    type="time"
    value={oneTimeMeetup.startTime}
    onChange={(e) =>
      setOneTimeMeetup({ ...oneTimeMeetup, startTime: e.target.value })
    }
  />

  <input
    type="time"
    value={oneTimeMeetup.endTime}
    onChange={(e) =>
      setOneTimeMeetup({ ...oneTimeMeetup, endTime: e.target.value })
    }
  />
</div>

<button
  type="button"
  onClick={saveOneTimeMeetup}

  style={{
    padding: '8px 16px',
    background: '#6f42c1',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  }}
>
  + Create One-Time Meetup
</button>

{clubForm.meetup_times && (
  <p style={{ marginTop: '10px', color: '#666' }}>
    Preview: {clubForm.meetup_times}
  </p>
)}
            <button
              onClick={() => setSelectedClub(null)}
              style={{
                padding: '10px 20px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default Organizer;