const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Get all comments
app.get('/api/comments', (req, res) => {
  const stmt = db.prepare('SELECT * FROM comments');
  const comments = stmt.all();
  res.json(comments);
});

// Add an item
app.post('/api/comments', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });

  const stmt = db.prepare('INSERT INTO comments (name) VALUES (?)');
  const info = stmt.run(name);
  res.json({ id: info.lastInsertRowid, name });
});

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});
