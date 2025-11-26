import React, { useEffect, useState } from "react";
import Toast from '../components/toast';

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const storedUser = JSON.parse(sessionStorage.getItem("user"));
  const currentUserId = storedUser ? storedUser.id : null;

  // Popup
  const [selectedClub, setselectedClub] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Dropdown filter
  const [clubType, setClubType] = useState("all");

  // Track which clubs the current user has joined
  const [joinedClubs, setJoinedClubs] = useState([]);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const token = sessionStorage.getItem("token");
        
        const [clubsRes, userRes] = await Promise.all([
          fetch("http://localhost:5000/api/clubs"),
          fetch("http://localhost:5000/api/users/me", {
            headers: {
              Authorization: `Bearer ${token || ""}`,
            },
          }),
        ]);

        const clubsData = await clubsRes.json();
        setClubs(clubsData);

        if (userRes.ok) {
          const userData = await userRes.json();
          const joined = userData.user.joined_clubs || [];
          setJoinedClubs(joined);
        } else {
          // User not authenticated - just skip loading joined clubs
          console.log("User not logged in - some features disabled");
          setJoinedClubs([]);
        }
      } catch (error) {
        console.error("Failed to load clubs or user info:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, []);


  if (loading) return <p>Loading clubs...</p>;

  // ===== FILTERED CLUB LIST =====
  const filteredClubs = clubs.filter((club) => {
    const matchesSearch =
      club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      club.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType =
      clubType === "all" ||
      club.type?.toLowerCase() === clubType.toLowerCase();

    return matchesSearch && matchesType;
  });

  return (
    <div style={{ padding: "20px" }}>
      <h2>Browse Clubs</h2>

      {/* ====== SEARCH + FILTER BAR ====== */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          alignItems: "center",
        }}
      >
        {/* Search bar */}
        <input
          type="text"
          placeholder="Search clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "250px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        {/* Club type dropdown */}
        <select
          value={clubType}
          onChange={(e) => setClubType(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          <option value="all">All Types</option>
          <option value="Biking">Biking</option>
          <option value="Wellness">Wellness</option>
          <option value="Games">Games</option>
          <option value="Walking">Walking</option>
          <option value="Arts">Arts</option>
          <option value="Hobbies">Hobbies</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      {/* ======= CLUB RESULTS ======= */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {filteredClubs.length === 0 && (
          <p>No clubs match your search or filters.</p>
        )}

        {filteredClubs.map((club) => (
          <div
            key={club.id || club.id}
            style={{
              width: "250px",
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            
            {/* Club Image - MOVED TO TOP */}
            
            <img
              src={
                club.image_url
                  ? club.image_url.startsWith("http")
                    ? club.image_url
                    : `http://localhost:5000${club.image_url}`
                  : "https://via.placeholder.com/250x150"
              }
              alt={club.name}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "10px",
              }}
            />


            {/* Club clickable name */}
            <h3
              style={{
                color: "blue",
                cursor: "pointer",
                textDecoration: "underline",
                margin: "10px 0",
              }}
              onClick={() => setselectedClub(club)}
            >
              {club.name}
            </h3>

            <p style={{ margin: "8px 0" }}>
              <strong>Location:</strong>{" "}
              {club.city && club.state
                ? `${club.city}, ${club.state}`
                : "Not listed"}
            </p>

            <p style={{ margin: "8px 0" }}>
              <strong>Meetups:</strong> {club.meetup_times || "None listed"}
            </p>
          </div>
        ))}
      </div>

      {/* ======== MODAL POPUP ========= */}
      {selectedClub && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setselectedClub(null)}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "500px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{selectedClub.name}</h2>

            {/* Club Image */}
            <img
              src={
                selectedClub.image_url
                  ? selectedClub.image_url.startsWith("http")
                    ? selectedClub.image_url
                    : `http://localhost:5000${selectedClub.image_url}`
                  : "https://via.placeholder.com/450x250"
              }
              alt={selectedClub.name}
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
                borderRadius: "8px",
                marginBottom: "15px",
              }}
            />


            <p style={{ marginBottom: "10px" }}>
              <strong>Type:</strong> {selectedClub.type || "Not specified"}
            </p>

            <p style={{ marginBottom: "10px" }}>
              <strong>Description:</strong> {selectedClub.description}
            </p>

            <p style={{ marginBottom: "10px" }}>
              <strong>Address:</strong>{" "}
              {selectedClub.address &&
              selectedClub.city &&
              selectedClub.state
                ? `${selectedClub.address}, ${selectedClub.city}, ${selectedClub.state} ${selectedClub.zip_code}`
                : "Not listed"}
            </p>

            <p style={{ marginBottom: "10px" }}>
              <strong>Meetup Times:</strong>{" "}
              {selectedClub.meetup_times || "None listed"}
            </p>

            <p style={{ marginBottom: "15px" }}>
              <strong>Members:</strong> {selectedClub.member_count || 0}
            </p>

            {/* Only show the button if the current user is NOT the organizer */}
            {selectedClub.organizer_id !== currentUserId && (
              <button
                style={{
                  padding: "10px 20px",
                  background: joinedClubs.includes(selectedClub.id) ? "#dc3545" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  width: "100%",
                }}
                onClick={async () => {
                  const token = sessionStorage.getItem("token");
                  if (!token) {
                    setToast({ message: 'You must be logged in to join a club.', type: 'error' });
                    return;
                  }

                  const action = joinedClubs.includes(selectedClub.id) ? "leave" : "join";
                  try {
                    const response = await fetch(
                      `http://localhost:5000/api/clubs/${selectedClub.id}/${action}`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`, // <--- send JWT here
                        },
                      }
                    );
                    const data = await response.json();
                    if (data.success) {
                      // Update selected club's member count locally
                      setselectedClub({
                        ...selectedClub,
                        member_count: data.member_count,
                      });
                      // Update main clubs list
                      setClubs((prevClubs) =>
                        prevClubs.map((club) =>
                          club.id === selectedClub.id
                            ? { ...club, member_count: data.member_count }
                            : club
                        )
                      );

                      // Update joinedClubs state
                      if (action === "join") {
                        setJoinedClubs((prev) => [...prev, selectedClub.id]);
                      } else {
                        setJoinedClubs((prev) =>
                          prev.filter((id) => id !== selectedClub.id)
                        );
                      }
                    } else {
                      alert(`Failed to ${action} club: ${data.error || "Unknown error"}`);
                    }
                  } catch (error) {
                    console.error(`Failed to ${action} club:`, error);
                    alert(`Failed to ${action} club. See console for details.`);
                  }
                }}
              >
                {joinedClubs.includes(selectedClub.id) ? "Leave Club" : "Join Club"}
              </button>
            )}

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

export default Clubs;