import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Dashboard() {
  const [userClubs, setUserClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = sessionStorage.getItem("token");

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
        <ul>
          {userClubs.map((club) => (
            <li key={club.id}>
              <strong>{club.name}</strong>
            </li>
          ))}
        </ul>
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