import React, { useEffect, useState } from "react";

function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClubs() {
      try {
        const response = await fetch("http://localhost:5000/api/clubs");
        const data = await response.json();
        setClubs(data);
      } catch (error) {
        console.error("Failed to load clubs:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, []);

  if (loading) return <p>Loading clubs...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Browse Clubs</h2>

      {clubs.length === 0 && <p>No clubs available.</p>}

      <ul>
        {clubs.map((club) => (
          <li key={club.id}>
            <strong>{club.name}</strong>
            <br />
            {club.description}
            <br />
            <small>Location: {club.location || "Not listed"}</small>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Clubs;
