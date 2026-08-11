import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import { commentsThreaded } from './comments_threaded.js';

const comments = commentsThreaded.comments;
const app = express();

app.use(cors());
app.use(express.json());

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
  )
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

// get all comments
app.get('/comments', (req, res) => {
  const items = db.prepare('SELECT * FROM comments').all();
  res.json(items);
});

// add a comment
app.post('/comments', (req, res) => {
  const { text, author, parent } = req.body;
  if (!text) return res.status(400).json({ error: 'text is required' });
  if (!author) return res.status(400).json({ error: 'author is required' });

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
app.patch('/comments/:id', (req, res) => {
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
