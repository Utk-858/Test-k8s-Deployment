const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Read DB config from env strictly
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432', 10),
});

// GET /healthz
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// GET /readyz
app.get('/readyz', async (req, res) => {
  try {
    // Check if we can query the database
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'READY', database: 'CONNECTED' });
  } catch (err) {
    console.error('Readiness check failed:', err);
    res.status(500).json({ status: 'NOT_READY', error: err.message });
  }
});

// GET /api/notes
app.get('/api/notes', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, content, created_at FROM notes ORDER BY created_at DESC');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching notes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/notes
app.post('/api/notes', async (req, res) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(400).json({ error: 'Content must be a non-empty string' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO notes (content) VALUES ($1) RETURNING id, content, created_at',
      [content.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error inserting note:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Server startup
const server = app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed.');
  });

  // End pg Pool
  try {
    await pool.end();
    console.log('Database connection pool drained.');
    process.exit(0);
  } catch (err) {
    console.error('Error draining database connection pool:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
