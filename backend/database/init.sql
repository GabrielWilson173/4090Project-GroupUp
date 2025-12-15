PRAGMA foreign_keys = ON;

-- Development cleanup
DROP TABLE IF EXISTS UserAccounts;
DROP TABLE IF EXISTS UserProfiles;
DROP TABLE IF EXISTS UserPrivacySettings;
DROP TABLE IF EXISTS ClubsBasic;
DROP TABLE IF EXISTS ClubKeywords;
DROP TABLE IF EXISTS ClubLocation;
DROP TABLE IF EXISTS ClubOwnership;
DROP TABLE IF EXISTS ClubMembership;
DROP TABLE IF EXISTS ClubEvents;
DROP TABLE IF EXISTS EventNotifications;
DROP TABLE IF EXISTS Feedback;
DROP TABLE IF EXISTS BikeRoutes;

----------------------------------------------------------
-- USERS
----------------------------------------------------------

CREATE TABLE UserAccounts (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserProfiles (
    user_ref INTEGER,             
    name TEXT,
    age INTEGER,
    accessibility_pref TEXT,      
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE UserPrivacySettings (
    user_ref INTEGER,
    show_email INTEGER DEFAULT 0,
    show_name INTEGER DEFAULT 1,
    share_activity INTEGER DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------------
-- CLUBS
----------------------------------------------------------

CREATE TABLE ClubsBasic (
    club_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    club_type TEXT,
    image_url TEXT,
    meetup_times TEXT,
    member_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ClubKeywords (
    club_ref INTEGER,
    keyword TEXT
);

CREATE TABLE ClubLocation (
    club_ref INTEGER,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    latitude REAL,
    longitude REAL
);

CREATE TABLE ClubOwnership (
    club_ref INTEGER,
    user_ref INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------------
-- MEMBERSHIP & EVENTS
----------------------------------------------------------

CREATE TABLE ClubMembership (
    membership_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ref INTEGER NOT NULL,
    club_ref INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_ref) REFERENCES UserAccounts(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_club FOREIGN KEY (club_ref) REFERENCES ClubsBasic(club_id) ON DELETE CASCADE,
    CONSTRAINT unique_membership UNIQUE (user_ref, club_ref)
);

CREATE TABLE ClubEvents (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    club_ref INTEGER,
    title TEXT,
    description TEXT,
    event_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE EventNotifications (
    notif_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ref INTEGER,
    event_ref INTEGER,
    message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------------
-- FEEDBACK
----------------------------------------------------------

CREATE TABLE Feedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
    club_ref INTEGER NOT NULL,
    user_ref INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_club 
        FOREIGN KEY (club_ref) REFERENCES ClubsBasic(club_id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_user 
        FOREIGN KEY (user_ref) REFERENCES UserAccounts(user_id) ON DELETE CASCADE
);

----------------------------------------------------------
-- BIKE ROUTES
----------------------------------------------------------

CREATE TABLE BikeRoutes (
    route_id INTEGER PRIMARY KEY AUTOINCREMENT,
    route_name TEXT,
    start_lat REAL,
    start_long REAL,
    end_lat REAL,
    end_long REAL,
    safety_rating INTEGER,
    notes TEXT
);

----------------------------------------------------------
-- INDEXES
----------------------------------------------------------

CREATE INDEX idx_club_name ON ClubsBasic(name);
CREATE INDEX idx_keywords ON ClubKeywords(keyword);
CREATE INDEX idx_club_location ON ClubLocation(city, state);
CREATE INDEX idx_user_email ON UserAccounts(email);
CREATE INDEX idx_event_date ON ClubEvents(event_date);
CREATE INDEX idx_feedback_club ON Feedback(club_ref);

----------------------------------------------------------
-- SEED DATA
----------------------------------------------------------

INSERT INTO ClubsBasic (name, description, club_type, image_url, meetup_times, member_count) VALUES
    ('Bike Explorers', 'Community bike rides', 'Biking', 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400', 'Saturdays 9am-12pm, Sundays 7am-10am', 23),
    ('Yoga in the Park', 'Outdoor yoga sessions', 'Wellness', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'Tuesdays 6pm-7pm, Thursdays 6pm-7pm', 18),
    ('Chess Masters', 'Weekly competitive chess', 'Games', 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?w=400', 'Wednesdays 7pm-9pm', 12),
    ('Trail Runners', 'Local trail running and fitness group', 'Walking', 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400', 'Mondays 6am-7am, Wednesdays 6am-7am, Fridays 6am-7am', 27),
    ('Photography Collective', 'Learn and practice photography together', 'Arts', 'https://images.unsplash.com/photo-1486916856992-e4db22c8df33?w=400', 'Sundays 2pm-5pm', 15),
    ('Board Game Society', 'Play strategy and social board games', 'Games', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400', 'Fridays 7pm-10pm', 21),
    ('Meditation Hour', 'Guided meditation and mindfulness', 'Wellness', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', 'Daily 7am-8am', 9),
    ('Kayak Crew', 'Group kayaking outings on local rivers', 'Hobbies', 'https://plus.unsplash.com/premium_photo-1661893427047-16f6ddc173f6?w=400', 'Saturdays 10am-2pm', 14),
    ('Garden Club', 'Community gardening and plant swaps', 'Hobbies', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 'Sundays 9am-12pm', 19),
    ('Salsa Dance Club', 'Beginner-friendly salsa dance nights', 'Arts', 'https://images.unsplash.com/photo-1531747056595-07f6cbbe10ad?w=400', 'Thursdays 8pm-10pm', 25),
    ('Saturday Soccer', 'Laid-back soccer games every Sunday', 'Sports', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400', 'Sundays 4pm-6pm', 30);

INSERT INTO ClubLocation (club_ref, address, city, state, zip_code, latitude, longitude) VALUES
    (1, '124 Mulberry Lane', 'St. Louis', 'MO', '63101', 38.6270, -90.1994),
    (2, '456 Oak Street', 'Clayton', 'MO', '63105', 38.6400, -90.2840),
    (3, '789 Pine Avenue', 'University City', 'MO', '63130', 38.6300, -90.2000),
    (4, '321 Maple Drive', 'Webster Groves', 'MO', '63119', 38.6110, -90.2500),
    (5, '654 Elm Court', 'Kirkwood', 'MO', '63122', 38.6501, -90.2201),
    (6, '987 Cedar Lane', 'Brentwood', 'MO', '63144', 38.6200, -90.2050),
    (7, '147 Birch Road', 'Maplewood', 'MO', '63143', 38.6320, -90.1950),
    (8, '258 Willow Way', 'Richmond Heights', 'MO', '63117', 38.6405, -90.1902),
    (9, '369 Spruce Street', 'Creve Coeur', 'MO', '63141', 38.6601, -90.1800),
    (10, '741 Ash Boulevard', 'Overland', 'MO', '63114', 38.6285, -90.2403),
    (11, '852 Cherry Circle', 'Florissant', 'MO', '63031', 38.6333, -90.2234);

INSERT INTO ClubKeywords (club_ref, keyword) VALUES
    (1, 'bike'), (1, 'outdoors'),
    (2, 'yoga'), (2, 'wellness'),
    (3, 'chess'), (3, 'strategy'),
    (4, 'running'), (4, 'fitness'),
    (5, 'photography'), (5, 'camera'),
    (6, 'games'), (6, 'strategy'),
    (7, 'meditation'), (7, 'mindfulness'),
    (8, 'kayak'), (8, 'water'),
    (9, 'gardening'), (9, 'plants'),
    (10, 'dance'), (10, 'salsa'),
    (11, 'soccer'), (11, 'sports');

INSERT INTO UserAccounts (name, email, password_hash) VALUES
('Frederick Jones', 'dummy@example.com', '$2a$10$u/mdSyxRbv.ba9oAsdBxbOwhRJZgGLS6FaqkbaaXBTswcoqUvxmky'),
('Alex Johnson', 'alex.johnson@example.com', '$2a$10$u/mdSyxRbv.ba9oAsdBxbOwhRJZgGLS6FaqkbaaXBTswcoqUvxmky'),
('Maria Lopez', 'maria.lopez@example.com', '$2a$10$u/mdSyxRbv.ba9oAsdBxbOwhRJZgGLS6FaqkbaaXBTswcoqUvxmky'),
('Ethan Carter', 'ethan.carter@example.com', '$2a$10$u/mdSyxRbv.ba9oAsdBxbOwhRJZgGLS6FaqkbaaXBTswcoqUvxmky'),
('Sophie Nguyen', 'sophie.nguyen@example.com', '$2a$10$u/mdSyxRbv.ba9oAsdBxbOwhRJZgGLS6FaqkbaaXBTswcoqUvxmky'),
('Liam Patel', 'liam.patel@example.com', '$2a$10$u/mdSyxRbv.ba9oAsdBxbOwhRJZgGLS6FaqkbaaXBTswcoqUvxmky');

INSERT INTO ClubOwnership (club_ref, user_ref) VALUES
    (1, 1), (2, 1), (3, 1), (4, 1), (5, 1), 
    (6, 1), (7, 1), (8, 1), (9, 1), (10, 1), (11, 1);

INSERT INTO ClubMembership (user_ref, club_ref) VALUES
    -- Original memberships for user 1
    (1, 1), (1, 2), (1, 3), (1, 4), (1, 5),
    (1, 6), (1, 7), (1, 8), (1, 9), (1, 10), (1, 11),

    -- User 2: Alex Johnson
    (2, 1), (2, 4), (2, 6),

    -- User 3: Maria Lopez
    (3, 2), (3, 5), (3, 7), (3, 9),

    -- User 4: Ethan Carter
    (4, 3), (4, 6), (4, 8), (4, 10),

    -- User 5: Sophie Nguyen
    (5, 1), (5, 2), (5, 11),

    -- User 6: Liam Patel
    (6, 4), (6, 7), (6, 9), (6, 11);

INSERT INTO Feedback (club_ref, user_ref, rating, comment) VALUES
    -- User 1 feedback (one review per club)
    (1, 1, 5, 'Great group with friendly riders and scenic routes.'),
    (2, 1, 5, 'Excellent instructor and relaxing sessions.'),
    (3, 1, 5, 'Competitive but supportive atmosphere.'),
    (4, 1, 4, 'Challenging morning runs and a good community.'),
    (5, 1, 5, 'Learned a lot about composition.'),
    (6, 1, 4, 'Large selection of games and friendly players.'),
    (7, 1, 5, 'Very calming and well-guided meditation sessions.'),
    (8, 1, 4, 'Well-organized kayaking trips with great views.'),
    (9, 1, 5, 'Everyone is knowledgeable about gardening.'),
    (10, 1, 5, 'Energetic club with friendly beginners.'),
    (11, 1, 4, 'Fun weekend soccer matches.'),

    -- User 2 (Alex Johnson)
    (1, 2, 4, 'Good ride routes and solid pacing.'),
    (4, 2, 5, 'Running group has excellent coaching.'),
    (6, 2, 5, 'Board game nights are always fun.'),

    -- User 3 (Maria Lopez)
    (2, 3, 5, 'Yoga sessions are peaceful and beginner friendly.'),
    (5, 3, 4, 'Photography workshops are helpful.'),
    (7, 3, 5, 'Meditation group helped me focus better.'),

    -- User 4 (Ethan Carter)
    (3, 4, 4, 'Cycling drills helped improve my endurance.'),
    (8, 4, 5, 'Kayaking trips are well coordinated.'),
    (10, 4, 4, 'Running sprints were intense but rewarding.'),

    -- User 5 (Sophie Nguyen)
    (1, 5, 5, 'Loved the cycling community.'),
    (2, 5, 4, 'Yoga classes have great energy.'),
    (11, 5, 5, 'Soccer games are the highlight of my week.'),

    -- User 6 (Liam Patel)
    (4, 6, 4, 'Great group for morning runs.'),
    (7, 6, 5, 'Meditation leaders are very welcoming.'),
    (11, 6, 4, 'Soccer community is supportive and fun.');


