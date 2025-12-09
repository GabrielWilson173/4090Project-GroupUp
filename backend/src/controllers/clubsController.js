const clubsService = require("../services/clubsService");

// Get all clubs (no auth required)
exports.getAllClubs = async (req, res) => {
  try {
    const search = req.query.search || null;
    const type = req.query.type || null;

    // Fetch clubs with organizer_id included
    const clubs = await clubsService.fetchAllClubs(search, type);

    res.json(clubs);
  } catch (error) {
    console.error("Failed to fetch clubs:", error);
    res.status(500).json({ error: "Failed to load clubs" });
  }
};

// Join a club (protected route)
exports.joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId; // <-- from auth middleware

    // Check if user is the organizer of this club
    const isOrganizer = await clubsService.isOrganizer(clubId, userId);
    if (isOrganizer) {
      return res
        .status(400)
        .json({ error: "Organizers are already members of their own club." });
    }

    const result = await clubsService.joinClub(clubId, userId);
    res.json({ success: true, member_count: result.member_count });
  } catch (error) {
    console.error("Failed to join club:", error);
    res.status(500).json({ error: "Failed to join club" });
  }
};

// Leave a club (protected route)
exports.leaveClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;

    // Optional: prevent organizers from leaving their own club
    const isOrganizer = await clubsService.isOrganizer(clubId, userId);
    if (isOrganizer) {
      return res
        .status(400)
        .json({ error: "Organizers cannot leave their own club." });
    }

    const result = await clubsService.leaveClub(clubId, userId);
    res.json({ success: true, member_count: result.member_count });
  } catch (error) {
    console.error("Failed to leave club:", error);
    res.status(500).json({ error: "Failed to leave club" });
  }
};

// =============================
// Get feedback for a club
// =============================
exports.getClubFeedback = async (req, res) => {
  try {
    const { clubId } = req.params;

    const feedback = await clubsService.getClubFeedback(clubId);

    res.json({ success: true, feedback });
  } catch (error) {
    console.error("Failed to fetch feedback:", error);
    res.status(500).json({ error: "Failed to load club feedback" });
  }
};


// =============================
// Submit feedback for a club
// =============================
exports.submitFeedback = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId;
    const { rating, comment } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }
    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment cannot be empty" });
    }

    // Ensure user is a member before leaving feedback
    const isMember = await clubsService.isMember(clubId, userId);
    if (!isMember) {
      return res.status(403).json({
        error: "Only club members can leave feedback"
      });
    }

    await clubsService.submitFeedback(clubId, userId, rating, comment);

    res.json({ success: true });
  } catch (error) {
    console.error("Failed to submit feedback:", error);
    res.status(500).json({ error: "Failed to submit feedback" });
  }
};
