const db = require('../models/db');

/**
 * Fetch all clubs owned by a specific user
 */
exports.fetchMyClubs = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        cb.club_id as id,
        cb.name,
        cb.description,
        cb.club_type as type,
        cb.image_url,
        cb.meetup_times,
        cb.member_count,
        cb.created_at,
        cl.address,
        cl.city,
        cl.state,
        cl.zip_code
      FROM ClubsBasic cb
      LEFT JOIN ClubLocation cl ON cb.club_id = cl.club_ref
      INNER JOIN ClubOwnership co ON cb.club_id = co.club_ref
      WHERE co.user_ref = ?
      ORDER BY cb.created_at DESC
    `;

    db.all(query, [userId], (err, rows) => {
      if (err) {
        console.error('DB error fetching my clubs:', err);
        return reject({ status: 500, message: 'DB error fetching clubs', err });
      }
      resolve(rows || []);
    });
  });
};

/**
 * Create a new club
 */
exports.createNewClub = (userId, clubData) => {
  return new Promise((resolve, reject) => {
    const {
      name,
      address,
      city,
      state,
      zip_code,
      type,
      latitude,
      longitude,
      description,
      meetup_times,
      image_url
    } = clubData;

    // Validate required fields (address only)
    if (!name || !address || !city || !state || !zip_code || !type || !description) {
      return reject({
        status: 400,
        message: 'Missing required fields'
      });
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      const insertClubQuery = `
        INSERT INTO ClubsBasic
          (name, description, club_type, image_url, meetup_times, member_count)
        VALUES (?, ?, ?, ?, ?, 1)
      `;

      db.run(
        insertClubQuery,
        [name, description, type, image_url, meetup_times || null],
        function (err) {
          if (err) {
            db.run('ROLLBACK');
            return reject({ status: 500, message: 'DB error creating club', err });
          }

          const clubId = this.lastID;

          const insertLocationQuery = `
            INSERT INTO ClubLocation
              (club_ref, address, city, state, zip_code, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `;

          db.run(
            insertLocationQuery,
            [clubId, address, city, state, zip_code, latitude || null, longitude || null],
            (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject({ status: 500, message: 'DB error creating club location', err });
              }

              const insertOwnershipQuery = `
                INSERT INTO ClubOwnership (user_ref, club_ref, created_at)
                VALUES (?, ?, datetime('now'))
              `;

              db.run(insertOwnershipQuery, [userId, clubId], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject({ status: 500, message: 'DB error assigning ownership', err });
                }

                const insertMemberQuery = `
                  INSERT INTO ClubMembership (user_ref, club_ref, joined_at)
                  VALUES (?, ?, datetime('now'))
                `;

                db.run(insertMemberQuery, [userId, clubId], (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject({ status: 500, message: 'DB error adding creator as member', err });
                  }

                  db.run('COMMIT', (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return reject({ status: 500, message: 'DB error committing transaction', err });
                    }

                    resolve({
                      id: clubId,
                      name,
                      description,
                      type,
                      image_url,
                      meetup_times,
                      member_count: 1,
                      address,
                      city,
                      state,
                      zip_code
                    });
                  });
                });
              });
            }
          );
        }
      );
    });
  });
};

exports.updateClub = (userId, clubId, clubData) => {
  return new Promise((resolve, reject) => {
    const {
      name,
      address,
      city,
      state,
      zip_code,
      type,
      description,
      meetup_times,
      image_url,
      latitude,
      longitude
    } = clubData;

    // Validate required fields
    if (!name || !address || !city || !state || !zip_code || !type || !description) {
      return reject({ status: 400, message: 'Missing required fields' });
    }

    // Verify ownership
    db.get(
      'SELECT 1 FROM ClubOwnership WHERE club_ref = ? AND user_ref = ?',
      [clubId, userId],
      (err, ownership) => {
        if (err) {
          return reject({ status: 500, message: 'DB error checking ownership', err });
        }
        if (!ownership) {
          return reject({ status: 403, message: 'You do not own this club' });
        }

        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // --- Update ClubsBasic ---
          let updateClubQuery = `
            UPDATE ClubsBasic
            SET name = ?, description = ?, club_type = ?
          `;
          const clubParams = [name, description, type];

          if (meetup_times && meetup_times.trim() !== '') {
            updateClubQuery += ', meetup_times = ?';
            clubParams.push(meetup_times);
          }

          if (image_url) {
            updateClubQuery += ', image_url = ?';
            clubParams.push(image_url);
          }

          updateClubQuery += ' WHERE club_id = ?';
          clubParams.push(clubId);

          db.run(updateClubQuery, clubParams, (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject({ status: 500, message: 'DB error updating club', err });
            }

            // --- Update ClubLocation (address + optional coordinates) ---
            let updateLocationQuery = `
              UPDATE ClubLocation
              SET address = ?, city = ?, state = ?, zip_code = ?
            `;
            const locationParams = [address, city, state, zip_code];

            if (latitude !== undefined && latitude !== null) {
              updateLocationQuery += ', latitude = ?';
              locationParams.push(latitude);
            }

            if (longitude !== undefined && longitude !== null) {
              updateLocationQuery += ', longitude = ?';
              locationParams.push(longitude);
            }

            updateLocationQuery += ' WHERE club_ref = ?';
            locationParams.push(clubId);

            db.run(updateLocationQuery, locationParams, (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject({ status: 500, message: 'DB error updating club location', err });
              }

              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject({ status: 500, message: 'DB error committing transaction', err });
                }

                // --- Fetch updated club ---
                db.get(
                  `
                  SELECT 
                    cb.club_id AS id,
                    cb.name,
                    cb.description,
                    cb.club_type AS type,
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
                  WHERE cb.club_id = ?
                  `,
                  [clubId],
                  (err, club) => {
                    if (err) {
                      return reject({
                        status: 500,
                        message: 'DB error fetching updated club',
                        err
                      });
                    }
                    resolve(club);
                  }
                );
              });
            });
          });
        });
      }
    );
  });
};


/**
 * Delete a club (only if user is owner)
 */
exports.deleteClub = (userId, clubId) => {
  return new Promise((resolve, reject) => {
    // First verify the user owns this club
    db.get(
      'SELECT * FROM ClubOwnership WHERE club_ref = ? AND user_ref = ?',
      [clubId, userId],
      (err, ownership) => {
        if (err) {
          return reject({ status: 500, message: 'DB error checking ownership', err });
        }
        if (!ownership) {
          return reject({ status: 403, message: 'You do not own this club' });
        }

        // Start transaction to delete all related records
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // Delete from ClubMembership
          db.run('DELETE FROM ClubMembership WHERE club_ref = ?', [clubId], (err) => {
            if (err) {
              db.run('ROLLBACK');
              return reject({ status: 500, message: 'DB error deleting memberships', err });
            }

            // Delete from ClubOwnership
            db.run('DELETE FROM ClubOwnership WHERE club_ref = ?', [clubId], (err) => {
              if (err) {
                db.run('ROLLBACK');
                return reject({ status: 500, message: 'DB error deleting ownership', err });
              }

              // Delete from ClubLocation
              db.run('DELETE FROM ClubLocation WHERE club_ref = ?', [clubId], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  return reject({ status: 500, message: 'DB error deleting location', err });
                }

                // Delete from ClubKeywords
                db.run('DELETE FROM ClubKeywords WHERE club_ref = ?', [clubId], (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject({ status: 500, message: 'DB error deleting keywords', err });
                  }

                  // Finally delete from ClubsBasic
                  db.run('DELETE FROM ClubsBasic WHERE club_id = ?', [clubId], (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      return reject({ status: 500, message: 'DB error deleting club', err });
                    }

                    // Commit transaction
                    db.run('COMMIT', (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        return reject({ status: 500, message: 'DB error committing transaction', err });
                      }
                      resolve({ success: true });
                    });
                  });
                });
              });
            });
          });
        });
      }
    );
  });
};

/**
 * Fetch all members of a club (only if user is owner)
 */
exports.fetchClubMembers = (userId, clubId) => {
  return new Promise((resolve, reject) => {
    // First verify the user owns this club
    db.get(
      'SELECT * FROM ClubOwnership WHERE club_ref = ? AND user_ref = ?',
      [clubId, userId],
      (err, ownership) => {
        if (err) {
          return reject({ status: 500, message: 'DB error checking ownership', err });
        }
        if (!ownership) {
          return reject({ status: 403, message: 'You do not own this club' });
        }

        // Fetch all members
        const query = `
          SELECT 
            ua.user_id,
            ua.name,
            ua.email,
            cm.joined_at
          FROM ClubMembership cm
          INNER JOIN UserAccounts ua ON cm.user_ref = ua.user_id
          WHERE cm.club_ref = ?
          ORDER BY cm.joined_at ASC
        `;

        db.all(query, [clubId], (err, rows) => {
          if (err) {
            console.error('DB error fetching club members:', err);
            return reject({ status: 500, message: 'DB error fetching members', err });
          }
          resolve(rows || []);
        });
      }
    );
  });
};