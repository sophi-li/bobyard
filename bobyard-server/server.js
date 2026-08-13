import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { randomBytes } from 'crypto';
import Database from 'better-sqlite3';
import { commentsThreaded } from './comments_threaded.js';
import { hashPassword, verifyPassword } from './password.js';

const comments = commentsThreaded.comments;
const app = express();

// Vite's dev port isn't always stable across runs (5173 falls back to 5174,
// etc. if already in use), so allow either rather than hardcoding one.
const ALLOWED_ORIGINS = ['http://localhost:5173', 'http://localhost:5174'];
app.use(
  cors({
    origin: ALLOWED_ORIGINS,
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

const SESSION_COOKIE = 'session_id';
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const db = new Database('bobyard.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent INTEGER,
    author TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT NOT NULL,
    likes INTEGER DEFAULT 0,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL,
    expires_at TEXT NOT NULL
  );
`);

// Only seed if table tis empty
const rowCount = db
  .prepare('SELECT COUNT(*) as count FROM comments')
  .get().count;
if (rowCount === 0) {
  const insert = db.prepare(
    'INSERT INTO comments (id, parent, author, text, date, likes, image) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );
  const seedTransaction = db.transaction((comments) => {
    for (const comment of comments) {
      insert.run(
        comment.id,
        comment.parent,
        comment.author,
        comment.text,
        comment.date,
        comment.likes,
        comment.image
      );
    }
  });

  seedTransaction(comments);
  console.log('Database pre-seeded with initial data.');
}

function createSession(res, userId) {
  const token = randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  db.prepare(
    'INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'
  ).run(token, userId, now.toISOString(), expiresAt.toISOString());

  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false, // dev only (plain http); must be true behind https in prod
    path: '/',
    maxAge: SESSION_TTL_MS
  });
}

function requireAuth(req, res, next) {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) return res.status(401).json({ error: 'not authenticated' });

  const session = db
    .prepare('SELECT * FROM sessions WHERE id = ? AND expires_at > ?')
    .get(token, new Date().toISOString());
  if (!session) return res.status(401).json({ error: 'not authenticated' });

  const user = db
    .prepare('SELECT id, username FROM users WHERE id = ?')
    .get(session.user_id);
  if (!user) return res.status(401).json({ error: 'not authenticated' });

  req.user = user;
  next();
}

// create an account
app.post('/auth/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!/^[a-zA-Z0-9_-]{3,32}$/.test(username || '')) {
    return res.status(400).json({
      error: 'username must be 3-32 characters (letters, numbers, _ or -)'
    });
  }
  if (!password || password.length < 8) {
    return res
      .status(400)
      .json({ error: 'password must be at least 8 characters' });
  }

  const passwordHash = await hashPassword(password);
  try {
    const info = db
      .prepare(
        'INSERT INTO users (username, password_hash, created_at) VALUES (?, ?, ?)'
      )
      .run(username, passwordHash, new Date().toISOString());
    createSession(res, info.lastInsertRowid);
    res.status(201).json({ username });
  } catch (e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'username already taken' });
    }
    throw e;
  }
});

// log in
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const user = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username || '');

  // Same vague message either way so we don't leak which usernames exist.
  const invalid = () =>
    res.status(401).json({ error: 'invalid username or password' });

  if (!user) return invalid();
  const isValid = await verifyPassword(password || '', user.password_hash);
  if (!isValid) return invalid();

  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(
    new Date().toISOString()
  );
  createSession(res, user.id);
  res.status(200).json({ username: user.username });
});

// log out
app.post('/auth/logout', (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE];
  if (token) db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.status(200).json({ ok: true });
});

// who am i
app.get('/auth/me', requireAuth, (req, res) => {
  res.status(200).json({ username: req.user.username });
});

// get all comments
app.get('/comments', (req, res) => {
  const items = db.prepare('SELECT * FROM comments').all();
  res.json(items);
});

// add a comment
app.post('/comments', requireAuth, (req, res) => {
  const { text, parent } = req.body;
  const author = req.user.username;
  if (!text) return res.status(400).json({ error: 'text is required' });

  // Empty string means top-level; anything else must reference a real
  // comment, or it silently vanishes from the tree orderComments builds.
  if (parent !== '') {
    if (!/^\d+$/.test(String(parent))) {
      return res.status(400).json({ error: 'parent must be numeric or empty' });
    }
    const parentExists = db
      .prepare('SELECT 1 FROM comments WHERE id = ?')
      .get(parent);
    if (!parentExists) {
      return res.status(400).json({ error: 'parent comment not found' });
    }
  }

  const stmt = db.prepare(
    'INSERT INTO comments (parent, author, text, date, likes, image) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(parent, author, text, new Date().toISOString(), 0, '');

  const newComment = db
    .prepare('SELECT * FROM comments WHERE id = ?')
    .get(info.lastInsertRowid);
  res.status(201).json(newComment);
});

// update comment likes
app.patch('/comments/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  // Route params are always strings, even for garbage input, so this is the
  // real numeric check (not just a truthiness check on `id`).
  if (!/^\d+$/.test(id)) {
    return res.status(400).json({ error: 'id must be numeric' });
  }

  const { likes } = req.body;
  if (!Number.isInteger(likes) || likes < 0) {
    return res
      .status(400)
      .json({ error: 'likes must be a non-negative integer' });
  }

  const stmt = db.prepare('UPDATE comments SET likes = ? WHERE id = ?');
  const info = stmt.run(likes, id);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  res.status(200).json(newComment);
});

app.listen(3001, () => console.log('API running on http://localhost:3001'));
