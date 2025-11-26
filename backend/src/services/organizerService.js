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
        cl.zip_code,
        cl.latitude,
        cl.longitude
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
    const { name, address, city, state, zip_code, type, description, meetup_times, image_url } = clubData;

    // Validate required fields
    if (!name || !address || !city || !state || !zip_code || !type || !description) {
      return reject({ status: 400, message: 'Missing required fields' });
    }

    // Start transaction
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');

      // Insert into ClubsBasic
        const insertClubQuery = `
        INSERT INTO ClubsBasic (name, description, club_type, image_url, meetup_times, member_count)
        VALUES (?, ?, ?, ?, ?, 1)
        `;

      db.run(
        insertClubQuery,
        [name, description, type, image_url, meetup_times || null],
        function (err) {
          if (err) {
            db.run('ROLLBACK');
            console.error('DB error inserting club:', err);
            return reject({ status: 500, message: 'DB error creating club', err });
          }

          const clubId = this.lastID;

          // Insert into ClubLocation
          const insertLocationQuery = `
            INSERT INTO ClubLocation (club_ref, address, city, state, zip_code, latitude, longitude)
            VALUES (?, ?, ?, ?, ?, NULL, NULL)
          `;

          db.run(
            insertLocationQuery,
            [clubId, address, city, state, zip_code],
            function (err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('DB error inserting location:', err);
                return reject({ status: 500, message: 'DB error creating club location', err });
              }

              // Insert into ClubOwnership
              const insertOwnershipQuery = `
                INSERT INTO ClubOwnership (user_ref, club_ref, created_at)
                VALUES (?, ?, datetime('now'))
              `;

              db.run(
                insertOwnershipQuery,
                [userId, clubId],
                function (err) {
                  if (err) {
                    db.run('ROLLBACK');
                    console.error('DB error inserting ownership:', err);
                    return reject({ status: 500, message: 'DB error assigning ownership', err });
                  }

                  // Insert creator as first member
                  const insertMemberQuery = `
                    INSERT INTO ClubMembership (user_ref, club_ref, joined_at)
                    VALUES (?, ?, datetime('now'))
                  `;

                  db.run(
                    insertMemberQuery,
                    [userId, clubId],
                    function (err) {
                      if (err) {
                        db.run('ROLLBACK');
                        console.error('DB error inserting membership:', err);
                        return reject({ status: 500, message: 'DB error adding creator as member', err });
                      }

                      // Commit transaction
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
                    }
                  );
                }
              );
            }
          );
        }
      );
    });
  });
};

/**
 * Update an existing club
 */
exports.updateClub = (userId, clubId, clubData) => {
  return new Promise((resolve, reject) => {
    const { name, address, city, state, zip_code, type, description, meetup_times, image_url } = clubData;

    // Validate required fields
    if (!name || !address || !city || !state || !zip_code || !type || !description) {
      return reject({ status: 400, message: 'Missing required fields' });
    }

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

        // Start transaction
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');

          // Build update query for ClubsBasic
          let updateClubQuery = `
            UPDATE ClubsBasic
            SET name = ?, description = ?, club_type = ?, meetup_times = ?
          `;
          let clubParams = [name, description, type, meetup_times || null];

          // Only update image if a new one was uploaded
          if (image_url) {
            updateClubQuery += ', image_url = ?';
            clubParams.push(image_url);
          }

          updateClubQuery += ' WHERE club_id = ?';
          clubParams.push(clubId);

          db.run(updateClubQuery, clubParams, function (err) {
            if (err) {
              db.run('ROLLBACK');
              console.error('DB error updating club:', err);
              return reject({ status: 500, message: 'DB error updating club', err });
            }

            // Update ClubLocation
            const updateLocationQuery = `
              UPDATE ClubLocation
              SET address = ?, city = ?, state = ?, zip_code = ?
              WHERE club_ref = ?
            `;

            db.run(
              updateLocationQuery,
              [address, city, state, zip_code, clubId],
              function (err) {
                if (err) {
                  db.run('ROLLBACK');
                  console.error('DB error updating location:', err);
                  return reject({ status: 500, message: 'DB error updating club location', err });
                }

                // Commit transaction
                db.run('COMMIT', (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    return reject({ status: 500, message: 'DB error committing transaction', err });
                  }

                  // Fetch updated club data
                  db.get(
                    `
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
                      cl.zip_code
                    FROM ClubsBasic cb
                    LEFT JOIN ClubLocation cl ON cb.club_id = cl.club_ref
                    WHERE cb.club_id = ?
                    `,
                    [clubId],
                    (err, club) => {
                      if (err) {
                        return reject({ status: 500, message: 'DB error fetching updated club', err });
                      }
                      resolve(club);
                    }
                  );
                });
              }
            );
          });
        });
      }
    );
  });
};