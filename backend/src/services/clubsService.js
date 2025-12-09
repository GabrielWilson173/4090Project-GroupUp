const db = require("../models/db");

/**
 * Fetch clubs with optional filters (search + type)
 * Includes organizer_id from ClubOwnership
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
        cl.longitude,
        co.user_ref AS organizer_id
      FROM ClubsBasic cb
      LEFT JOIN ClubLocation cl ON cb.club_id = cl.club_ref
      LEFT JOIN ClubOwnership co ON cb.club_id = co.club_ref
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
 * Check if a user is the organizer of a club
 */
exports.isOrganizer = (clubId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 1 FROM ClubOwnership WHERE club_ref = ? AND user_ref = ?
    `;
    db.get(query, [clubId, userId], (err, row) => {
      if (err) return reject(err);
      resolve(!!row); // true if organizer, false otherwise
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

      // Increment member_count only if a new row was inserted
      if (this.changes > 0) {
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
      } else {
        // Already a member, just return current count
        db.get(
          "SELECT member_count FROM ClubsBasic WHERE club_id = ?",
          [clubId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      }
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

      if (this.changes > 0) {
        // Decrement member_count only if a row was deleted
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
      } else {
        // Not a member, just return current count
        db.get(
          "SELECT member_count FROM ClubsBasic WHERE club_id = ?",
          [clubId],
          (err, row) => {
            if (err) return reject(err);
            resolve(row);
          }
        );
      }
    });
  });
};

/**
 * Check if a user is a member of a club
 */
exports.isMember = (clubId, userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 1 FROM ClubMembership 
      WHERE club_ref = ? AND user_ref = ?
    `;
    db.get(query, [clubId, userId], (err, row) => {
      if (err) return reject(err);
      resolve(!!row); // true if user is a member
    });
  });
};

exports.getClubFeedback = (clubId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        f.feedback_id AS id,
        f.rating,
        f.comment,
        f.submitted_at,
        u.name AS user_name
      FROM Feedback f
      JOIN UserAccounts u ON f.user_ref = u.user_id
      WHERE f.club_ref = ?
      ORDER BY f.submitted_at DESC
    `;

    db.all(query, [clubId], (err, rows) => {
      if (err) {
        console.error("DB error loading feedback:", err);
        return reject(err);
      }
      resolve(rows || []);
    });
  });
};


exports.submitFeedback = (clubId, userId, rating, comment) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO Feedback (club_ref, user_ref, rating, comment)
      VALUES (?, ?, ?, ?)
    `;

    db.run(query, [clubId, userId, rating, comment], function (err) {
      if (err) {
        console.error("DB error saving feedback:", err);
        return reject(err);
      }
      resolve({ success: true });
    });
  });
};
