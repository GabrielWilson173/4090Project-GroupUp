const clubsService = require("../services/clubsService");

// Get all clubs (no auth required)
exports.getAllClubs = async (req, res) => {
  try {
    const search = req.query.search || null;
    const type = req.query.type || null;

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
    const userId = req.user.userId; // <-- use middleware user 
    const result = await clubsService.joinClub(clubId, userId);
    res.json({ success: true, member_count: result.member_count });
  } catch (error) {
    console.error("Failed to join club:", error);
    res.status(500).json({ error: "Failed to join club" });
  }
};

// Existing leaveClub
exports.leaveClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.userId; // <-- use middleware user
    const result = await clubsService.leaveClub(clubId, userId);
    res.json({ success: true, member_count: result.member_count });
  } catch (error) {
    console.error("Failed to leave club:", error);
    res.status(500).json({ error: "Failed to leave club" });
  }
};
