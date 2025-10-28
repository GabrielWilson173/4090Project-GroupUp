PRAGMA foreign_keys = ON;

-- Drop existing tables if needed (development convenience)
DROP TABLE IF EXISTS Membership;
DROP TABLE IF EXISTS Clubs;
DROP TABLE IF EXISTS Users;

-- Users table (registration + secure login)
CREATE TABLE Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clubs table (supports nearby browsing + keyword search)
CREATE TABLE Clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    latitude REAL,
    longitude REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Membership table (users joining clubs)
CREATE TABLE Membership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (club_id) REFERENCES Clubs(id) ON DELETE CASCADE
);

-- Optional index optimization
CREATE INDEX idx_clubs_name ON Clubs(name);
CREATE INDEX idx_clubs_location ON Clubs(latitude, longitude);
CREATE INDEX idx_membership_user ON Membership(user_id);
CREATE INDEX idx_membership_club ON Membership(club_id);

-- Seed sample clubs with real coordinates (for browsing tests)
INSERT INTO Clubs (name, description, latitude, longitude)
VALUES
    ('Bike Explorers', 'Community bike rides', 38.6270, -90.1994),
    ('Yoga in the Park', 'Outdoor yoga sessions', 38.6400, -90.2840),
    ('Chess Masters', 'Weekly competitive chess', 38.6300, -90.2000);
