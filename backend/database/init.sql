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
-- USERS: Split into account, profile, and privacy data
----------------------------------------------------------

-- User login and registration (High cohesion allowed)
CREATE TABLE UserAccounts (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User display details
CREATE TABLE UserProfiles (
    user_ref INTEGER,             
    name TEXT,
    age INTEGER,
    accessibility_pref TEXT,      
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Privacy and visibility controls 
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

-- Core club details
CREATE TABLE ClubsBasic (
    club_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Club keywords for searching 
CREATE TABLE ClubKeywords (
    club_ref INTEGER,
    keyword TEXT
);

-- Physical/geographic data isolated for browsing
CREATE TABLE ClubLocation (
    club_ref INTEGER,
    latitude REAL,
    longitude REAL
);

-- Club owner (organizer) relation
CREATE TABLE ClubOwnership (
    club_ref INTEGER,
    owner_user_ref INTEGER,
    ownership_created DATETIME DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------------
-- MEMBERSHIP and EVENTS
----------------------------------------------------------

-- Membership 
CREATE TABLE ClubMembership (
    membership_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ref INTEGER,
    club_ref INTEGER,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Club events 
CREATE TABLE ClubEvents (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    club_ref INTEGER,
    title TEXT,
    description TEXT,
    event_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications related to events
CREATE TABLE EventNotifications (
    notif_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_ref INTEGER,
    event_ref INTEGER,
    message TEXT,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

----------------------------------------------------------
-- USER FEEDBACK
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
-- Suggested Bike Routes
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
-- INDEX OPTIMIZATION
----------------------------------------------------------

CREATE INDEX idx_club_name ON ClubsBasic(name);
CREATE INDEX idx_keywords ON ClubKeywords(keyword);
CREATE INDEX idx_club_location ON ClubLocation(latitude, longitude);
CREATE INDEX idx_user_email ON UserAccounts(email);
CREATE INDEX idx_event_date ON ClubEvents(event_date);
CREATE INDEX idx_feedback_club ON Feedback(club_ref);

----------------------------------------------------------
-- SEED DATA EXAMPLES
----------------------------------------------------------

INSERT INTO ClubsBasic (name, description) VALUES
    ('Bike Explorers', 'Community bike rides'),
    ('Yoga in the Park', 'Outdoor yoga sessions'),
    ('Chess Masters', 'Weekly competitive chess');

INSERT INTO ClubLocation (club_ref, latitude, longitude) VALUES
    (1, 38.6270, -90.1994),
    (2, 38.6400, -90.2840),
    (3, 38.6300, -90.2000);

INSERT INTO ClubKeywords (club_ref, keyword) VALUES
    (1, 'bike'), (1, 'outdoors'),
    (2, 'yoga'), (2, 'wellness'),
    (3, 'chess'), (3, 'strategy');
