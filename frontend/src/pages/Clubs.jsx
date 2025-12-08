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

  // Feedback modal states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showLeaveFeedbackModal, setShowLeaveFeedbackModal] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackClub, setFeedbackClub] = useState(null);
  
  // Feedback form state
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    comment: ''
  });

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

  const fetchClubFeedback = async (clubId) => {
    setLoadingFeedback(true);
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/clubs/${clubId}/feedback`, {
        headers: {
          Authorization: `Bearer ${token || ""}`
        }
      });
      const data = await response.json();
      setFeedbackList(data.feedback || []);
      setShowFeedbackModal(true);
    } catch (error) {
      console.error('Failed to fetch feedback:', error);
      setToast({ message: 'Failed to load feedback', type: 'error' });
    } finally {
      setLoadingFeedback(false);
    }
  };

  const handleLeaveFeedback = async (e) => {
    e.preventDefault();
    
    if (!feedbackForm.comment.trim()) {
      setToast({ message: 'Please write a comment', type: 'error' });
      return;
    }

    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/clubs/${feedbackClub.id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: feedbackForm.rating,
          comment: feedbackForm.comment
        })
      });

      const data = await response.json();
      if (data.success) {
        setToast({ message: 'Feedback submitted successfully!', type: 'success' });
        setShowLeaveFeedbackModal(false);
        setFeedbackForm({ rating: 5, comment: '' });
        // Refresh feedback list
        fetchClubFeedback(feedbackClub.id);
      } else {
        setToast({ message: data.error || 'Failed to submit feedback', type: 'error' });
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      setToast({ message: 'Failed to submit feedback', type: 'error' });
    }
  };

  if (loading) return <p>Loading clubs...</p>;

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
            key={club.id}
            style={{
              width: "250px",
              border: "1px solid #ccc",
              padding: "15px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
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

            {/* Feedback link */}
            <p style={{ margin: "8px 0" }}>
              <span
                style={{
                  color: "blue",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setFeedbackClub(club);
                  fetchClubFeedback(club.id);
                }}
              >
                View Feedback
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* ======== CLUB DETAILS MODAL ========= */}
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
                          Authorization: `Bearer ${token}`,
                        },
                      }
                    );
                    const data = await response.json();
                    if (data.success) {
                      setselectedClub({
                        ...selectedClub,
                        member_count: data.member_count,
                      });
                      setClubs((prevClubs) =>
                        prevClubs.map((club) =>
                          club.id === selectedClub.id
                            ? { ...club, member_count: data.member_count }
                            : club
                        )
                      );

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

      {/* ======== FEEDBACK MODAL ========= */}
      {showFeedbackModal && feedbackClub && (
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
          onClick={() => {
            setShowFeedbackModal(false);
            setFeedbackClub(null);
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Feedback for {feedbackClub.name}</h2>

            {joinedClubs.includes(feedbackClub.id) && (
              <button
                onClick={() => {
                  setShowFeedbackModal(false);
                  setShowLeaveFeedbackModal(true);
                }}
                style={{
                  padding: "10px 20px",
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  marginBottom: "20px",
                }}
              >
                Leave Feedback
              </button>
            )}

            {loadingFeedback ? (
              <p>Loading feedback...</p>
            ) : feedbackList.length === 0 ? (
              <p>No feedback yet. Be the first to leave feedback!</p>
            ) : (
              <div>
                {feedbackList.map((feedback, index) => (
                  <div
                    key={feedback.feedback_id || index}
                    style={{
                      padding: "15px",
                      borderBottom: "1px solid #eee",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                      <strong>{feedback.user_name}</strong>
                      <div>
                        {"⭐".repeat(feedback.rating)}
                        <span style={{ color: "#999", marginLeft: "10px" }}>
                          ({feedback.rating}/5)
                        </span>
                      </div>
                    </div>
                    <p style={{ margin: "10px 0", color: "#333" }}>{feedback.comment}</p>
                    <p style={{ fontSize: "12px", color: "#999" }}>
                      {new Date(feedback.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                setShowFeedbackModal(false);
                setFeedbackClub(null);
              }}
              style={{
                padding: "10px 20px",
                background: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                width: "100%",
                marginTop: "20px",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ======== LEAVE FEEDBACK MODAL ========= */}
      {showLeaveFeedbackModal && feedbackClub && (
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
            zIndex: 1001,
          }}
          onClick={() => {
            setShowLeaveFeedbackModal(false);
            setFeedbackForm({ rating: 5, comment: '' });
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "500px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Leave Feedback for {feedbackClub.name}</h2>
            <form onSubmit={handleLeaveFeedback}>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  <strong>Rating:</strong>
                </label>
                <select
                  value={feedbackForm.rating}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: parseInt(e.target.value) })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Poor)</option>
                  <option value={1}>⭐ (1 - Very Poor)</option>
                </select>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", marginBottom: "5px" }}>
                  <strong>Comment:</strong>
                </label>
                <textarea
                  value={feedbackForm.comment}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, comment: e.target.value })}
                  placeholder="Share your experience with this club..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    minHeight: "100px",
                  }}
                  required
                />
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    background: "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Submit Feedback
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowLeaveFeedbackModal(false);
                    setFeedbackForm({ rating: 5, comment: '' });
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 20px",
                    background: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
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