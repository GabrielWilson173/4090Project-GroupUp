-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
);

-- Create Clubs table
CREATE TABLE IF NOT EXISTS Clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    location TEXT
);

-- Create Membership table (relationship between Users & Clubs)
CREATE TABLE IF NOT EXISTS Membership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    club_id INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id),
    FOREIGN KEY (club_id) REFERENCES Clubs(id)
);

-- Seed minimal test users
INSERT INTO Users (name, email, password) VALUES
    ('Test User', 'test@example.com', 'password123'),
    ('Organizer', 'organizer@example.com', 'password456');

-- Seed a sample club
INSERT INTO Clubs (name, description, location) VALUES
    ('Bike Explorers', 'A club for community bike rides', 'Downtown');

-- Add organizer as a member of the club
INSERT INTO Membership (user_id, club_id) VALUES
    (2, 1);
