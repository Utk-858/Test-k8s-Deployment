CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed data for testing
INSERT INTO notes (content) VALUES ('Welcome to the Node.js + PostgreSQL sandbox application!');
