const db = require("../models/db");

/**
 * Fetch clubs with optional filters (search + type)
 */
exports.fetchAllClubs = (search = null, type = null) => {
  return new Promise((resolve, reject) => {
    let baseQuery = `
      SELECT 
        cb.club_id as id,
        cb.name,
        cb.description,
        cb.club_type as type,
        cb.image_url,
        cb.meetup_times,
        cb.member_count,
        cl.address,
        cl.city,
        cl.state,
        cl.zip_code,
        cl.latitude,
        cl.longitude
      FROM ClubsBasic cb
      LEFT JOIN ClubLocation cl ON cb.club_id = cl.club_ref
    `;
    
    let conditions = [];
    let params = [];

    if (search) {
      conditions.push("(cb.name LIKE ? OR cb.description LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    if (type) {
      conditions.push("cb.club_type = ?");
      params.push(type);
    }

    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }

    db.all(baseQuery, params, (err, rows) => {
      if (err) {
        console.error("DB error fetching filtered clubs:", err);
        return reject(err);
      }
      
      resolve(rows || []);
    });
  });
};

/**
 * Join a club
 */
exports.joinClub = (clubId, userId) => {
  return new Promise((resolve, reject) => {
    const insertQuery = `
      INSERT OR IGNORE INTO ClubMembership (user_ref, club_ref) VALUES (?, ?)
    `;
    db.run(insertQuery, [userId, clubId], function(err) {
      if (err) return reject(err);

      // Increment member_count
      const updateQuery = `
        UPDATE ClubsBasic
        SET member_count = member_count + 1
        WHERE club_id = ?
      `;
      db.run(updateQuery, [clubId], function(err) {
        if (err) return reject(err);

        db.get(
          "SELECT member_count FROM ClubsBasic WHERE club_id = ?",
          [clubId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      });
    });
  });
};

/**
 * Leave a club
 */
exports.leaveClub = (clubId, userId) => {
  return new Promise((resolve, reject) => {
    const deleteQuery = `
      DELETE FROM ClubMembership WHERE user_ref = ? AND club_ref = ?
    `;
    db.run(deleteQuery, [userId, clubId], function(err) {
      if (err) return reject(err);

      // Decrement member_count
      const updateQuery = `
        UPDATE ClubsBasic
        SET member_count = member_count - 1
        WHERE club_id = ?
      `;
      db.run(updateQuery, [clubId], function(err) {
        if (err) return reject(err);

        db.get(
          "SELECT member_count FROM ClubsBasic WHERE club_id = ?",
          [clubId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      });
    });
  });
};
