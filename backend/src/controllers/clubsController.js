const clubsService = require("../services/clubsService");

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

exports.joinClub = async (req, res) => {
  try {
    const { clubId } = req.params;
    const result = await clubsService.joinClub(clubId);
    res.json({ success: true, member_count: result.member_count });
  } catch (error) {
    console.error("Failed to join club:", error);
    res.status(500).json({ error: "Failed to join club" });
  }
};