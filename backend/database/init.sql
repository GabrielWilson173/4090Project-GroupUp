PRAGMA foreign_keys = OFF; 

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
    owner_user_ref INTEGER,
    ownership_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------------
-- MEMBERSHIP & EVENTS
----------------------------------------------------------

CREATE TABLE ClubMembership (
    membership_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ref INTEGER,
    club_ref INTEGER,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    club_ref INTEGER,
    user_ref INTEGER,
    rating INTEGER,
    comment TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
    ('Photography Collective', 'Learn and practice photography together', 'Arts', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400', 'Sundays 2pm-5pm', 15),
    ('Board Game Society', 'Play strategy and social board games', 'Games', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?w=400', 'Fridays 7pm-10pm', 21),
    ('Meditation Hour', 'Guided meditation and mindfulness', 'Wellness', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', 'Daily 7am-8am', 9),
    ('Kayak Crew', 'Group kayaking outings on local rivers', 'Hobbies', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400', 'Saturdays 10am-2pm', 14),
    ('Garden Club', 'Community gardening and plant swaps', 'Hobbies', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400', 'Sundays 9am-12pm', 19),
    ('Salsa Dance Club', 'Beginner-friendly salsa dance nights', 'Arts', 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=400', 'Thursdays 8pm-10pm', 25),
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