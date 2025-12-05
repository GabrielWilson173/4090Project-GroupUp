import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");

  const [selectedClub, setselectedClub] = useState(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        // 1. Get all clubs
        const clubsRes = await fetch("http://localhost:5000/api/clubs");
        const clubsData = await clubsRes.json();

        // 2. Get user info (joined_clubs)
        const userRes = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token || ""}` },
        });

        let joined = [];
        if (userRes.ok) {
          const userData = await userRes.json();
          joined = userData.user.joined_clubs || [];
        }

        // 3. Filter clubs the user has joined
        const myClubs = clubsData.filter((c) => joined.includes(c.id));

        setUserClubs(myClubs);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [token]);

  if (loading) return <p>Loading Dashboard...</p>;

  // =================== LEAVE CLUB HANDLER ===================
  async function handleLeaveClub(clubId) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/clubs/${clubId}/leave`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Remove club from dashboard list
        setUserClubs((prev) => prev.filter((c) => c.id !== clubId));

        // Close popup
        setselectedClub(null);
      } else {
        alert(data.error || "Failed to leave club.");
      }
    } catch (err) {
      console.error("Failed to leave club:", err);
      alert("Could not leave club. Please try again.");
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      <p>Welcome to your dashboard!</p>
      <p>
        Here you'll see your clubs and upcoming club events. Get started by
        joining some <Link to="/clubs">clubs</Link>!
      </p>

      {/* ================= USER’S CLUBS ================= */}
      <h3>Your Clubs:</h3>
      {userClubs.length === 0 ? (
        <p>You are not in any clubs yet.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
          {userClubs.map((club) => (
            <div
              key={club.id}
              style={{
                width: "250px",
                border: "1px solid #ccc",
                padding: "15px",
                borderRadius: "10px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              {/* Club Image – same style as Clubs.jsx */}
              <img
                src={club.image_url || "https://via.placeholder.com/250x150"}
                alt={club.name}
                style={{
                  width: "100%",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />

              {/* Club name*/}
              <h3
                style={{
                  color: "blue",
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
                <strong>Meetups:</strong>{" "}
                {club.meetup_times || "None listed"}
              </p>
            </div>
          ))}
        </div> 
      )}


      {/* ---------- POPUP MODAL (copied from Clubs.jsx) ---------- */}
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

            <img
              src={
                selectedClub.image_url ||
                "https://via.placeholder.com/450x250"
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

            <p>
              <strong>Type:</strong> {selectedClub.type || "Not specified"}
            </p>

            <p>
              <strong>Description:</strong> {selectedClub.description}
            </p>

            <p>
              <strong>Address:</strong>{" "}
              {selectedClub.address &&
              selectedClub.city &&
              selectedClub.state
                ? `${selectedClub.address}, ${selectedClub.city}, ${selectedClub.state} ${selectedClub.zip_code}`
                : "Not listed"}
            </p>

            <p>
              <strong>Meetup Times:</strong>{" "}
              {selectedClub.meetup_times || "None listed"}
            </p>

            <p>
              <strong>Members:</strong> {selectedClub.member_count || 0}
            </p>
            {/* LEAVE BUTTON*/}
            <button
              style={{
                padding: "10px 20px",
                background: "#dc3545", // red
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                marginTop: "15px",
              }}
              onClick={() => handleLeaveClub(selectedClub.id)}
            >
              Leave Club
            </button>
          </div>
        </div>
      )}

      {/* ================= UPCOMING MEETINGS ================= */}
      <h3>Upcoming Meetings:</h3>
      {userClubs.length === 0 ? (
        <p>No upcoming meetings.</p>
      ) : (
        <ul>
          {userClubs.map((club) => (
            club.meetup_times ? (
              <li key={`mt-${club.id}`}>
                <strong>{club.name}:</strong> {club.meetup_times}
              </li>
            ) : null
          ))}
        </ul>
      )}
    </div>
    
  );
}

export default Dashboard;