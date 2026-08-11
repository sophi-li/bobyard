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

  const stmt = db.prepare(
    'INSERT INTO comments (parent, author, text, date, likes, image) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const info = stmt.run(parent, author, text, new Date().toISOString(), 0, '');

  const newComment = db
    .prepare('SELECT * FROM comments WHERE id = ?')
    .get(info.lastInsertRowid);
  res.status(201).json(newComment);
});

// like comment
app.patch('/comments/:id', (req, res) => {
  const { id } = req.params;
  if (!id) return res.status(400).json({ error: 'id is required' });

  const stmt = db.prepare('UPDATE comments SET likes = likes + 1 WHERE id = ?');
  const info = stmt.run(id);

  if (info.changes === 0) {
    return res.status(404).json({ error: 'Comment not found' });
  }

  const newComment = db.prepare('SELECT * FROM comments WHERE id = ?').get(id);
  res.status(200).json(newComment);
});

app.listen(3001, () => console.log('API running on http://localhost:3001'));
