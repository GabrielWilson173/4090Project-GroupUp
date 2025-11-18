const clubsService = require("../services/clubsService");

exports.getAllClubs = async (req, res) => {
  try {
    const clubs = await clubsService.fetchAllClubs();
    res.json(clubs);
  } catch (error) {
    console.error("Failed to fetch clubs:", error);
    res.status(500).json({ error: "Failed to load clubs" });
  }
};
